import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (token && refresh) {
      setAuthTokens({ access: token, refresh });
    } else {
      setAuthTokens(null);
    }
  }, []);

  const loginUser = (tokens, userData) => {
    setAuthTokens(tokens);
    setUser(userData);
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        authTokens,
        user,
        loginUser,
        logoutUser,
        isAuthenticated: !!authTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
