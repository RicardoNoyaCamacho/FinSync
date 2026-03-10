import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../core/services/auth';
import { Card } from '../../core/services/card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationCenterComponent } from '../../shared/components/notification-center/notification-center.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NotificationCenterComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private authService = inject(Auth);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  cardService = inject(Card);

  isModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showEmailBanner = signal<boolean>(!localStorage.getItem('email_banner_dismissed'));
  isResending = signal<boolean>(false);
  resendSuccess = signal<boolean>(false);

  cardForm = this.fb.nonNullable.group({
    alias: ['', [Validators.required]],
    last4Digits: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    creditLimit: [0, [Validators.required, Validators.min(1)]],
    cutoffDay: [1, [Validators.required, Validators.min(1), Validators.max(31)]]
  })

  ngOnInit(): void {
    this.cardService.loadMyCards();
  }

  onLogout() {
    this.authService.logout();
  }

  dismissEmailBanner() {
    this.showEmailBanner.set(false);
    localStorage.setItem('email_banner_dismissed', 'true');
  }

  onResendVerification() {
    this.isResending.set(true);
    this.authService.resendVerification().subscribe({
      next: () => {
        this.isResending.set(false);
        this.resendSuccess.set(true);
      },
      error: (err) => {
        this.isResending.set(false);
        const errorMessage: string = err?.error ?? '';
        if (err?.status === 400 || errorMessage.toLowerCase().includes('ya está verificado')) {
          this.dismissEmailBanner();
        }
      }
    });
  }

  openModal() {
    this.isModalOpen.set(true);
    this.cardForm.reset({
      alias: '',
      last4Digits: '',
      creditLimit: 0,
      cutoffDay: 1
    });

    this.cdr.detectChanges();
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.cardForm.reset({
      alias: '',
      last4Digits: '',
      creditLimit: 0,
      cutoffDay: 1
    });

  }

  onSubmitCard() {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.cardService.createCard(this.cardForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error("Error al crear la tarjeta", err);
        this.isSubmitting.set(false);
      }
    });
  }
}
