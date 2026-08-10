export interface TokenInfoDto {
  token: string;
  iat: number;
  exp: number;
  jti?: string;
}
