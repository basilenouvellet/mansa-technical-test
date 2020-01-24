import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import {
  TxDto,
  AnswerDto,
  AccountDto,
  AnswerVerifyDto,
} from './dtos';
import {
  computeAverageAmount,
  computeMinMaxBalanceBackwards,
  filterLessThanSixMonthsTxs,
  filterPositiveTxs,
  sortAscTxsByTimestamp,
  convertDateObjectToDate,
  addDaysToDate,
  isDurationLongerThanThreeYears,
  flattenNestedArrayOfDepthOne,
} from './utils';

const BASE_URL = 'https://kata.getmansa.com';

@Injectable()
export class AppService {

  async getAnswer(): Promise<AnswerDto> {
    const accounts = await this.fetchAccounts();
    const allTxsSorted = await this.getAllTxsSorted(accounts);

    const [min_balance, max_balance] = this.getMinMaxBalance(allTxsSorted, accounts);

    return {
      '6_month_average_income': this.getLastSixMonthsAverageIncome(allTxsSorted),
      '3_years_activity': this.getThreeYearsOfActivity(allTxsSorted),
      max_balance,
      min_balance,
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

  async fetchAllTxs(accounts: AccountDto[]): Promise<TxDto[]> {
    const promisesArray = accounts
      .map(async account => {
        const { account_id } = account;

        const oldestTx = await this.fetchOldestTx(account_id);

        const oldestTxDateObject = new Date(oldestTx.timestamp);

        let txs: TxDto[] = [];

        const todayDateObject = new Date();
        const todayDate = convertDateObjectToDate(todayDateObject);

        let from = convertDateObjectToDate(oldestTxDateObject);
        let to = addDaysToDate(365, from);

        do {
          const partialTxs = await this.fetchTxs(account_id, from, to);

          txs = [...txs, ...partialTxs];

          from = addDaysToDate(1, to);
          to = addDaysToDate(365, from);
        } while (from <= todayDate);

        return txs;
      });

    const nestedAllTxs = await Promise.all(promisesArray);

    // Array.flat or Array.flatMap only available in Node v11+
    return flattenNestedArrayOfDepthOne(nestedAllTxs);
  }

  fetchOldestTx(accountId: string): Promise<TxDto> {
    return this._fetchJson(`/accounts/${accountId}/transactions`);
  }

  fetchTxs(accountId: string, from: string, to: string): Promise<TxDto[]> {
    return this._fetchJson(`/accounts/${accountId}/transactions?from=${from}&to=${to}`);
  }

  async getAllTxsSorted(accounts: AccountDto[]): Promise<TxDto[]> {
    const allTxs = await this.fetchAllTxs(accounts);
    return allTxs.sort(sortAscTxsByTimestamp);
  }

  getMinMaxBalance(allTxsSorted: TxDto[], accounts: AccountDto[]): number[] {
    const currentBalanceAggregated = accounts.reduce((acc, account) => acc + account.current, 0);

    const [minBalance, maxBalance] = allTxsSorted.reduce(
      computeMinMaxBalanceBackwards,
      [0, 0, currentBalanceAggregated],
    );

    // unary operator `+` transforms a string to a number
    return [
      +minBalance.toFixed(0),
      +maxBalance.toFixed(0),
    ];
  }

  getLastSixMonthsAverageIncome(allTxsSorted: TxDto[]): number {
    const mostRecentTxDate = new Date(allTxsSorted[0].timestamp);

    const averageAmount = allTxsSorted
      .filter(filterLessThanSixMonthsTxs(mostRecentTxDate))
      .filter(filterPositiveTxs)
      .reduce(computeAverageAmount, 0)
      .toFixed(0);

    // unary operator `+` transforms a string to a number
    return +averageAmount;
  }

  getThreeYearsOfActivity(allTxsSorted: TxDto[]): boolean {
    const mostRecentTxDate = new Date(allTxsSorted[0].timestamp);
    const oldestTxDate = new Date(allTxsSorted[allTxsSorted.length - 1].timestamp);

    return isDurationLongerThanThreeYears(oldestTxDate, mostRecentTxDate);
  }

  async _fetchJson(endpoint: string, ...args): Promise<any> {
    const res = await fetch(BASE_URL + endpoint, ...args);
    return await res.json();
  }
}
