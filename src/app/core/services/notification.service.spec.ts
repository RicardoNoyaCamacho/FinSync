import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { NotificationService } from './notification.service';
import { Notification } from '../models/notification.model';
import { environment } from '../../../environments/environment';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  const mockNotification = (overrides: Partial<Notification> = {}): Notification => ({
    notificationId: '1',
    type: 'SYSTEM',
    title: 'Test',
    message: 'Hello',
    isRead: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have zero unread count initially', () => {
    expect(service.unreadCount()).toBe(0);
  });

  it('unreadCount should reflect unread notifications', () => {
    service.notifications.set([
      mockNotification({ notificationId: '1', isRead: false }),
      mockNotification({ notificationId: '2', isRead: true }),
    ]);
    expect(service.unreadCount()).toBe(1);
  });

  it('loadNotifications should populate notifications signal', () => {
    const mockList = [
      mockNotification({ notificationId: 'a', isRead: false }),
      mockNotification({ notificationId: 'b', isRead: true }),
    ];

    service.loadNotifications();
    const req = httpMock.expectOne(`${environment.apiUrl}/notifications`);
    expect(req.request.method).toBe('GET');
    req.flush(mockList);

    expect(service.notifications().length).toBe(2);
    expect(service.unreadCount()).toBe(1);
  });

  it('markAsRead should PATCH the endpoint and update the signal', () => {
    service.notifications.set([mockNotification({ notificationId: 'abc', isRead: false })]);

    service.markAsRead('abc');
    const req = httpMock.expectOne(`${environment.apiUrl}/notifications/abc/read`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockNotification({ notificationId: 'abc', isRead: true }));

    expect(service.notifications()[0].isRead).toBe(true);
    expect(service.unreadCount()).toBe(0);
  });

  it('deleteNotification should DELETE the endpoint and remove from signal', () => {
    service.notifications.set([mockNotification({ notificationId: 'del1' })]);

    service.deleteNotification('del1');
    const req = httpMock.expectOne(`${environment.apiUrl}/notifications/del1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.notifications().length).toBe(0);
  });
});
