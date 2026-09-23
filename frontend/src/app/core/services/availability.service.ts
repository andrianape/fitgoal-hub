import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AvailabilitySlot } from '../models/availability-slot.model';

@Injectable({
  providedIn: 'root',
})
export class AvailabilityService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/availability';

  getAvailableByProfessional(
    professionalId: number,
  ): Observable<AvailabilitySlot[]> {
    return this.http.get<AvailabilitySlot[]>(
      `${this.apiUrl}/professional/${professionalId}`,
    );
  }
}