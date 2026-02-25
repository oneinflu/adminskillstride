import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/RouteConstants";

export default function ProtectedLayer() {
  const authStatus = useSelector((state: any) => state.AuthReducer.status);

  if (!authStatus) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return <Outlet />;
}
