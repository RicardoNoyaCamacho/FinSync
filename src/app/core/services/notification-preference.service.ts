import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationPreference } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationPreferenceService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  preference = signal<NotificationPreference | null>(null);
  isLoading = signal<boolean>(false);

  loadPreferences() {
    this.isLoading.set(true);
    this.http.get<NotificationPreference>(`${this.apiUrl}/preferences/notifications`).subscribe({
      next: (data) => {
        this.preference.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar preferencias de notificación:', err);
        this.isLoading.set(false);
      },
    });
  }

  updatePreferences(data: { sendPaymentReminders?: boolean; reminderDaysBefore?: number }) {
    return this.http
      .patch<NotificationPreference>(`${this.apiUrl}/preferences/notifications`, data)
      .pipe(tap((updated) => this.preference.set(updated)));
  }
}
