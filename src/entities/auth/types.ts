export interface AuthState {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}
