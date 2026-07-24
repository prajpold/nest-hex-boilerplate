export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenGeneratorPort {
  generateTokenPair(userId: string): TokenPair;
  verifyAccessToken(token: string): { sub: string } | null;
}
