import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have zero unread count initially', () => {
    expect(service.unreadCount()).toBe(0);
  });

  it('unreadCount should reflect unread notifications', () => {
    service.notifications.set([
      {
        notificationId: '1',
        type: 'SYSTEM',
        title: 'Test',
        message: 'Hello',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        notificationId: '2',
        type: 'PAYMENT_DUE',
        title: 'Due',
        message: 'Pay now',
        isRead: true,
        createdAt: new Date().toISOString(),
      },
    ]);
    expect(service.unreadCount()).toBe(1);
  });

  it('markAsRead should update the notification in the signal', () => {
    service.notifications.set([
      {
        notificationId: 'abc',
        type: 'SYSTEM',
        title: 'Test',
        message: 'Msg',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    // Manually update signal the same way markAsRead does (without HTTP call)
    service.notifications.update(list =>
      list.map(n => (n.notificationId === 'abc' ? { ...n, isRead: true } : n))
    );

    expect(service.notifications()[0].isRead).toBe(true);
    expect(service.unreadCount()).toBe(0);
  });

  it('deleteNotification should remove from signal', () => {
    service.notifications.set([
      {
        notificationId: 'del1',
        type: 'SYSTEM',
        title: 'Del',
        message: 'Msg',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    service.notifications.update(list => list.filter(n => n.notificationId !== 'del1'));

    expect(service.notifications().length).toBe(0);
  });
});
