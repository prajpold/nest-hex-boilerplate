export interface RefreshTokenRepository {
  store(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findValidByHash(tokenHash: string): Promise<{ userId: string } | null>;
  revoke(tokenHash: string): Promise<void>;
}
