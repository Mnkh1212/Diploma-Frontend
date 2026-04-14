export type SocialProvider = "google" | "facebook" | "apple";

export interface SocialProviderMeta {
  provider: SocialProvider;
  label: string;
  icon: string;
  color: string;
}

export const SOCIAL_PROVIDERS: SocialProviderMeta[] = [
  { provider: "facebook", label: "Facebook", icon: "logo-facebook", color: "#1877F2" },
  { provider: "google", label: "Google", icon: "logo-google", color: "#EA4335" },
  { provider: "apple", label: "Apple", icon: "logo-apple", color: "#FFFFFF" },
];
