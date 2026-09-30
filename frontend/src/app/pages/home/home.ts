import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  RouterLink,
} from '@angular/router';
import {
  Store,
} from '@ngrx/store';
import {
  finalize,
} from 'rxjs';
import {
  AvailabilityRoleFilter,
  AvailableSlotByDate,
} from '../../core/models/availability-slot.model';
import {
  AvailabilityService,
} from '../../core/services/availability.service';
import {
  CitiesActions,
} from '../../store/cities/cities.actions';
import {
  selectCities,
  selectLoaded,
} from '../../store/cities/cities.selectors';

interface HomeCalendarDay {
  date: string;
  dayNumber: string;
  weekday: string;
  month: string;
  fullLabel: string;
}

type HomeRoleFilter =
  | 'all'
  | AvailabilityRoleFilter;

@Component({
  selector: 'app-home',

  imports: [
    RouterLink,
  ],

  templateUrl: './home.html',

  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly store =
    inject(Store);

  private readonly availabilityService =
    inject(AvailabilityService);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly cities =
    this.store.selectSignal(
      selectCities,
    );

  private readonly citiesLoaded =
    this.store.selectSignal(
      selectLoaded,
    );

  protected readonly calendarDays =
    signal<HomeCalendarDay[]>(
      this.createCalendarDays(),
    );

  protected readonly selectedDate =
    signal(
      this.calendarDays()[0]?.date ??
        this.formatDateForApi(
          new Date(),
        ),
    );

  protected readonly selectedRole =
    signal<HomeRoleFilter>('all');

  protected readonly availableSlots =
    signal<AvailableSlotByDate[]>(
      [],
    );

  protected readonly slotsLoading =
    signal(false);

  protected readonly slotsError =
    signal<string | null>(null);

  protected readonly resultsVisible =
    signal(false);

  protected readonly selectedCalendarDay =
    computed(() => {
      return (
        this.calendarDays().find(
          (day) =>
            day.date ===
            this.selectedDate(),
        ) ?? null
      );
    });

  protected readonly selectedMonth =
    computed(() => {
      return (
        this.selectedCalendarDay()
          ?.month ?? ''
      );
    });

  protected readonly selectedDateLabel =
    computed(() => {
      return (
        this.selectedCalendarDay()
          ?.fullLabel ?? ''
      );
    });

  ngOnInit(): void {
    if (!this.citiesLoaded()) {
      this.store.dispatch(
        CitiesActions.loadCities(),
      );
    }
  }

  protected selectDate(
    date: string,
  ): void {
    this.selectedDate.set(date);
    this.resultsVisible.set(true);
    this.loadAvailableSlots();
    this.scrollToResults();
  }

  protected selectRole(
    role: HomeRoleFilter,
  ): void {
    if (
      this.selectedRole() === role
    ) {
      return;
    }

    this.selectedRole.set(role);

    if (this.resultsVisible()) {
      this.loadAvailableSlots();
    }
  }

  protected showSelectedDateSlots():
    void {
    this.resultsVisible.set(true);
    this.loadAvailableSlots();
    this.scrollToResults();
  }

  protected retrySlots(): void {
    this.loadAvailableSlots();
  }

  protected closeResults(): void {
    this.resultsVisible.set(false);
  }

  protected formatTime(
    value: string,
  ): string {
    return new Intl.DateTimeFormat(
      'sr-Latn-RS',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(new Date(value));
  }

  protected getRoleLabel(
    role: string,
  ): string {
    if (role === 'trainer') {
      return 'Lični trener';
    }

    if (role === 'nutritionist') {
      return 'Nutricionista';
    }

    return role;
  }

  protected getProfileImageUrl(
    profileImageUrl: string | null,
  ): string | null {
    if (!profileImageUrl) {
      return null;
    }

    if (
      profileImageUrl.startsWith(
        'http',
      )
    ) {
      return profileImageUrl;
    }

    return (
      'http://localhost:3000' +
      profileImageUrl
    );
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

  private loadAvailableSlots(): void {
    this.slotsLoading.set(true);
    this.slotsError.set(null);

    const selectedRole =
      this.selectedRole();

    const role:
      AvailabilityRoleFilter |
      undefined =
        selectedRole === 'all'
          ? undefined
          : selectedRole;

    this.availabilityService
      .getAvailableByDate(
        this.selectedDate(),
        role,
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef,
        ),

        finalize(() => {
          this.slotsLoading.set(
            false,
          );
        }),
      )
      .subscribe({
        next: (slots) => {
          this.availableSlots.set(
            slots,
          );
        },

        error: () => {
          this.availableSlots.set([]);

          this.slotsError.set(
            'Slobodne termine trenutno nije moguće učitati.',
          );
        },
      });
  }

  private createCalendarDays():
    HomeCalendarDay[] {
    const days:
      HomeCalendarDay[] = [];

    const today =
      new Date();

    today.setHours(
      12,
      0,
      0,
      0,
    );

    for (
      let index = 0;
      index < 4;
      index += 1
    ) {
      const date =
        new Date(today);

      date.setDate(
        today.getDate() + index,
      );

      days.push({
        date:
          this.formatDateForApi(
            date,
          ),

        dayNumber:
          new Intl.DateTimeFormat(
            'sr-Latn-RS',
            {
              day: '2-digit',
            },
          ).format(date),

        weekday:
          new Intl.DateTimeFormat(
            'sr-Latn-RS',
            {
              weekday: 'short',
            },
          )
            .format(date)
            .replace('.', '')
            .toUpperCase(),

        month:
          new Intl.DateTimeFormat(
            'sr-Latn-RS',
            {
              month: 'long',
            },
          ).format(date),

        fullLabel:
          new Intl.DateTimeFormat(
            'sr-Latn-RS',
            {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            },
          ).format(date),
      });
    }

    return days;
  }

  private scrollToResults(): void {
    setTimeout(() => {
      document
        .getElementById(
          'slobodni-termini',
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    });
  }

  private formatDateForApi(
    date: Date,
  ): string {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  }
}