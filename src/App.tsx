
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Completed from "@/pages/Completed";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

// Add required dependencies
import { MotionConfig } from "framer-motion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TaskProvider>
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                } />
                
                <Route path="/completed" element={
                  <ProtectedRoute>
                    <Completed />
                  </ProtectedRoute>
                } />
                
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </MotionConfig>
      </TaskProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
