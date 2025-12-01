"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaUser,
  FaChalkboardTeacher,
  FaWpforms,
  FaLock,
  FaTachometerAlt,
  FaArrowLeft,
  FaArrowRight,
  FaUserTie,
  FaHome,
} from "react-icons/fa";

const navItems = [
  { label: "Dashboard", icon: FaTachometerAlt, path: "/mentor/dashboard" },
  { label: "My Profile", icon: FaUser, path: "/mentor/myprofile" },
  { label: "My Sessions", icon: FaChalkboardTeacher, path: "/mentor/my-sessions" },
  { label: "Availability", icon: FaLock, path: "/mentor/availability" },
];

/* Back to Website Section - Fixed positioning */
const backToWebsiteItem = { label: "Back to Website", icon: FaHome, path: "/" };

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-black p-4 flex justify-between items-center text-lg">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white bg-blue-800 rounded-full p-2 text-xl"
          aria-label="Open Menu"
        >
          <FaArrowLeft />
        </button>
      </div>

      {/* Click-to-close Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Drawer (Mobile) */}
      <div
        data-sidebar-mobile
        className={`fixed top-0 right-0 h-full w-64 bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out translate-x-full
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"} md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-blue-800">
          <div className="flex items-center gap-2">
            <FaUserTie className="text-blue-500 text-lg" />
            <span className="text-white text-sm font-medium">Mentor Menu</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white bg-gray-700 hover:bg-gray-600 rounded-lg p-2 transition-colors"
            aria-label="Close Menu"
          >
            <FaArrowRight className="text-lg" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4 mt-4">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => {
                  router.push(path);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all ${
                  isActive
                    ? "bg-blue-900/40 text-blue-400 font-semibold"
                    : "text-gray-400 hover:bg-blue-900/20 hover:text-white"
                }`}
              >
                <Icon className="text-xl" />
                <span>{label}</span>
              </button>
            );
          })}
          
          {/* Back to Website - Mobile Divider */}
          <div className="px-4 pt-4 border-t border-gray-700 mt-2">
            <button
              onClick={() => {
                router.push(backToWebsiteItem.path);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg p-3 transition-colors"
            >
              <backToWebsiteItem.icon className="text-xl" />
              <span>{backToWebsiteItem.label}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 bg-black border-r border-blue-900/40 p-4">
        <div className="flex items-center gap-2 mb-8 pb-4 border-b border-blue-800">
          <FaUserTie className="text-blue-500 text-2xl" />
          <div>
            <h2 className="text-white text-xl font-bold">Mentor</h2>
            <p className="text-xs text-gray-400">Myprofession.CA</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = pathname === path;
            const isBackToWebsite = path === "/";
            
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all ${
                  isBackToWebsite
                    ? "text-white bg-green-600 hover:bg-green-700"
                    : isActive
                    ? "bg-blue-900/40 text-blue-400 font-semibold"
                    : "text-gray-400 hover:bg-blue-900/20 hover:text-white"
                }`}
              >
                <Icon className="text-xl" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Back to Website Button - Desktop */}
        <button
          onClick={() => router.push(backToWebsiteItem.path)}
          className="mt-auto p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <backToWebsiteItem.icon className="text-lg" />
          <span>{backToWebsiteItem.label}</span>
        </button>
      </aside>
    </>
  );
}
