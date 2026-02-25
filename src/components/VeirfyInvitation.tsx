import React, { useState, useEffect } from "react";
import { Icons } from "./icons";
import { useLocation, useNavigate } from "react-router-dom";
import { BackendService } from "../Utils/Backend";
import { VERIFY_INVITATION } from "../constants/ApiConstants";
import invitationBG from "../images/Onboarding 4.png";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/RouteConstants";
import { useSelector } from "react-redux";

const VerifyInvitation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      const response = BackendService.Post(
        {
          url: `${VERIFY_INVITATION}`,
          accessToken: admintoken,
          data: {
            token: token,
          },
        },
        {
          success: () => {
            setIsLoading(false);
            setIsVerified(true);
          },
          failure: () => {
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      setIsLoading(false);
      toast.error("Something went wrong, Please try again.");
    }
  }, []);

  return (
    <div className="flex items-center justify-between h-screen">
      <div className="bg-transparent border-0 flex items-center justify-center w-full">
        <div className="flex flex-col items-center bg-white h-[360px] w-[428px] rounded-xl p-5 justify-between border-2 border-gray-300">
          <Icons.success />
          {isLoading ? (
            <h1 className="text-4xl text-center font-bold">
              Verifying Your Details, please wait...
            </h1>
          ) : isVerified ? (
            <h1 className="text-4xl text-center font-bold">
              Successfully Verified Invitation
            </h1>
          ) : (
            <h1 className="text-4xl text-center font-bold">
              Unable to verify Invitation
            </h1>
          )}
          <button
            className={`bg-gray-900 w-full rounded-md text-white h-[50px] text-lg ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            } `}
            disabled={isLoading}
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Back to Login
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-start w-[80%] bg-white">
        <img src={invitationBG} alt="" />
      </div>
    </div>
  );
};
export default VerifyInvitation;
