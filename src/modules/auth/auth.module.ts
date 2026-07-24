import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UsersModule } from "@modules/users/users.module";

import { LoginHandler } from "./application/commands/login/login.handler";
import { REFRESH_TOKEN_REPOSITORY, TOKEN_GENERATOR } from "./auth.tokens";
import { AuthController } from "./infrastructure/http/auth.controller";
import { RefreshTokenOrmEntity } from "./infrastructure/persistence/typeorm/refresh-token.orm-entity";
import { RefreshTokenTypeOrmRepository } from "./infrastructure/persistence/typeorm/refresh-token.orm-repository";
import { JwtTokenGenerator } from "./infrastructure/security/jwt-token-generator.adapter";
import { JwtStrategy } from "./infrastructure/security/jwt.strategy";

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    UsersModule,
    TypeOrmModule.forFeature([RefreshTokenOrmEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("auth.jwtSecret"),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    JwtStrategy,
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenTypeOrmRepository },
  ],
})
export class AuthModule {}
