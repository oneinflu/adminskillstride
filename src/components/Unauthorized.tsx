import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/RouteConstants";
import unauthorized from "../images/Unauthorized.png";
import { useSelector } from "react-redux";

const Unauthorized = () => {
  const navigate = useNavigate();
  const roles = useSelector(
      (state: any) => state.AuthReducer.userData.roles
    );

  const handleGoHome = () => {
    navigate(ROUTES.DASHBOARD);
  };
  return (
    <div className="flex flex-col items-center justify-center h-[75vh]">
      <img src={unauthorized} className="w-1/5" />
      <div className="flex flex-col items-center font-bold text-lg">
        <h1>Unauthorized Access</h1>
        <p>Sorry, you don’t have permission to view this page.</p>
        <p>Please contact your administrator if you believe this is an error.</p>
      </div>
      <div>
        <button
          onClick={handleGoHome}
          className="bg-green-700 text-white m-2 p-2 rounded-lg"
        >
          Go to HomePage
        </button>
      </div>
    </div>
  );
};
export default Unauthorized;
