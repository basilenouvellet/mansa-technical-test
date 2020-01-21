import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { AccountDto, AnswerDto, TxDto } from './dtos';
import {
  computeAverageAmount,
  computeMinMaxBalanceBackwards,
  filterLessThanSixMonthsTxs,
  filterPositiveTxs,
  sortAscTxsByTimestamp,
  SIX_MONTHS_IN_MILLISECONDS,
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

  // async getAnswerVerify(): Promise<{ 'answer': string }> {
  async getAnswerVerify(): Promise<any> {
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

  fetchAllTxs(anyAccountId: string): Promise<{ [accountId: string]: TxDto[] }> {
    return this._fetchJson(`/accounts/${anyAccountId}/transactions?all=true`);
  }

  // fetchTxs(accountId: string, from: string, to: string): Promise<TxDto[]> {
    // return this._fetchJson(`/accounts/${accountId}/transactions?from=${from}&to=${to}`);
  // }

  async getAllTxsSorted(accounts: AccountDto[]): Promise<TxDto[]> {
    const anyAccountId = accounts[0].account_id;
    const allTxs = await this.fetchAllTxs(anyAccountId);

    const aggregateTxs = (acc: TxDto[], accountTxs: TxDto[]) => [...acc, ...accountTxs];

    return Object.values(allTxs)
      .reduce(aggregateTxs, [])
      .sort(sortAscTxsByTimestamp);
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

    // `+date` gives the date in milliseconds
    const userActivityDurationInMilliseconds = +mostRecentTxDate - +oldestTxDate;

    const THREE_YEARS_IN_MILLISECONDS = 6 * SIX_MONTHS_IN_MILLISECONDS;
    return userActivityDurationInMilliseconds > THREE_YEARS_IN_MILLISECONDS;
  }

  async _fetchJson(endpoint: string, ...args): Promise<any> {
    const res = await fetch(BASE_URL + endpoint, ...args);
    return await res.json();
  }
}
