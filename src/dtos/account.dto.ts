export class AccountDto {
  readonly account_id: string;
  readonly account_type: 'ACCOUNT' | 'DEBIT';
  readonly iban: string;
  readonly swift_bic: string;
  readonly sort_code: string;
  readonly account_number: string;
  readonly currency: string;
  readonly available: number;
  readonly current: number;
  readonly update_timestamp: string;
}
