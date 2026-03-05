import { InstallmentPlan, InstallmentRequest, Transaction as TransactionModel } from './../models/transactions.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Transaction {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  transactions = signal<TransactionModel[]>([]);
  installments = signal<InstallmentPlan[]>([]);
  isLoading = signal<boolean>(false);

  loadTransactions(cardId: string) {
    this.isLoading.set(true);
    this.http.get<TransactionModel[]>(`${this.apiUrl}/transactions/card/${cardId}`).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar transacciones:', err);
        this.isLoading.set(false);
      }
    });
  }

  createTransaction(request: {
    cardId: string;
    amount: number;
    description: string;
    type: 'EXPENSE' | 'PAYMENT';
    category: string;
  }) {
    return this.http.post<string>(`${this.apiUrl}/transactions`, request).pipe(
      tap(() => {
        // Al terminar, recargamos la lista para ver el nuevo movimiento
        this.loadTransactions(request.cardId);
      })
    );
  }

  createInstallmentPlan(request: InstallmentRequest) {
    return this.http.post<void>(`${this.apiUrl}/transactions/installments`, request).pipe(
      tap(() => {
        // Al terminar, recargamos la lista para ver si afectó el saldo
        this.loadTransactions(request.cardId);
      })
    );
  }

  loadInstallments(cardId: string) {
    this.http.get<InstallmentPlan[]>(`${this.apiUrl}/transactions/installments/card/${cardId}`)
      .subscribe({
        next: (data) => this.installments.set(data),
        error: (err) => console.error('Error cargando meses:', err)
      });
  }
}
