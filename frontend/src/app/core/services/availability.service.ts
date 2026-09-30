import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Observable,
} from 'rxjs';
import {
  AvailabilityRoleFilter,
  AvailabilitySlot,
  AvailableSlotByDate,
  CreateAvailabilitySlotRequest,
} from '../models/availability-slot.model';

@Injectable({
  providedIn: 'root',
})
export class AvailabilityService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/availability';

  getAvailableByDate(
    date: string,
    role?: AvailabilityRoleFilter,
  ): Observable<AvailableSlotByDate[]> {
    let params =
      new HttpParams().set(
        'date',
        date,
      );

    if (role !== undefined) {
      params = params.set(
        'role',
        role,
      );
    }

    return this.http.get<
      AvailableSlotByDate[]
    >(
      `${this.apiUrl}/date`,
      {
        params,
      },
    );
  }

  getAvailableByProfessional(
    professionalId: number,
  ): Observable<AvailabilitySlot[]> {
    return this.http.get<
      AvailabilitySlot[]
    >(
      `${this.apiUrl}/professional/${professionalId}`,
    );
  }

  getMine():
    Observable<AvailabilitySlot[]> {
    return this.http.get<
      AvailabilitySlot[]
    >(
      `${this.apiUrl}/me`,
    );
  }

  create(
    data: CreateAvailabilitySlotRequest,
  ): Observable<AvailabilitySlot> {
    return this.http.post<
      AvailabilitySlot
    >(
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