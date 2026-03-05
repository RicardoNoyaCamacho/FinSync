export interface Transaction {
  transactionId: string;
  amount: number;
  description: string;
  type: 'EXPENSE' | 'PAYMENT';
  category: string;
  transactionDate: string;
  status: string;
}

export interface InstallmentRequest {
  cardId: string;
  description: string;
  totalAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  originalDate: string; // Formato YYYY-MM-DD
}

export interface InstallmentPlan {
  planId: string;
  description: string;
  totalAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  originalPurchaseDate: string;
}
