import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private _token = signal<string | null>(localStorage.getItem('jwt_token'));

  public isLoggedIn = computed(() => {
    const token = this._token();

    return !!token && token !== 'null' && token !== 'undefined' && token.trim() !== '';
  });

  login(credentials: { email: string, password: string }) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/authenticate`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token)
        })
      );
  }

  register(userData: { username: string, email: string, password: string }) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.setToken(response.token);
        })
      );
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  private setToken(token: string) {
    localStorage.setItem('jwt_token', token);
    this._token.set(token);
  }

  getToken() {
    return this._token();
  }

  resendVerification() {
    return this.http.post(`${this.apiUrl}/auth/resend-verification`, {}, { responseType: 'text' });
  }

}
