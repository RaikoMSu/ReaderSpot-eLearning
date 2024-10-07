"use client";

import { useAppDispatch, useAppSelector } from "@/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Book,
  ChartNoAxesColumn,
  Library,
  LogOut,
  Mails,
  Menu,
  MessageCircleQuestion,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isLogout?: boolean;  // Add isLogout prop to handle Log out styling
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed, isLogout }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        } hover:text-red-500 hover:bg-[#F9B217] gap-3 transition-colors ${
          isActive ? "bg-[#F9B217] text-white" : ""
        }`}
      >
        <Icon
          className={`w-6 h-6 ${
            isLogout
              ? "text-red-500"
              : isActive
              ? "text-[#F9B217]" // Active icon color
              : "text-gray-700"
          }`}
        />
        <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-gray-700`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSideBarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSideBarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSideBarCollapsed ? "px-5" : "px-8"
        }`}
      >
        <div>Logo</div>
        <h1 className={`${isSideBarCollapsed ? "hidden" : "block"} font-extrabold text-2xl`}>
          ReaderSpot
        </h1>
        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Links */}
      <div className="flex-grow mt-8">
        {/* Responsive hr */}
        <hr className="border-t border-gray-300 mx-3 my-4" />
        <span className="flex flex-col justify-between items-center py-4">Main</span>
        <SidebarLink href="/library" icon={Library} label="Library" isCollapsed={isSideBarCollapsed} />
        <SidebarLink href="/books" icon={Book} label="Book" isCollapsed={isSideBarCollapsed} />
        <SidebarLink
          href="/leaderboards"
          icon={ChartNoAxesColumn}
          label="Leaderboards"
          isCollapsed={isSideBarCollapsed}
        />

        {/* Responsive hr */}
        <hr className="border-t border-gray-300 mx-3 my-4" />
        <span className="flex flex-col justify-between items-center py-4">Support</span>
        <SidebarLink
          href="/questions"
          icon={MessageCircleQuestion}
          label="Question and Answer"
          isCollapsed={isSideBarCollapsed}
        />
        <SidebarLink href="/mails" icon={Mails} label="Mails" isCollapsed={isSideBarCollapsed} />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <SidebarLink href="/settings" icon={Settings} label="Settings" isCollapsed={isSideBarCollapsed} />
        <SidebarLink
          href="/logout"
          icon={LogOut}
          label="Log out"
          isCollapsed={isSideBarCollapsed}
          isLogout={true}  // Pass isLogout prop to change Log out icon color
        />
      </div>
    </div>
  );
};

export default Sidebar;