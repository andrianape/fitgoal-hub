import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CitiesModule } from './cities/cities.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PlansModule } from './plans/plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),

        autoLoadEntities: true,

        // Koristimo samo tokom lokalnog razvoja.
        synchronize:
          configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    CitiesModule,

    UsersModule,

    AuthModule,

    ProfessionalsModule,

    AvailabilityModule,

    AppointmentsModule,

    ReviewsModule,

    PlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}