export class TxDto {
    readonly timestamp: string;
    readonly transaction_type: string;
    readonly transaction_category: string;
    readonly amount: number;
    readonly currency: string;
    readonly status: string;
}
