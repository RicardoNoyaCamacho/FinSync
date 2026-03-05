export interface CreditCard {
  cardId: string;
  alias: string;
  last4Digits: string;
  currentBalance: number;
  creditLimit: number;
  cutoffDay: number;
}

export interface CreditCardRequest {
  alias: string;
  last4Digits: string;
  cutoffDay: number;
  creditLimit: number;
}
