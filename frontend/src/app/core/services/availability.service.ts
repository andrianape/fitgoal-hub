import {
  HttpClient,
} from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Observable,
} from 'rxjs';
import {
  AvailabilitySlot,
  CreateAvailabilitySlotRequest,
} from '../models/availability-slot.model';

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

  getMine(): Observable<AvailabilitySlot[]> {
    return this.http.get<AvailabilitySlot[]>(
      `${this.apiUrl}/me`,
    );
  }

  create(
    data: CreateAvailabilitySlotRequest,
  ): Observable<AvailabilitySlot> {
    return this.http.post<AvailabilitySlot>(
      this.apiUrl,
      data,
    );
  }

  remove(
    slotId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${slotId}`,
    );
  }
}