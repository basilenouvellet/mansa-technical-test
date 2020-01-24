import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import {
  TxDto,
  AnswerDto,
  AccountDto,
  AnswerVerifyDto,
} from '../dtos';
import {
  filterTxsOfDate,
  sortTxsByTimestamp,
  convertTimestampToDate,
  convertDateObjectToDate,
  addDaysToDate,
  flattenNestedArrayOfDepthOne,
  getDescendingDatesBetween,
} from '../utils';
import { Balance } from './balance';
import { LastSixMonths } from './last.six.months';
import { ThreeYearsActivity } from './three.years.activity';

const BASE_URL = 'https://kata.getmansa.com';

@Injectable()
export class AppObjectOrientedService {

  async getAnswer(): Promise<AnswerDto> {
    const accounts = await this.fetchAccounts();

    const oldestTxDate = await this.getOldestTxDate(accounts);

    const {
      lastSixMonthsAverageIncome,
      hasThreeYearsActivity,
      minBalance,
      maxBalance,
    } = await this.getAnswerMainFetchLoop(accounts, oldestTxDate);

    return {
      '6_month_average_income': lastSixMonthsAverageIncome,
      '3_years_activity': hasThreeYearsActivity,
      'max_balance': maxBalance,
      'min_balance': minBalance,
    };
  }

  async getAnswerVerify(): Promise<AnswerVerifyDto> {
    const answer = await this.getAnswer();

    return await this._fetchJson('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answer),
    });
  }

  fetchAccounts(): Promise<AccountDto[]> {
    return this._fetchJson('/accounts');
  }

  async getOldestTxDate(accounts: AccountDto[]): Promise<string> {
    const oldestTxsPromises = accounts.map(account => this.fetchOldestTx(account.account_id));
    const oldestTxs = await Promise.all(oldestTxsPromises);

    const oldestTx = oldestTxs.sort(sortTxsByTimestamp('desc'))[0];

    return convertTimestampToDate(oldestTx.timestamp);
  }

  async getAnswerMainFetchLoop(accounts: AccountDto[], oldestTxDate: string) {
    let [from, to] = this.getInitialFromToDates();

    const balance = new Balance(accounts);
    const lastSixMonths = new LastSixMonths();
    const threeYearsActivity = new ThreeYearsActivity(oldestTxDate);

    do {
      const txs = await this.fetchTxsFromAllAccounts(accounts, from, to);

      getDescendingDatesBetween(from, to).forEach(day => {
        const dayTxs = this.getSortedTxsOfTheDay(txs, day);

        if (dayTxs.length > 0) {
          balance.updateMinMax(dayTxs);
          lastSixMonths.updateIncomes(day, dayTxs);
          threeYearsActivity.updateIsReached(day);
        }
      });

      [from, to] = this.updateFromToDates(from, to, oldestTxDate);
    } while (from !== oldestTxDate);

    return {
      lastSixMonthsAverageIncome: lastSixMonths.computeAverageIncome(),
      hasThreeYearsActivity: threeYearsActivity.isReached,
      minBalance: balance.getMin(),
      maxBalance: balance.getMax(),
    };
  }

  getSortedTxsOfTheDay(txs: TxDto[], day: string) {
    return txs
      .filter(filterTxsOfDate(day))
      .sort(sortTxsByTimestamp('asc'));
  }

  getInitialFromToDates() {
    const todayDate = convertDateObjectToDate(new Date());

    const from = addDaysToDate(-365, todayDate);
    const to = todayDate;

    return [from, to];
  }

  updateFromToDates(from: string, to: string, oldestTxDate: string) {
      const updatedTo = addDaysToDate(-1, from);
      let updatedFrom = addDaysToDate(-365, updatedTo);

      if (updatedFrom < oldestTxDate) {
        updatedFrom = oldestTxDate;
      }

      return [updatedFrom, updatedTo];
  }

  fetchOldestTx(accountId: string): Promise<TxDto> {
    return this._fetchJson(`/accounts/${accountId}/transactions`);
  }

  fetchTxs(accountId: string, from: string, to: string): Promise<TxDto[]> {
    return this._fetchJson(`/accounts/${accountId}/transactions?from=${from}&to=${to}`);
  }

  async fetchTxsFromAllAccounts(accounts: AccountDto[], from: string, to: string): Promise<TxDto[]> {
    const txsPromises = accounts.map(account => this.fetchTxs(account.account_id, from, to));
    const txs = await Promise.all(txsPromises);

    // Array.flat or Array.flatMap only available in Node v11+
    return flattenNestedArrayOfDepthOne(txs);
  }

  async _fetchJson(endpoint: string, ...args): Promise<any> {
    const res = await fetch(BASE_URL + endpoint, ...args);
    return await res.json();
  }
}
