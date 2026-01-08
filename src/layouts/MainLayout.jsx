import Header from "../components/Header";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function MainLayout({ children }) {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      {isAuthenticated && <Header />}
      {children}
    </>
  );
}
