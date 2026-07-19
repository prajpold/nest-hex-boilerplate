import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import appConfig from "@shared/config/app.config";
import authConfig from "@shared/config/auth.config";
import databaseConfig from "@shared/config/database.config";
import { validateEnv } from "@shared/config/env.validation";
import { buildTypeOrmOptions } from "@shared/infrastructure/database/typeorm.config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
