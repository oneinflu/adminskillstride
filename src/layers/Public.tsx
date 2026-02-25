import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/RouteConstants.ts";

export default function PublicLayer() {
  const location = useLocation();
  const authStatus = useSelector((state: any) => state.AuthReducer.status);

  // Allow verify-otp route always
  if (location.pathname === "/verify-otp") {
    return <Outlet />;
  }

  // If already logged in, redirect to home/dashboard
  return authStatus ? <Navigate to={ROUTES.DASHBOARD} /> : <Outlet />;
}
