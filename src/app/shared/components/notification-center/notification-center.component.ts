import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-center',
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.css',
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notificationService = inject(NotificationService);

  isOpen = signal(false);

  get previewNotifications() {
    return this.notificationService.notifications().slice(0, 5);
  }

  ngOnInit() {
    this.notificationService.startPolling();
  }

  ngOnDestroy() {
    this.notificationService.stopPolling();
  }

  togglePanel() {
    this.isOpen.update(v => !v);
  }

  closePanel() {
    this.isOpen.set(false);
  }

  onNotificationClick(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  onDelete(event: Event, notificationId: string) {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId);
  }
}
