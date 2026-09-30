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
  ChangePasswordRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
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

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(
      this.apiUrl,
    );
  }

  updateProfile(
    userId: number,
    data: UpdateUserRequest,
  ): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${userId}`,
      data,
    );
  }

  changePassword(
    data: ChangePasswordRequest,
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/me/password`,
      data,
    );
  }

  updateRole(
    userId: number,
    data: UpdateUserRoleRequest,
  ): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${userId}/role`,
      data,
    );
  }

  updateStatus(
    userId: number,
    data: UpdateUserStatusRequest,
  ): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${userId}/status`,
      data,
    );
  }

  remove(
    userId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${userId}`,
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