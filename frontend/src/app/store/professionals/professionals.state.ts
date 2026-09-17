import {
  Professional,
  ProfessionalFilters,
} from '../../core/models/professional.model';

export interface ProfessionalsState {
  professionals: Professional[];
  filters: ProfessionalFilters;
  total: number;
  totalPages: number;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export const initialProfessionalsState:
  ProfessionalsState = {
    professionals: [],

    filters: {
      page: 1,
      limit: 9,
    },

    total: 0,
    totalPages: 0,
    loading: false,
    loaded: false,
    error: null,
  };