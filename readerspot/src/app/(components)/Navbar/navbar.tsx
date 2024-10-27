"use client";

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from "@/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Bell, Menu, Moon, Search, Sun, Upload, Cloud } from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/logo2.png"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/(components)/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/(components)/ui/tabs"
import { Input } from "@/app/(components)/ui/input"
import { Badge } from "@/app/(components)/ui/badge"

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [isImportOpen, setIsImportOpen] = useState(false);

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
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen} >
              <DialogTrigger asChild>
                <button
                  className="bg-yellow-300 text-gray-900 font-semibold px-4 py-2 md:w-30 rounded-lg flex items-center gap-2 hover:bg-yellow-200 transition-all"
                  onClick={() => setIsImportOpen(true)}
                >
                  <Upload className="text-gray-900" size={18} />
                  Import
                </button>
              </DialogTrigger>

              {/* Dark Background Overlay */}
              {isImportOpen && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-10 z-40" />
              )}
              
              <DialogContent className="sm:max-w-[425px] z-50">
                <DialogHeader>
                  <DialogTitle>Book import</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="add" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="add">Add Books</TabsTrigger>
                    <TabsTrigger value="imports">My Imports</TabsTrigger>
                  </TabsList>
                  <TabsContent value="add">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                      <Cloud className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-4">Drag and Drop files here</p>
                      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">+ Browse Files</button>
                    </div>
                    <ul className="mt-4 text-sm text-gray-500">
                      <li>• Only upload books that you have the legal right to share, whether they are free or paid.</li>
                      <li>• Avoid sharing bad scans, incomplete e-books, or draft materials.</li>
                      <li>• Share books in authorized formats: PDF, FB2, EPUB, LIT, LRF, MOBI, ODT, RTF, SNB, DJVU, AZW2, and AZW.</li>
                      <li>• Do not upload magazines, articles, lectures, school or student materials, or any content that you don't have the rights to share.</li>
                      <li>• If you come across any copyrighted content or violations, please report them.</li>
                    </ul>
                  </TabsContent>
                  <TabsContent value="imports">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input placeholder="Search books, series, authors, genres" className="pl-8" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">All</Badge>
                      <Badge variant="outline" className="bg-green-500 text-white">Free</Badge>
                      <Badge variant="outline" className="bg-red-500 text-white">Paid</Badge>
                      <Badge variant="outline" className="bg-yellow-500 text-white">Pending</Badge>
                    </div>
                    <ul className="mt-4 space-y-4">
                      {/* Add your imported books list here */}
                    </ul>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
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
