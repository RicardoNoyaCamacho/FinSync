import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreditCard, CreditCardRequest } from '../models/card.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Card {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  cards = signal<CreditCard[]>([]);
  isLoading = signal<boolean>(false);

  loadMyCards() {
    this.isLoading.set(true);
    this.http.get<CreditCard[]>(`${this.apiUrl}/cards`).subscribe({
      next: (data) => {
        this.cards.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar las tarjetas", err);
        this.isLoading.set(false);
      }
    });
  }

  createCard(cardData: CreditCardRequest) {
    return this.http.post<CreditCard>(`${this.apiUrl}/cards`, cardData).pipe(
      tap((newCard) => {
        this.cards.update(currentCards => [...currentCards, newCard]);
      })
    )
  }

  getCardById(cardId: string) {
    return this.http.get<CreditCard>(`${this.apiUrl}/cards/${cardId}`);
  }

  updateCard(cardId: string, data: { alias: string; cutoffDay: number; creditLimit: number; daysToPay: number }) {
    return this.http.patch<CreditCard>(`${this.apiUrl}/cards/${cardId}`, data);
  }
}
