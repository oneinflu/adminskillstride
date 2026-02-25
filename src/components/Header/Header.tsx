import React, { useState, useRef, useEffect } from "react";
import { Icons } from "../icons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/Reducers/AuthReducer";
import { ROUTES } from "../../constants/RouteConstants";
import logo from "../../images/Vector.png";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useSelector } from "react-redux";

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userData = useSelector((state: any) => state.AuthReducer.userData);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false); // Close dropdown when clicking outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="flex justify-between h-[100px] items-center bg-white border-[1px] border-gray-200 w-full px-5">
      <img
        key={"skillstride_logo"}
        src={logo}
        alt={`skillstride_logo`}
        className=" w-[100px]"
      />
      <div className=" flex justify-center items-center" ref={dropdownRef}>
        <button
          className="h-[48px] w-[48px] rounded-xl bg-white flex justify-center items-center cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Icons.profile />
        </button>
        {dropdownOpen && (
          <div className="bg-white border-2 border-gray-100 shadow-md p-4 top-10 right-8 absolute rounded-lg text-sm font-medium flex flex-col gap-3 justify-start mt-5">
            <p>{userData?.name}</p>
            <p className="text-gray-500">{userData?.email}</p>
            <p className="text-gray-500">Role: {userData?.roles[0]}</p>
            <button
              onClick={() => handleLogout()}
              className="flex gap-2 text-[#FF3B30] mt-4 items-center"
            >
              <LogoutOutlinedIcon style={{ fontSize: "18px" }} />
              <p className="font-bold">Log Out</p>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
