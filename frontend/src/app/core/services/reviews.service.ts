import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  CreateReviewRequest,
  ProfessionalReviewsResponse,
  Review,
  UpdateReviewRequest,
} from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/reviews`;

  getByProfessional(
    professionalId: number,
  ): Observable<ProfessionalReviewsResponse> {
    return this.http.get<ProfessionalReviewsResponse>(
      `${this.apiUrl}/professional/${professionalId}`,
    );
  }

  create(data: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, data);
  }

  update(
    reviewId: number,
    data: UpdateReviewRequest,
  ): Observable<Review> {
    return this.http.patch<Review>(
      `${this.apiUrl}/${reviewId}`,
      data,
    );
  }

  remove(reviewId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${reviewId}`,
    );
  }
}