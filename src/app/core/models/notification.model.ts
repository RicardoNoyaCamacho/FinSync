export interface Notification {
  notificationId: string;
  type: 'PAYMENT_DUE' | 'PAYMENT_REMINDER' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  cardId?: string;
  createdAt: string;
}

export interface NotificationPreference {
  preferenceId: string;
  sendPaymentReminders: boolean;
  reminderDaysBefore: number;
}
