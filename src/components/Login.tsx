import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackendService } from "../Utils/Backend";
import { LOGIN } from "../constants/ApiConstants";
import { ROUTES } from "../constants/RouteConstants";
import { Icons } from "./icons";
import LoginImage from "../images/pen_svgrepo.com.png";
import Logo from "../images/Vector.png";
import { toast } from "react-toastify";

const Login: any = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailInput = e.target.value;
    setEmail(emailInput);
    setShowError(false);
    setIsEmailValid(validateEmail(emailInput));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email) {
      if (!showError) {
        toast.info("Please enter your email");
        setShowError(true);
      }
      return;
    }

    if (!selectedRole && selectedRole.length > 1) {
      toast.info("Please select a role");
      return;
    }

    setLoading(true);
    try {
      const response = BackendService.Post(
        {
          url: LOGIN,
          data: { email: email, role: selectedRole },
        },
        {
          success: (data) => {
            setLoading(false);
            localStorage.setItem("login_email", email);
            localStorage.setItem("login_role", selectedRole); // Optional: store role
            navigate(`${ROUTES.VERIFY_OTP}`);
          },
          failure: (response) => {
            toast.error(response?.response?.data?.message);
            setLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-[100vh] bg-gray-900">
        <div className="flex flex-row items-center justify-around h-[90vh]">
          <div className="flex flex-0 items-center justify-center w-[50vw] h-full">
            <form onSubmit={handleLogin}>
              <div className="flex flex-col justify-center gap-4">
                <h1 className="text-3xl font-bold text-white">Login</h1>
                <p className="text-sm font-medium text-gray-400 w-[80%]">
                  You will receive an OTP to your registered email to enter into
                  admin panel
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-9">
                <label className="text-sm font-medium text-white">Email</label>
                <div className="w-[70%] p-2 outline-gray-900 text-base font-normal bg-white border-2 border-gray-300 rounded-lg flex ">
                  <Icons.mail />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    placeholder="Enter Registered email"
                    className="outline-none w-full pl-3 h-full bg-transparent"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label className="text-sm font-medium text-white">
                    Select Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-[70%] px-3 py-2 rounded-lg"
                  >
                    <option value="">Select a role</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="OPERATIONS">Operator</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={!isEmailValid || loading || !selectedRole}
                className={`w-[70%] flex justify-center items-center text-white font-medium p-2 rounded-lg outline-none mt-5 ${
                  !isEmailValid || !selectedRole
                    ? "cursor-not-allowed bg-gray-700"
                    : "bg-[#1A3654]"
                } `}
              >
                {loading ? <Icons.loading /> : "Send"}
              </button>
            </form>
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
export default Login;
