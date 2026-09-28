import { HttpClient } from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreatePlanRequest,
  Plan,
  UpdatePlanRequest,
} from '../models/plan.model';

@Injectable({
  providedIn: 'root',
})
export class PlansService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/plans';

  findMine(): Observable<Plan[]> {
    return this.http.get<Plan[]>(
      `${this.apiUrl}/me`,
    );
  }

  findOne(
    planId: number,
  ): Observable<Plan> {
    return this.http.get<Plan>(
      `${this.apiUrl}/${planId}`,
    );
  }

  create(
    data: CreatePlanRequest,
  ): Observable<Plan> {
    return this.http.post<Plan>(
      this.apiUrl,
      data,
    );
  }

  update(
    planId: number,
    data: UpdatePlanRequest,
  ): Observable<Plan> {
    return this.http.patch<Plan>(
      `${this.apiUrl}/${planId}`,
      data,
    );
  }

  remove(
    planId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${planId}`,
    );
  }
}