import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements OnDestroy {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  notifications = signal<Notification[]>([]);
  isLoading = signal<boolean>(false);

  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  startPolling() {
    this.loadNotifications();
    this.pollingInterval = setInterval(() => this.loadNotifications(), 30_000);
  }

  stopPolling() {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  loadNotifications() {
    this.isLoading.set(true);
    this.http.get<Notification[]>(`${this.apiUrl}/notifications`).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
        this.isLoading.set(false);
      },
    });
  }

  markAsRead(notificationId: string) {
    this.http.patch<Notification>(`${this.apiUrl}/notifications/${notificationId}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
        );
      },
      error: (err) => console.error('Error al marcar notificación como leída:', err),
    });
  }

  deleteNotification(notificationId: string) {
    this.http.delete(`${this.apiUrl}/notifications/${notificationId}`).subscribe({
      next: () => {
        this.notifications.update(list => list.filter(n => n.notificationId !== notificationId));
      },
      error: (err) => console.error('Error al eliminar notificación:', err),
    });
  }

  getDuePayments(cardId: string) {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/${cardId}/due-payments`);
  }

  ngOnDestroy() {
    this.stopPolling();
  }
}
