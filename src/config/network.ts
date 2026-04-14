export enum NetworkConfig {
  ServerBaseUrl = "http://192.168.1.130:8080",
  ApiBaseUrl = "http://192.168.1.130:8080/api/v1",
}

export const buildAssetUrl = (path: string): string =>
  path.startsWith("http") ? path : `${NetworkConfig.ServerBaseUrl}${path}`;
