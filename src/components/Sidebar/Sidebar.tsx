import React from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/RouteConstants";
import { useSelector } from "react-redux";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AttractionsOutlinedIcon from "@mui/icons-material/AttractionsOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AdsClickOutlinedIcon from "@mui/icons-material/AdsClickOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import { Users, BookOpen, CreditCard, Building, Briefcase } from "lucide-react";

const ROLE_MODULE_ACCESS: Record<string, string[]> = {
  SUPER_ADMIN: ["ALL"],
  MENTOR: [
    "Courses",
    "Course Categories",
    "Credits",
    "Dashboard",
    "Ads Management",
    "Notifications",
    "profile",
  ],
  OPERATIONS: [
    "Jobs Management",
    "Dashboard",
    "City Management",
    "Companies",
    "Job Categories",
    "profile",
    "Applications",
  ],
};

const MENU_ITEMS = [
  // Dashboard + Profile
  { type: "header", label: "General" },
  { label: "Dashboard", to: ROUTES.DASHBOARD, icon: <DashboardOutlinedIcon /> },
  { label: "Profile", to: ROUTES.PROFILE, icon: <PersonOutlinedIcon /> },

  // Courses section
  { type: "header", label: "Courses Management" },
  {
    label: "Course Categories",
    to: ROUTES.CATEGORIES,
    icon: <CategoryOutlinedIcon />,
  },
  { label: "Courses", to: `${ROUTES.COURSES}?page=1`, icon: <BookOpen /> },
  {
    label: "Credits",
    to: ROUTES.CREDITS,
    icon: <AccountBalanceWalletOutlinedIcon />,
  },

  // Jobs Section
  { type: "header", label: "Jobs Management" },
  {
    label: "Job Categories",
    to: ROUTES.JOB_CATEGORIES,
    icon: <WorkOutlinedIcon />,
  },
  { label: "Jobs Management", to: ROUTES.JOBS, icon: <Briefcase /> },
  { label: "Applications", to: ROUTES.APPLICATIONS, icon: <Briefcase /> },

  // Admin Only
  { type: "header", label: "Admin", only: "SUPER_ADMIN" },
  {
    label: "Role Management",
    to: ROUTES.SUBADMIN_MANAGEMENT,
    icon: <ManageAccountsOutlinedIcon />,
    only: "SUPER_ADMIN",
  },

  // Admin Only
  { type: "header", label: "Users Mangement"},
  { label: "Users", to: ROUTES.USERS, icon: <Users /> },
  { label: "Subscriptions", to: ROUTES.SUBSCRIPTIONS, icon: <CreditCard /> },
  { label: "Payments", to: ROUTES.PAYMENTS, icon: <AttachMoneyOutlinedIcon /> },
  {
    label: "Spin Wheel",
    to: ROUTES.SPIN_WHEEL,
    icon: <AttractionsOutlinedIcon />,
  },

  // Others
  { type: "header", label: "Other Modules" },
  {
    label: "Ads Management",
    to: ROUTES.ADVERTISEMENT,
    icon: <AdsClickOutlinedIcon />,
  },
  {
    label: "Notifications",
    to: ROUTES.NOTIFIICATIONS,
    icon: <NotificationsOutlinedIcon />,
  },
  {
    label: "City Management",
    to: ROUTES.CITY_MANAGEMENT,
    icon: <LocationCityOutlinedIcon />,
  },
  { label: "Companies", to: ROUTES.COMPANIES, icon: <Building /> },
  {
    label: "Organizations",
    to: ROUTES.ORGANIZATIONS,
    icon: <CorporateFareOutlinedIcon />,
  },
];

const Sidebar: React.FC = () => {
  const roles = useSelector(
    (state: any) => state?.AuthReducer?.userData?.roles
  );
  const userRoles: string[] = Array.isArray(roles)
    ? roles
    : [roles].filter(Boolean);

  const allowedModules = userRoles.includes("SUPER_ADMIN")
    ? ["ALL"]
    : userRoles.flatMap((role) => ROLE_MODULE_ACCESS[role] || []);

  const visibleMenuItems = MENU_ITEMS.filter((item, index) => {
    if (item.type === "header") {
      return MENU_ITEMS.slice(index + 1).some((next) => {
        if (next.type === "header") return false;
        if (next.only && !userRoles.includes(next.only)) return false;
        if (userRoles.includes("SUPER_ADMIN")) return true;

        return allowedModules
          .map((m) => m.toLowerCase())
          .includes(next.label.toLowerCase());
      });
    }

    if (userRoles.includes("SUPER_ADMIN")) return true;
    if (item.only && !userRoles.includes(item.only)) return false;

    return allowedModules.some(
      (module) => module.toLowerCase() === item.label.toLowerCase()
    );
  });

  return (
    <aside className="relative inset-y-0 left-0 w-[22vw] shadow-lg flex flex-col justify-between">
      <div>
        <ul className="list-none p-4 flex flex-col items-start gap-2">
          {visibleMenuItems.map((item) => {
            if (item.type === "header") {
              return (
                <li key={item.label} className="mt-4 mb-1 pl-2 w-full">
                  <p className="text-gray-300 uppercase text-sm tracking-wider font-semibold">
                    {item.label}
                  </p>
                </li>
              );
            }
            return (
              <li key={item.label} className="w-full">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `w-full p-2 flex justify-start pl-2 items-center gap-2 rounded-lg hover:bg-gray-200 hover:text-[#1A3654] ${
                      isActive ? "bg-gray-200 text-[#1A3654]" : "text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <div
                      className={`flex items-center justify-center gap-2 ${
                        isActive ? "font-medium" : "font-normal"
                      }`}
                    >
                      {item.icon}
                      <p className="text-base">{item.label}</p>
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
