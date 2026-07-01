export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface UserContextType {
  userId: string | null;
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  login: (email: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  openSignIn: () => void;
  openSignUp: () => void;
}
