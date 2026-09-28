import {
  HttpErrorResponse,
} from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import {
  catchError,
  map,
  of,
  switchMap,
} from 'rxjs';
import {
  ProfessionalsService,
} from '../../core/services/professionals.service';
import {
  ProfessionalsActions,
} from './professionals.actions';

@Injectable()
export class ProfessionalsEffects {
  private readonly actions$ =
    inject(Actions);

  private readonly professionalsService =
    inject(ProfessionalsService);

  readonly loadProfessionals$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          ProfessionalsActions
            .loadProfessionals,
        ),

        switchMap(({ filters }) =>
          this.professionalsService
            .getAll(filters)
            .pipe(
              map((response) =>
                ProfessionalsActions
                  .loadProfessionalsSuccess({
                    response,
                  }),
              ),

              catchError(
                (error: unknown) =>
                  of(
                    ProfessionalsActions
                      .loadProfessionalsFailure({
                        error:
                          this.getErrorMessage(
                            error,
                            'Profesionalci trenutno ne mogu da se učitaju.',
                          ),
                      }),
                  ),
              ),
            ),
        ),
      ),
    );

  readonly loadProfessional$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          ProfessionalsActions
            .loadProfessional,
        ),

        switchMap(({ id }) =>
          this.professionalsService
            .getOne(id)
            .pipe(
              map((professional) =>
                ProfessionalsActions
                  .loadProfessionalSuccess({
                    professional,
                  }),
              ),

              catchError(
                (error: unknown) =>
                  of(
                    ProfessionalsActions
                      .loadProfessionalFailure({
                        error:
                          this.getErrorMessage(
                            error,
                            'Profesionalni profil ne postoji ili trenutno ne može da se učita.',
                          ),
                      }),
                  ),
              ),
            ),
        ),
      ),
    );

  readonly loadOwnProfessionalProfile$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          ProfessionalsActions
            .loadOwnProfessionalProfile,
        ),

        switchMap(() =>
          this.professionalsService
            .getOwnProfile()
            .pipe(
              map((professional) =>
                ProfessionalsActions
                  .loadOwnProfessionalProfileSuccess({
                    professional,
                  }),
              ),

              catchError(
                (error: unknown) => {
                  if (
                    error instanceof
                      HttpErrorResponse &&
                    error.status === 404
                  ) {
                    return of(
                      ProfessionalsActions
                        .loadOwnProfessionalProfileFailure({
                          error: '',
                        }),
                    );
                  }

                  return of(
                    ProfessionalsActions
                      .loadOwnProfessionalProfileFailure({
                        error:
                          this.getErrorMessage(
                            error,
                            'Profesionalni profil trenutno nije moguće učitati.',
                          ),
                      }),
                  );
                },
              ),
            ),
        ),
      ),
    );

  readonly createProfessionalProfile$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          ProfessionalsActions
            .createProfessionalProfile,
        ),

        switchMap(({ data }) =>
          this.professionalsService
            .createProfile(data)
            .pipe(
              map((professional) =>
                ProfessionalsActions
                  .createProfessionalProfileSuccess({
                    professional,
                  }),
              ),

              catchError(
                (error: unknown) =>
                  of(
                    ProfessionalsActions
                      .createProfessionalProfileFailure({
                        error:
                          this.getErrorMessage(
                            error,
                            'Profesionalni profil trenutno nije moguće napraviti.',
                          ),
                      }),
                  ),
              ),
            ),
        ),
      ),
    );

  readonly updateProfessionalProfile$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          ProfessionalsActions
            .updateProfessionalProfile,
        ),

        switchMap(({ data }) =>
          this.professionalsService
            .updateProfile(data)
            .pipe(
              map((professional) =>
                ProfessionalsActions
                  .updateProfessionalProfileSuccess({
                    professional,
                  }),
              ),

              catchError(
                (error: unknown) =>
                  of(
                    ProfessionalsActions
                      .updateProfessionalProfileFailure({
                        error:
                          this.getErrorMessage(
                            error,
                            'Profesionalni profil trenutno nije moguće izmeniti.',
                          ),
                      }),
                  ),
              ),
            ),
        ),
      ),
    );

  readonly loadAdminProfessionals$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          ProfessionalsActions
            .loadAdminProfessionals,
        ),

        switchMap(() =>
          this.professionalsService
            .getAllForAdmin()
            .pipe(
              map((professionals) =>
                ProfessionalsActions
                  .loadAdminProfessionalsSuccess({
                    professionals,
                  }),
              ),

              catchError(
                (error: unknown) =>
                  of(
                    ProfessionalsActions
                      .loadAdminProfessionalsFailure({
                        error:
                          this.getErrorMessage(
                            error,
                            'Profesionalne profile trenutno nije moguće učitati.',
                          ),
                      }),
                  ),
              ),
            ),
        ),
      ),
    );

  readonly updateProfessionalVerification$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          ProfessionalsActions
            .updateProfessionalVerification,
        ),

        switchMap(
          ({
            professionalId,
            data,
          }) =>
            this.professionalsService
              .updateVerification(
                professionalId,
                data,
              )
              .pipe(
                map((professional) =>
                  ProfessionalsActions
                    .updateProfessionalVerificationSuccess({
                      professional,
                    }),
                ),

                catchError(
                  (error: unknown) =>
                    of(
                      ProfessionalsActions
                        .updateProfessionalVerificationFailure({
                          error:
                            this.getErrorMessage(
                              error,
                              'Odluku trenutno nije moguće sačuvati.',
                            ),
                        }),
                    ),
                ),
              ),
        ),
      ),
    );

  private getErrorMessage(
    error: unknown,
    fallbackMessage: string,
  ): string {
    if (
      error instanceof
      HttpErrorResponse
    ) {
      const message: unknown =
        error.error?.message;

      if (
        typeof message === 'string'
      ) {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(' ');
      }
    }

    return fallbackMessage;
  }
}