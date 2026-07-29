import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "@modules/auth/auth.module";
import { JwtAuthGuard } from "@modules/auth/infrastructure/http/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/permissions/infrastructure/http/guards/permissions.guard";
import { PermissionsModule } from "@modules/permissions/permissions.module";
import { UsersModule } from "@modules/users/users.module";
import appConfig from "@shared/config/app.config";
import authConfig from "@shared/config/auth.config";
import databaseConfig from "@shared/config/database.config";
import { validateEnv } from "@shared/config/env.validation";
import { buildTypeOrmOptions } from "@shared/infrastructure/database/typeorm.config";
import { HealthModule } from "@shared/infrastructure/health/health.module";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PermissionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig],
      validate: validateEnv,
      validationOptions: {
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => buildTypeOrmOptions(configService),
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
