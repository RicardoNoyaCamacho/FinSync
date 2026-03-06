import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Transaction } from '../../core/services/transaction';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Card } from '../../core/services/card';
import { CreditCard } from '../../core/models/card.model';
import { InstallmentRequest } from '../../core/models/transactions.model';
import { ExpenseChartComponent } from './components/expense-chart/expense-chart';
import { StatementService } from '../../core/services/statement.service';

@Component({
  selector: 'app-card-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ExpenseChartComponent],
  templateUrl: './card-detail.html',
  styleUrl: './card-detail.css',
})
export class CardDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  transactionService = inject(Transaction);
  cardService = inject(Card);
  statementService = inject(StatementService);

  cardId: string = '';
  currentCard = signal<CreditCard | null>(null);

  isModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  isEditModalOpen = signal(false);
  isUpdatingCard = signal(false);

  activeTab = signal<'MOVIMIENTOS' | 'MSI' | 'STATS' | 'PAGOS'>('MOVIMIENTOS');

  editCardForm = this.fb.nonNullable.group({
    alias: ['', Validators.required],
    cutoffDay: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    creditLimit: [0, [Validators.required, Validators.min(1)]]
  });

  transactionForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['', Validators.required],
    type: ['EXPENSE', Validators.required], // Valor por defecto: Gasto
    category: ['General', Validators.required],
    totalInstallments: [0], // Cuántos meses son
    paidInstallments: [0],  // Cuántos ya pagaste
    originalDate: ['']      // Cuándo la compraste
  });

  ngOnInit() {
    this.cardId = this.route.snapshot.paramMap.get('id') || '';

    if (this.cardId) {
      this.loadData();
    }
  }
  loadData() {
    // Cargamos TODO: Tarjeta, Transacciones y AHORA TAMBIÉN los Planes
    this.transactionService.loadTransactions(this.cardId);
    this.transactionService.loadInstallments(this.cardId); // <--- NUEVO
    this.statementService.loadStatements(this.cardId);

    this.cardService.getCardById(this.cardId).subscribe({
      next: (card) => this.currentCard.set(card),
      error: (err) => console.error('Error al cargar tarjeta:', err)
    });
  }

  openModal() {
    this.isModalOpen.set(true);
    // Reiniciamos con valores por defecto
    this.transactionForm.reset({
      amount: 0,
      description: '',
      type: 'EXPENSE',
      category: 'General'
    });
    this.cdr.detectChanges(); // Forzamos pintado inmediato
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  // Helper para cambiar el tipo visualmente (Gasto vs Pago)
  setTransactionType(type: 'EXPENSE' | 'PAYMENT' | 'INSTALLMENT') {
    this.transactionForm.patchValue({ type });
  }

  onSubmitTransaction() {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.transactionForm.getRawValue();

    if (formValue.type === 'INSTALLMENT') {

      // 1. ES UN PLAN DE MESES (MSI)
      const installmentPayload: InstallmentRequest = {
        cardId: this.cardId,
        description: formValue.description,
        totalAmount: formValue.amount,
        totalInstallments: formValue.totalInstallments,
        paidInstallments: formValue.paidInstallments,
        // Si no puso fecha, mandamos la de hoy
        originalDate: formValue.originalDate || new Date().toISOString().split('T')[0]
      };

      this.transactionService.createInstallmentPlan(installmentPayload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });

    } else {

      // 2. ES UN GASTO O PAGO NORMAL (Tu lógica anterior)
      const requestPayload = {
        cardId: this.cardId,
        amount: formValue.amount,
        description: formValue.description,
        type: formValue.type as 'EXPENSE' | 'PAYMENT',
        category: formValue.category
      };

      this.transactionService.createTransaction(requestPayload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess() {
    this.isSubmitting.set(false);
    this.closeModal();
    this.loadData();
  }

  private handleError(err: any) {
    console.error('Error en transacción:', err);
    this.isSubmitting.set(false);
  }

  switchTab(tab: 'MOVIMIENTOS' | 'MSI' | 'STATS' | 'PAGOS') {
    this.activeTab.set(tab);
  }

  openEditModal() {
    const card = this.currentCard();
    if (card) {
      this.editCardForm.patchValue({
        alias: card.alias,
        cutoffDay: card.cutoffDay,
        creditLimit: card.creditLimit
      });
      this.isEditModalOpen.set(true);
    }
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
  }

  onUpdateCard() {
    if (this.editCardForm.invalid) return;

    this.isUpdatingCard.set(true);
    const formValue = this.editCardForm.getRawValue();

    this.cardService.updateCard(this.cardId, formValue).subscribe({
      next: (updatedCard) => {
        // Actualizamos la tarjeta en pantalla sin recargar
        this.currentCard.set(updatedCard);
        this.isUpdatingCard.set(false);
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error actualizando tarjeta', err);
        this.isUpdatingCard.set(false);
      }
    });
  }

  onMarkAsPaid(statementId: string) {
    this.statementService.markAsPayment(statementId).subscribe({
      next: () => this.statementService.loadStatements(this.cardId),
      error: (err) => console.error('Error al marcar como pagado:', err),
    });
  }
}
