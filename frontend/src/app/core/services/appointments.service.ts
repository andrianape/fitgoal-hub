import { HttpClient } from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/appointments';

  create(
    data: CreateAppointmentRequest,
  ): Observable<Appointment> {
    return this.http.post<Appointment>(
      this.apiUrl,
      data,
    );
  }

  findMine(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/me`,
    );
  }

  cancel(
    appointmentId: number,
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.apiUrl}/${appointmentId}/cancel`,
      {},
    );
  }

  updateStatus(
    appointmentId: number,
    data: UpdateAppointmentStatusRequest,
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.apiUrl}/${appointmentId}/status`,
      data,
    );
  }
}