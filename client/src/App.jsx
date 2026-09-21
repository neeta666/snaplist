import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AuthWelcome from "./pages/AuthWelcome";
import Profile from "./pages/Profile";
import NewListing from "./pages/NewListing";
import ListingDetail from "./pages/ListingDetail";
import Listings from "./pages/Listings";
import { API_BASE_URL_ROOT } from "./lib/apiClient";
import { useSessionRestore } from "./hooks/useSessionRestore";
import { useTheme } from "./hooks/useTheme";

function SessionInitializer() {
  useSessionRestore();
  return null;
}

export default function App() {
  useTheme();

  return (
    <BrowserRouter>
      <SessionInitializer />
      <Routes>
        <Route path="/auth/welcome" element={<AuthWelcome />} />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />

        <Route path="/" element={<Landing />} />

        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<Navigate to="/listings/new" replace />}
          />
          <Route
            path="/listings"
            element={
              <ProtectedRoute>
                <Listings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/new"
            element={
              <ProtectedRoute>
                <NewListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id"
            element={
              <ProtectedRoute>
                <ListingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
