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
  API_BASE_URL,
} from '../config/api.config';
import {
  CreateProfessionalProfileRequest,
  Professional,
  ProfessionalFilters,
  UpdateProfessionalProfileRequest,
  UpdateProfessionalVerificationRequest,
} from '../models/professional.model';
import {
  PaginatedResponse,
} from '../models/paginated-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProfessionalsService {
  private readonly http =
    inject(HttpClient);

  getAll(
    filters: ProfessionalFilters,
  ): Observable<
    PaginatedResponse<Professional>
  > {
    let params =
      new HttpParams()
        .set(
          'page',
          filters.page,
        )
        .set(
          'limit',
          filters.limit,
        );

    if (filters.role) {
      params = params.set(
        'role',
        filters.role,
      );
    }

    if (
      filters.cityId !== undefined
    ) {
      params = params.set(
        'cityId',
        filters.cityId,
      );
    }

    if (
      filters.specialty?.trim()
    ) {
      params = params.set(
        'specialty',
        filters.specialty.trim(),
      );
    }

    if (
      filters.maxPrice !== undefined
    ) {
      params = params.set(
        'maxPrice',
        filters.maxPrice,
      );
    }

    if (filters.search?.trim()) {
      params = params.set(
        'search',
        filters.search.trim(),
      );
    }

    return this.http.get<
      PaginatedResponse<Professional>
    >(
      `${API_BASE_URL}/professionals`,
      {
        params,
      },
    );
  }

  getOne(
    id: number,
  ): Observable<Professional> {
    return this.http.get<Professional>(
      `${API_BASE_URL}/professionals/${id}`,
    );
  }

  getOwnProfile():
    Observable<Professional> {
    return this.http.get<Professional>(
      `${API_BASE_URL}/professionals/profile/me`,
    );
  }

  createProfile(
    data:
      CreateProfessionalProfileRequest,
  ): Observable<Professional> {
    return this.http.post<Professional>(
      `${API_BASE_URL}/professionals/profile`,
      data,
    );
  }

  updateProfile(
    data:
      UpdateProfessionalProfileRequest,
  ): Observable<Professional> {
    return this.http.patch<Professional>(
      `${API_BASE_URL}/professionals/profile`,
      data,
    );
  }

  getAllForAdmin():
    Observable<Professional[]> {
    return this.http.get<
      Professional[]
    >(
      `${API_BASE_URL}/professionals/admin/all`,
    );
  }

  updateVerification(
    professionalId: number,
    data:
      UpdateProfessionalVerificationRequest,
  ): Observable<Professional> {
    return this.http.patch<Professional>(
      `${API_BASE_URL}/professionals/${professionalId}/verification`,
      data,
    );
  }
}