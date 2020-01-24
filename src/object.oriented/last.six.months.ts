import { TxDto } from '../dtos';
import {
    isDateLessThanSixMonthsFrom,
    filterPositiveTxs,
} from '../utils';

export class LastSixMonths {
    private readonly incomes: number[];
    private mostRecentTxDate: string | null;

    constructor() {
        this.incomes = [];
        this.mostRecentTxDate = null;
    }

    setMostRecentTxDateIfNeeded(day: string) {
        if (this.mostRecentTxDate === null) {
            this.mostRecentTxDate = day;
        }
    }

    updateIncomes(day, dayTxs: TxDto[]) {
        this.setMostRecentTxDateIfNeeded(day);

        if (isDateLessThanSixMonthsFrom(this.mostRecentTxDate)(day)) {
            const dayPositiveTxs = dayTxs.filter(filterPositiveTxs);

            if (dayPositiveTxs.length > 0) {
                const positiveAmountsOfTheDay = dayPositiveTxs.map(income => income.amount);
                this.incomes.push(...positiveAmountsOfTheDay);
            }
        }
    }

    computeAverageIncome() {
        const numberOfIncomes = this.incomes.length;

        if (numberOfIncomes === 0) { return 0; }

        const averageIncome = this.incomes.reduce(
            (acc: number, income: number) => acc + (income / numberOfIncomes),
            0,
        );

        // unary operator `+` transforms a string to a number
        return +averageIncome.toFixed(0);
    }
}
