import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { City } from '../models/city.model';

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<City[]> {
    return this.http.get<City[]>(
      `${API_BASE_URL}/cities`,
    );
  }
}