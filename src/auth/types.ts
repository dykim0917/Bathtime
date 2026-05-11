export type AuthProvider = 'google';

export type BathtimeUser = {
  id: string;
  provider: AuthProvider;
  providerUserId: string;
  email?: string;
  nickname?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthState = {
  user: BathtimeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
};
