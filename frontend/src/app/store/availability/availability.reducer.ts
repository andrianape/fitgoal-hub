import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import {
  AvailabilitySlot,
} from '../../core/models/availability-slot.model';
import {
  AvailabilityActions,
} from './availability.actions';

export interface AvailabilityState {
  slots: AvailabilitySlot[];
  mySlots: AvailabilitySlot[];
  loading: boolean;
  mySlotsLoading: boolean;
  error: string | null;
  mySlotsError: string | null;
  creating: boolean;
  createSuccessful: boolean;
  createError: string | null;
  deletingId: number | null;
  deleteError: string | null;
}

const initialState: AvailabilityState = {
  slots: [],
  mySlots: [],
  loading: false,
  mySlotsLoading: false,
  error: null,
  mySlotsError: null,
  creating: false,
  createSuccessful: false,
  createError: null,
  deletingId: null,
  deleteError: null,
};

export const availabilityFeature =
  createFeature({
    name: 'availability',

    reducer: createReducer(
      initialState,

      on(
        AvailabilityActions
          .loadAvailableSlots,
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
        AvailabilityActions
          .clearAvailableSlots,
        (state) => ({
          ...state,
          slots: [],
          loading: false,
          error: null,
        }),
      ),

      on(
        AvailabilityActions.loadMySlots,
        (state) => ({
          ...state,
          mySlotsLoading: true,
          mySlotsError: null,
        }),
      ),

      on(
        AvailabilityActions
          .loadMySlotsSuccess,
        (state, { slots }) => ({
          ...state,
          mySlots: slots,
          mySlotsLoading: false,
          mySlotsError: null,
        }),
      ),

      on(
        AvailabilityActions
          .loadMySlotsFailure,
        (state, { error }) => ({
          ...state,
          mySlots: [],
          mySlotsLoading: false,
          mySlotsError: error,
        }),
      ),

      on(
        AvailabilityActions.createSlot,
        (state) => ({
          ...state,
          creating: true,
          createSuccessful: false,
          createError: null,
        }),
      ),

      on(
        AvailabilityActions
          .createSlotSuccess,
        (state, { slot }) => ({
          ...state,
          mySlots: [
            ...state.mySlots,
            slot,
          ].sort((first, second) =>
            first.startsAt.localeCompare(
              second.startsAt,
            ),
          ),
          creating: false,
          createSuccessful: true,
          createError: null,
        }),
      ),

      on(
        AvailabilityActions
          .createSlotFailure,
        (state, { error }) => ({
          ...state,
          creating: false,
          createSuccessful: false,
          createError: error,
        }),
      ),

      on(
        AvailabilityActions.deleteSlot,
        (state, { slotId }) => ({
          ...state,
          deletingId: slotId,
          deleteError: null,
        }),
      ),

      on(
        AvailabilityActions
          .deleteSlotSuccess,
        (state, { slotId }) => ({
          ...state,
          mySlots: state.mySlots.filter(
            (slot) => slot.id !== slotId,
          ),
          deletingId: null,
          deleteError: null,
        }),
      ),

      on(
        AvailabilityActions
          .deleteSlotFailure,
        (state, { error }) => ({
          ...state,
          deletingId: null,
          deleteError: error,
        }),
      ),

      on(
        AvailabilityActions
          .clearSlotMutationState,
        (state) => ({
          ...state,
          creating: false,
          createSuccessful: false,
          createError: null,
          deletingId: null,
          deleteError: null,
        }),
      ),
    ),
  });

export const {
  name: availabilityFeatureKey,
  reducer: availabilityReducer,
  selectSlots,
  selectMySlots,
  selectLoading,
  selectMySlotsLoading,
  selectError,
  selectMySlotsError,
  selectCreating,
  selectCreateSuccessful,
  selectCreateError,
  selectDeletingId,
  selectDeleteError,
} = availabilityFeature;