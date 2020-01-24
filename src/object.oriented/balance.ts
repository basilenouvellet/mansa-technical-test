import { TxDto, AccountDto } from '../dtos';
import {
    computeMinMaxBalanceBackwards,
} from '../utils';

export class Balance {
    private min: number;
    private max: number;
    private total: number;

    constructor(accounts: AccountDto[]) {
        const currentTotalBalance = this.computeCurrentTotalBalance(accounts);

        this.min = currentTotalBalance;
        this.max = currentTotalBalance;
        this.total = currentTotalBalance;
    }

    computeCurrentTotalBalance(accounts: AccountDto[]) {
        return accounts.reduce(
            (acc: number, account: AccountDto) => acc + account.current,
            0,
        );
    }

    updateMinMax(dayTxs: TxDto[]) {
        [
            this.min,
            this.max,
            this.total,
        ] = dayTxs.reduce(
            computeMinMaxBalanceBackwards,
            [this.min, this.max, this.total],
        );
    }

    getMin() {
        // unary operator `+` transforms a string to a number
        return +this.min.toFixed(0);
    }

    getMax() {
        // unary operator `+` transforms a string to a number
        return +this.max.toFixed(0);
    }
}
