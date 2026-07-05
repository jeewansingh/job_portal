/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calculateProfileCompletion } from "../utils/profile";

const STORAGE_KEY = "careerhub_user";

const UserContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function createUserFromLogin(email, role = "candidate") {
  const namePart = email.split("@")[0] || "User";
  const fullName = namePart
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    fullName,
    gender: "",
    address: "",
    dateOfBirth: "",
    skills: [],
    education: "",
    experienceYears: "",
    email,
    phoneNumber: "",
    desiredPosition: "",
    preferredJobTypes: [],
    portfolioLink: "",
    profilePictureUrl: "",
    resumePdf: null,
    profilePicture: null,
    isLoggedIn: true,
    role,
  };
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const profileCompletion = useMemo(
    () => calculateProfileCompletion(user),
    [user]
  );

  const login = (email, role = "candidate") => {
    const stored = readStoredUser();
    if (stored?.email === email.trim()) {
      setUser({ ...stored, isLoggedIn: true, role: stored.role || role });
      return;
    }

    setUser(createUserFromLogin(email.trim(), role));
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
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: Boolean(user?.isLoggedIn),
    profileCompletion,
    login,
    register,
    updateProfile,
    logout,
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
