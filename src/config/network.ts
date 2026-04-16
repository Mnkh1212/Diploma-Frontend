export enum NetworkConfig {
  ServerBaseUrl = "https://fintrack-api-lgei.onrender.com",
  ApiBaseUrl = "https://fintrack-api-lgei.onrender.com/api/v1",
}

export const buildAssetUrl = (path: string): string =>
  path.startsWith("http") ? path : `${NetworkConfig.ServerBaseUrl}${path}`;
