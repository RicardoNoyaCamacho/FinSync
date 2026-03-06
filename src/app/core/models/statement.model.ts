export interface Statement {
  statementId: string;
  cardId: string;
  dueDate: string;
  totalAmount: number;
  minimumPayment: number;
  isPaid: boolean;
  createdAt: string;
}
