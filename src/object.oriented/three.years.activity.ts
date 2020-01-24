import {
    addDaysToDate,
} from '../utils';

export class ThreeYearsActivity {
    public isReached: boolean;
    private readonly limitDate: string;

    constructor(oldestTxDate: string) {
        this.limitDate = addDaysToDate(3 * 365, oldestTxDate);
        this.isReached = false;
    }

    updateIsReached(day: string) {
        if (
            !this.isReached
            && day >= this.limitDate
        ) {
            this.isReached = true;
        }
    }
}
