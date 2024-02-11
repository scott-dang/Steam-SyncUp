import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../utilities";

interface AuthContextType {
  getUser: () => User;
  getAuthToken: () => string;
  isLoggedIn: () => boolean;
  setupUser: (user: string) => void,
  login: (user: string) => void,
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  getUser: () => defaultUser,
  getAuthToken: () => "",
  isLoggedIn: () => false,
  setupUser: () => {},
  login: () => {},
  logout: () => {},
});

const userKey = "user";

const defaultUser: User = {
  authenticated: false,
  jwttoken: "",
  uuid: "",
  games: [],
}

const loadSavedUser = (): User => {
  try {
    const savedUser: User = JSON.parse(localStorage.getItem(userKey) || "")

    console.log("Loading into saved user state.");
    return savedUser;
  } catch(err) {
    console.log("Loading into non-authenticated user state.");
  }

  return defaultUser;
}

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(loadSavedUser());

  useEffect(() => {
    setUser(loadSavedUser());
  }, [])

  const login = (user: string) => {
    setupUser(user);
  };

  const setupUser = (user: string) => {
    localStorage.setItem(userKey, user);

    try {
      setUser(JSON.parse(user));
    } catch (err) {
      console.error(err);
    }
  }

  const logout = () => {
    localStorage.removeItem(userKey);
    setUser(defaultUser);
  };

  const isLoggedIn = (): boolean => {
    return user !== null && localStorage.getItem(userKey) !== null && user.authenticated === true;
  }

  const getAuthToken = (): string => {
    return user.jwttoken;
  }

  const getUser = (): User => {
    return user;
  }

  return (
    <AuthContext.Provider value={{ getUser, getAuthToken, isLoggedIn, setupUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
