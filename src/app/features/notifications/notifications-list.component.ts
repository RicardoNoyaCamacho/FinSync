import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';

type FilterType = 'ALL' | 'PAYMENT_DUE' | 'PAYMENT_REMINDER' | 'SYSTEM';

@Component({
  selector: 'app-notifications-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.css',
})
export class NotificationsListComponent implements OnInit {
  notificationService = inject(NotificationService);

  activeFilter = signal<FilterType>('ALL');

  filters: { label: string; value: FilterType }[] = [
    { label: 'Todas', value: 'ALL' },
    { label: 'Pago Próximo', value: 'PAYMENT_DUE' },
    { label: 'Recordatorio', value: 'PAYMENT_REMINDER' },
    { label: 'Sistema', value: 'SYSTEM' },
  ];

  get filteredNotifications(): Notification[] {
    const filter = this.activeFilter();
    const all = [...this.notificationService.notifications()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filter === 'ALL') return all;
    return all.filter(n => n.type === filter);
  }

  ngOnInit() {
    this.notificationService.loadNotifications();
  }

  setFilter(filter: FilterType) {
    this.activeFilter.set(filter);
  }

  onMarkAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  onDelete(notificationId: string) {
    this.notificationService.deleteNotification(notificationId);
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      PAYMENT_DUE: 'Pago Vencido',
      PAYMENT_REMINDER: 'Recordatorio',
      SYSTEM: 'Sistema',
    };
    return labels[type] ?? type;
  }

  typeIcon(type: string): string {
    const icons: Record<string, string> = {
      PAYMENT_DUE: '🔴',
      PAYMENT_REMINDER: '🟡',
      SYSTEM: '🔔',
    };
    return icons[type] ?? '📢';
  }
}
