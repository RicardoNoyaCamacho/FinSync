export interface Statement {
  statementId: string;
  cardId: string;
  periodStartDate: string;
  periodEndDate: string;
  dueDate: string;
  totalBalance: number;      // era totalAmount
  minPayment: number;        // era minimumPayment
  bonifiablePayment: number;
  isPaid: boolean;
}
