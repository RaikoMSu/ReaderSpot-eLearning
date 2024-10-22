"use client";
// This is the top
import { useAppDispatch, useAppSelector } from "@/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Bell, Menu, Moon, Search, Sun, Upload } from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/logo2.png"

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSideBarCollapsed));
  };

  const toggleDarkmode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* Left Side */}
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 rounded-full hover:bg-yellow-300"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="search"
            placeholder="Search book, series, authors, genres"
            className="pl-10 pr-4 py-2 w-50 md:w-80 border-2 border-gray-300 bg-transparent rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-900" size={18} />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          {/* Import Button and Upload Icon */}
          <div className="relative">
            <button
              className="bg-yellow-300 text-gray-900 font-semibold px-4 py-2 md:w-30 rounded-lg flex items-center gap-2 hover:bg-yellow-200 transition-all"
              onClick={() => {}}
            >
              <Upload className="text-gray-900" size={18} />
              Import
            </button>
          </div>

          {/* Bell Icon with Notification */}
          <div className="relative">
            <Bell className="cursor-pointer text-gray-500" size={24} />
            <span className="absolute -top-1 -right-2 flex items-center justify-center px-1 py-0.5 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
              3
            </span>
          </div>

          {/* Vertical Line */}
          <hr className="w-0 h-7 border-solid border-l border-gray-300 mx-3" />

          {/* Profile Section */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <Image
                src={logo} 
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full h-full object-cover"
              />
            </div>
            <span className="font-semibold">RaikoMS</span>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkmode}>
          {isDarkMode ? (
            <Sun className="cursor-pointer text-gray-500" size={18} />
          ) : (
            <Moon className="cursor-pointer text-gray-500" size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
