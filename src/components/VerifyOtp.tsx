import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BackendService } from "../Utils/Backend";
import { ROUTES } from "../constants/RouteConstants";
import { LOGIN, VERIFY_OTP } from "../constants/ApiConstants";
import OtpInput from "react-otp-input";
import { useDispatch } from "react-redux";
import { Icons } from "./icons";
import { login } from "../store/Reducers/AuthReducer";
import LoginImage from "../images/pen_svgrepo.com.png";
import Logo from "../images/Vector.png";
import { toast } from "react-toastify";

const VerifyOtp: any = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = localStorage.getItem("login_email");
    const role = localStorage.getItem('login_role')
    if (otp) {
      setLoading(true);
      try {
        const response = BackendService.Post(
          {
            url: `${VERIFY_OTP}`,
            data: { email: email, otp: otp , role:role},
          },
          {
            success: (data) => {
              console.log(data)
              dispatch(login(data));
              setLoading(false);
              navigate(ROUTES.DASHBOARD);
              toast.success("OTP verified successfully!.")
            },
            failure: (error) => {
              toast.error(error?.response?.data?.message);
              setLoading(false);
            },
          }
        );
      } catch (err) {
        setLoading(false);
      }
    } else {
      toast.info("please enter OTP");
    }
  };

  const handleResendOtp = async () => {
    const email = localStorage.getItem("login_email");
    setResendLoading(true);
    try {
      await BackendService.Post(
        {
          url: LOGIN,
          data: { email: email , role:"SUPER_ADMIN"},
        },
        {
          success: () => {
            toast.success("OTP Resent Successfully!")
            setResendLoading(false);
            setCanResend(false);
            setCountdown(45);
          },
          failure: (response) => {
            toast.error(response?.data?.message);
            setResendLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to resend OTP");
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  return (
    <>
      <div className="flex flex-col h-[100vh] bg-gray-900">
        <div className="flex flex-row items-center justify-around h-[90vh]">
          <div className="flex flex-0 flex-col justify-center items-center w-[45vw] h-full">
            <div className="flex flex-0 flex-col justify-center w-[25vw] h-full">
              <div className="flex flex-col gap-4">
                <button
                  className="flex gap-2 items-center text-white"
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  <Icons.backarrow />
                  <p className="text-base font-medium text-white">Back</p>
                </button>
                <h1 className="text-3xl font-bold text-white">Verify OTP</h1>
              </div>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-2 mt-9">
                  <div>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      shouldAutoFocus={true}
                      numInputs={6}
                      renderSeparator={<span> </span>}
                      renderInput={(props) => (
                        <input
                          {...props}
                          style={{
                            backgroundColor: "white",
                            border: `2px solid ${
                              otp.length === 4 ? "green" : "gray"
                            }`,
                            padding: "15px",
                            borderRadius: "8px",
                            marginRight: "10px",
                            width: "50px",
                            height: "50px",
                            fontSize: "24px",
                          }}
                        />
                      )}
                    />
                  </div>
                  <p className="text-base text-gray-400 mt-4">
                    Enter code sent to your email
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length != 6}
                  className={`w-[100%] flex justify-center items-center text-white font-medium p-2 rounded-lg outline-none mt-5 ${
                    otp.length === 6 ? "bg-[#1A3654]" : "bg-gray-700"
                  } `}
                >
                  {loading ? <Icons.loading /> : "Verify"}
                </button>
              </form>
              <div className="flex flex-row mt-5 gap-2">
                <p className="text-white">Didn't receive code?</p>
                {canResend ? (
                  <p
                    onClick={handleResendOtp}
                    className="text-[#c0d2e4] cursor-pointer font-medium"
                  >
                    {resendLoading ? <Icons.loading /> : "Resend OTP"}
                  </p>
                ) : (
                  <p className="text-white cursor-default">
                    Resend OTP in {countdown} seconds
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="w-[50vw] h-full flex items-start justify-center relative">
            <img src={LoginImage} className="w-[50%]" />
            <img src={Logo} className="absolute w-[25%] mt-9" alt="Overlay" />
          </div>
        </div>
      </div>
    </>
  );
};
export default VerifyOtp;
