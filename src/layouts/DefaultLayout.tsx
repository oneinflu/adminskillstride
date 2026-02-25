import React, { ReactNode } from "react";
import Header from "../components/Header/Header.tsx";
import Sidebar from "../components/Sidebar/Sidebar.tsx";

interface DashboardProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="w-full sticky top-0 z-10">
        <Header />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[22vw] h-full overflow-y-auto scrollbar-thin bg-gray-900">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <main className="min-h-full">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
