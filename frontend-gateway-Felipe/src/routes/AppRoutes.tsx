import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "../pages/Login/Login.tsx";
import { Dashboard } from "../pages/Dashborad/Dashboard.tsx";
import { RoutesPage } from "../pages/RoutePage/RoutesPage.tsx";
import { JwtSecrets } from "../pages/JwtSecrets/JwtSecrets.tsx";
import { Logs } from "../pages/Audit/Logs.tsx";
import { Users } from "../pages/UserPage/Users.tsx";
import { AppLayout } from "../components/layouts/AppLayout";

function isAuthenticated() {
  return !!localStorage.getItem("gateway_token");
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="rotas" element={<RoutesPage />} />
        <Route path="jwt-secrets" element={<JwtSecrets />} />
        <Route path="logs" element={<Logs />} />
        <Route path="usuarios" element={<Users />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}