import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { JwtSignOptions } from "@nestjs/jwt";

import {
  TokenGeneratorPort,
  TokenPair,
} from "@modules/auth/application/ports/token-generator.port";

@Injectable()
export class JwtTokenGenerator implements TokenGeneratorPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateTokenPair(userId: string): TokenPair {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      {
        expiresIn:
          this.configService.getOrThrow<JwtSignOptions["expiresIn"]>("auth.jwtAccessExpiresIn"),
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        expiresIn: this.configService.getOrThrow<JwtSignOptions["expiresIn"]>(
          "auth.jwtRefreshExpiresIn",
        ),
      },
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): { sub: string } | null {
    try {
      return this.jwtService.verify<{ sub: string }>(token);
    } catch {
      return null;
    }
  }
}
