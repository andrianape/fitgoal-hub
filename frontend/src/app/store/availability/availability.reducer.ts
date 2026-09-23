import { createFeature, createReducer, on } from '@ngrx/store';
import { AvailabilitySlot } from '../../core/models/availability-slot.model';
import { AvailabilityActions } from './availability.actions';

export interface AvailabilityState {
  slots: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
}

const initialState: AvailabilityState = {
  slots: [],
  loading: false,
  error: null,
};

export const availabilityFeature =
  createFeature({
    name: 'availability',

    reducer: createReducer(
      initialState,

      on(
        AvailabilityActions.loadAvailableSlots,
        (state) => ({
          ...state,
          loading: true,
          error: null,
        }),
      ),

      on(
        AvailabilityActions
          .loadAvailableSlotsSuccess,
        (state, { slots }) => ({
          ...state,
          slots,
          loading: false,
          error: null,
        }),
      ),

      on(
        AvailabilityActions
          .loadAvailableSlotsFailure,
        (state, { error }) => ({
          ...state,
          slots: [],
          loading: false,
          error,
        }),
      ),

      on(
        AvailabilityActions.clearAvailableSlots,
        () => initialState,
      ),
    ),
  });

export const {
  name: availabilityFeatureKey,
  reducer: availabilityReducer,
  selectSlots,
  selectLoading,
  selectError,
} = availabilityFeature;