import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Statement } from '../models/statement.model';

@Injectable({
  providedIn: 'root',
})
export class StatementService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  statements = signal<Statement[]>([]);
  isLoading = signal<boolean>(false);

  loadStatements(cardId: string) {
    this.isLoading.set(true);
    this.http.get<Statement[]>(`${this.apiUrl}/notifications/${cardId}/due-payments`).subscribe({
      next: (data) => {
        this.statements.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar estados de cuenta:', err);
        this.isLoading.set(false);
      },
    });
  }

  daysUntilDue(statement: Statement): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(statement.dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  urgencyClass(statement: Statement): 'green' | 'yellow' | 'red' {
    const days = this.daysUntilDue(statement);
    if (days > 5) return 'green';
    if (days >= 3) return 'yellow';
    return 'red';
  }

  markAsPayment(statementId: string) {
    return this.http.post<void>(`${this.apiUrl}/statements/${statementId}/pay`, {});
  }
}
