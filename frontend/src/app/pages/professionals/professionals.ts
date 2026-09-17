import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  ProfessionalFilters,
} from '../../core/models/professional.model';
import {
  UserRole,
} from '../../core/models/user.model';
import { CitiesActions } from '../../store/cities/cities.actions';
import {
  selectCities,
  selectLoaded as selectCitiesLoaded,
} from '../../store/cities/cities.selectors';
import { ProfessionalsActions } from '../../store/professionals/professionals.actions';
import {
  selectError,
  selectFilters,
  selectLoading,
  selectProfessionals,
  selectTotal,
  selectTotalPages,
} from '../../store/professionals/professionals.selectors';

@Component({
  selector: 'app-professionals',
  imports: [
    FormsModule,
    RouterLink,
  ],
  templateUrl: './professionals.html',
  styleUrl: './professionals.scss',
})
export class Professionals implements OnInit {
  private readonly store = inject(Store);

  protected search = '';
  protected selectedCityId = '';
  protected selectedRole: '' | UserRole = '';

  protected readonly professionals =
    this.store.selectSignal(
      selectProfessionals,
    );

  protected readonly cities =
    this.store.selectSignal(selectCities);

  protected readonly loading =
    this.store.selectSignal(selectLoading);

  protected readonly error =
    this.store.selectSignal(selectError);

  protected readonly total =
    this.store.selectSignal(selectTotal);

  protected readonly totalPages =
    this.store.selectSignal(
      selectTotalPages,
    );

  protected readonly currentFilters =
    this.store.selectSignal(selectFilters);

  private readonly citiesLoaded =
    this.store.selectSignal(
      selectCitiesLoaded,
    );

  ngOnInit(): void {
    if (!this.citiesLoaded()) {
      this.store.dispatch(
        CitiesActions.loadCities(),
      );
    }

    this.loadProfessionals(1);
  }

  protected applyFilters(): void {
    this.loadProfessionals(1);
  }

  protected selectRole(
    role: '' | UserRole,
  ): void {
    this.selectedRole = role;
    this.loadProfessionals(1);
  }

  protected clearFilters(): void {
    this.search = '';
    this.selectedCityId = '';
    this.selectedRole = '';

    this.loadProfessionals(1);
  }

  protected previousPage(): void {
    const currentPage =
      this.currentFilters().page;

    if (currentPage > 1) {
      this.loadProfessionals(
        currentPage - 1,
      );
    }
  }

  protected nextPage(): void {
    const currentPage =
      this.currentFilters().page;

    if (currentPage < this.totalPages()) {
      this.loadProfessionals(
        currentPage + 1,
      );
    }
  }

  protected getInitials(
    firstName: string,
    lastName: string,
  ): string {
    return (
      firstName.charAt(0) +
      lastName.charAt(0)
    ).toUpperCase();
  }

  protected getRoleLabel(
    role: UserRole,
  ): string {
    if (role === 'trainer') {
      return 'Lični trener';
    }

    if (role === 'nutritionist') {
      return 'Nutricionista';
    }

    return role;
  }

  private loadProfessionals(
    page: number,
  ): void {
    const filters: ProfessionalFilters = {
      page,
      limit: 9,
    };

    const normalizedSearch =
      this.search.trim();

    if (normalizedSearch) {
      filters.search = normalizedSearch;
    }

    if (this.selectedCityId) {
      filters.cityId = Number(
        this.selectedCityId,
      );
    }

    if (this.selectedRole) {
      filters.role = this.selectedRole;
    }

    this.store.dispatch(
      ProfessionalsActions.loadProfessionals({
        filters,
      }),
    );
  }
}