import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { CitiesActions } from '../../store/cities/cities.actions';
import {
  selectCities,
  selectLoaded,
} from '../../store/cities/cities.selectors';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly store = inject(Store);

  protected readonly cities =
    this.store.selectSignal(selectCities);

  private readonly citiesLoaded =
    this.store.selectSignal(selectLoaded);

  ngOnInit(): void {
    if (!this.citiesLoaded()) {
      this.store.dispatch(
        CitiesActions.loadCities(),
      );
    }
  }
}