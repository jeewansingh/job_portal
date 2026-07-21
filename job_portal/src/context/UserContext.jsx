/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calculateProfileCompletion } from "../utils/profile";
import { logoutUser as authLogoutUser, getStoredUser } from "../services/auth";
import { getFileUrl } from "../services/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const loadUserFromStorage = () => {
    const storedUser = getStoredUser();
    if (storedUser) {
      return {
        id: storedUser.id,
        fullName: storedUser.full_name,
        email: storedUser.email,
        profilePictureUrl: getFileUrl(storedUser.profile_picture_url), // Convert to full URL
        isLoggedIn: true,
        role: "candidate",
      };
    }
    return null;
  };

  const [user, setUser] = useState(loadUserFromStorage);

  const profileCompletion = useMemo(
    () => calculateProfileCompletion(user),
    [user]
  );

  const refreshUser = () => {
    setUser(loadUserFromStorage());
  };

  const register = (profile, role = "candidate") => {
    setUser({
      ...profile,
      password: undefined,
      confirmPassword: undefined,
      agreedToTerms: undefined,
      isLoggedIn: true,
      role,
    });
  };

  const updateProfile = (updates) => {
    setUser((prev) => ({ ...prev, ...updates, isLoggedIn: true }));
  };

  const logout = () => {
    authLogoutUser(); // Clear all auth data from localStorage
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: Boolean(user?.isLoggedIn),
    profileCompletion,
    register,
    updateProfile,
    logout,
    refreshUser, // Expose refresh function
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
