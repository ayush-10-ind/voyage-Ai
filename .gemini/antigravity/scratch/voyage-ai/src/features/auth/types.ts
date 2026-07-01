export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone?: string;
  country?: string;
}

export interface UserContextType {
  userId: string | null;
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string, isOAuth?: boolean) => Promise<boolean>;
  signUp: (email: string, name: string, password: string, phone?: string, country?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  openSignIn: () => void;
  openSignUp: () => void;
}
