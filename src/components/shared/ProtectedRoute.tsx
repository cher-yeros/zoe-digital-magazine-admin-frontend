import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/redux/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "administrator" | "editor" | "reviewer" | "contributor";
  allowedRoles?: ("administrator" | "editor" | "reviewer" | "contributor")[];
}

const ProtectedRoute = ({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  const userRole = user.role?.toLowerCase();

  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    // If user doesn't have the required role, redirect to dashboard with error message
    return <Navigate to="/admin/dashboard" state={{ error: "Insufficient permissions" }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );
    
    if (!hasAllowedRole) {
      // If user doesn't have any of the allowed roles, redirect to dashboard
      return <Navigate to="/admin/dashboard" state={{ error: "Insufficient permissions" }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
