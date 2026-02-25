import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/RouteConstants";

interface ProtectedRouteProps {
  module: string;
  children: React.ReactNode;
}

const ROLE_MODULE_ACCESS: Record<string, string[]> = {
  SUPER_ADMIN: ["ALL"],
  MENTOR: ["Courses", "Course Categories", "Credits", "Dashboard", "Ads Management" , "Notifications", "profile"],
  OPERATIONS: ["Jobs Management", "Dashboard", "City Management", "Companies", "Job Categories", "spin wheel", "profile", "Applications"],
};

export default function ProtectedRoute({ module, children }: ProtectedRouteProps) {
  const userData = useSelector((state: any) => state.AuthReducer.userData);
  const { roles = [] } = userData || {};

  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  if (isSuperAdmin) return <>{children}</>;

  const hasModuleAccess = roles.some((role: string) => {
    const allowedModules = ROLE_MODULE_ACCESS[role] || [];
    return allowedModules.includes("ALL") || allowedModules.includes(module);
  });

  if (!hasModuleAccess) {
    return <Navigate to={ROUTES.UNAUTHORIZED} />;
  }

  return <>{children}</>;
}
