import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as loginApi, register as registerApi, getProfile, getSocialProviders, loginWithSocial } from "../services/api";
import { User, SocialProvider, SocialProviderStatus } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  hasSavedCredentials: boolean;
  socialProviders: SocialProviderStatus[];
  refreshSocialProviders: () => Promise<void>;
  socialLogin: (provider: SocialProvider) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [socialProviders, setSocialProviders] = useState<SocialProviderStatus[]>([]);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        const { data } = await getProfile();
        setUser(data);
      }
      // Check if saved credentials exist for biometric login
      const savedEmail = await AsyncStorage.getItem("saved_email");
      setHasSavedCredentials(!!savedEmail);
      await refreshSocialProviders();
    } catch {
      await AsyncStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await loginApi({ email, password });
    await AsyncStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);

    // Save credentials for biometric login if enabled
    const biometricEnabled = await AsyncStorage.getItem("biometric_enabled");
    if (biometricEnabled === "true") {
      await AsyncStorage.setItem("saved_email", email);
      await AsyncStorage.setItem("saved_password", password);
      setHasSavedCredentials(true);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await registerApi({ name, email, password });
    await AsyncStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const refreshSocialProviders = async () => {
    try {
      const { data } = await getSocialProviders();
      setSocialProviders(data || []);
    } catch {
      setSocialProviders([]);
    }
  };

  const socialLogin = async (provider: SocialProvider) => {
    const { data } = await loginWithSocial({ provider });
    await AsyncStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        setUser,
        hasSavedCredentials,
        socialProviders,
        refreshSocialProviders,
        socialLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
