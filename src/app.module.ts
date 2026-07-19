import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import appConfig from "@shared/config/app.config";
import authConfig from "@shared/config/auth.config";
import databaseConfig from "@shared/config/database.config";
import { validateEnv } from "@shared/config/env.validation";

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
