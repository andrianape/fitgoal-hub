import { City } from '../../core/models/city.model';

export interface CitiesState {
  cities: City[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export const initialCitiesState: CitiesState = {
  cities: [],
  loading: false,
  loaded: false,
  error: null,
};