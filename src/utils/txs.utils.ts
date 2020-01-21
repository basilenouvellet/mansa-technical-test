import { TxDto } from '../dtos';

export const SIX_MONTHS_IN_MILLISECONDS = 15778800000;

export const computeAverageAmount = (
    acc: number,
    tx: TxDto,
    _index: number,
    txs: TxDto[],
) => acc + (tx.amount / txs.length);

export const computeMinMaxBalanceBackwards = (
    [min, max, balance]: number[],
    tx: TxDto,
) => {
    // we start with the current aggregated balance
    // and compute the balance before the current transaction at every step

    // amount can be + or -
    const previousBalance = balance - tx.amount;

    const updatedMin = Math.min(min, balance);
    const updatedMax = Math.max(max, balance);

    return [updatedMin, updatedMax, previousBalance];
};

export const filterLessThanSixMonthsTxs = (mostRecentTxDate: Date) => (tx: TxDto) => {
    const txDate = new Date(tx.timestamp);

    // `+date` gives the date in milliseconds
    return +txDate > (+mostRecentTxDate - SIX_MONTHS_IN_MILLISECONDS);
};

export const filterPositiveTxs = (tx: TxDto) => tx.amount > 0;

export const sortAscTxsByTimestamp = (a: TxDto, b: TxDto) => {
    const aDate = new Date(a.timestamp);
    const bDate = new Date(b.timestamp);

    // `+date` gives the date in milliseconds
    return +bDate - +aDate;
};
