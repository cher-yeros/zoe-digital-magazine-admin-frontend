import { useAppSelector } from "./hooks";
import {
  selectAuthError,
  selectAuthLoading,
  selectAccessToken,
  selectRefreshToken,
  selectCurrentUser,
  selectIsAuthenticated,
} from "./slices/authSlice";

// Custom hook for easy access to auth state
export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector(selectAccessToken);
  const refreshToken = useAppSelector(selectRefreshToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
  };
};
