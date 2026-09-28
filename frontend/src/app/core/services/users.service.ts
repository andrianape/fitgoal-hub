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
  UpdateUserRequest,
  User,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/users';

  updateProfile(
    userId: number,
    data: UpdateUserRequest,
  ): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${userId}`,
      data,
    );
  }

  uploadProfileImage(
    file: File,
  ): Observable<User> {
    const formData =
      new FormData();

    formData.append(
      'file',
      file,
    );

    return this.http.post<User>(
      `${this.apiUrl}/me/profile-image`,
      formData,
    );
  }

  removeProfileImage():
    Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/me/profile-image`,
    );
  }
}