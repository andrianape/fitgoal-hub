import { Injectable } from '@angular/core';
import { AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  private readonly storageKey =
    'fitgoal_auth';

  saveSession(session: AuthResponse): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(session),
    );
  }

  getSession(): AuthResponse | null {
    const storedSession =
      localStorage.getItem(this.storageKey);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(
        storedSession,
      ) as AuthResponse;
    } catch {
      this.clearSession();

      return null;
    }
  }

  getAccessToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
  }
}