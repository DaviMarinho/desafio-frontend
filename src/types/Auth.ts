export interface User {
  id: string;
  username: string;
  name: string;
}

export interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
