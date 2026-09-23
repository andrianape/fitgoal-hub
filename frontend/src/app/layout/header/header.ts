import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private readonly store = inject(Store);

  protected readonly isMenuOpen =
    signal(false);

  protected readonly currentUser =
    this.store.selectSignal(
      selectCurrentUser,
    );

  protected readonly isAuthenticated =
    this.store.selectSignal(
      selectIsAuthenticated,
    );

  ngOnInit(): void {
    this.store.dispatch(
      AuthActions.restoreSession(),
    );
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update(
      (isOpen) => !isOpen,
    );
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected logout(): void {
    this.closeMenu();

    this.store.dispatch(
      AuthActions.logout(),
    );
  }
}