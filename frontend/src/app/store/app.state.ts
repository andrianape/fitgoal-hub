import { CitiesState } from './cities/cities.state';
import { ProfessionalsState } from './professionals/professionals.state';

export interface AppState {
  cities: CitiesState;
  professionals: ProfessionalsState;
}