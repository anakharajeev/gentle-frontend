import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Login from "./pages/Login";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
import Donations from "./pages/Donations";
import DonationDetail from "./pages/DonationDetail";
import MainLayout from "./layouts/MainLayout";
import { AuthContext } from "./contexts/AuthContext";

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/events" replace /> : <Login />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/events" replace /> : <Login />
        }
      />

      <Route
        path="/events"
        element={
          isAuthenticated ? (
            <MainLayout>
              <EventList />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/events/:id"
        element={
          isAuthenticated ? (
            <MainLayout>
              <EventDetail />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      <Route
        path="/donations"
        element={
          isAuthenticated ? (
            <MainLayout>
              <Donations />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/donations/:id"
        element={
          isAuthenticated ? (
            <MainLayout>
              <DonationDetail />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
