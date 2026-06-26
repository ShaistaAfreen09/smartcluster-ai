import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AiAssistant from "./pages/AiAssistant";
import Unauthorized from "./pages/Unauthorized";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Module */}
          <Route path="/" element={<Landing />} />

          {/* Public Authentication Gate */}
          <Route path="/login" element={<Login />} />

          {/* Access Restriction Error Page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Autonomic Dashboard Session */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected AI SRE Assistant Room */}
          <Route 
            path="/ai-assistant" 
            element={
              <ProtectedRoute>
                <AiAssistant />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all route forwarding to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

