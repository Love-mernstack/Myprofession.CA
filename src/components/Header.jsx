"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image"; // No change
import {
  FaUserCircle, FaBars, FaTimes,
  FaInstagram, FaYoutube, FaEnvelope, FaSearch,
  FaUser, FaSignOutAlt, FaTachometerAlt
} from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import AuthModal from "@/components/AuthModal";
import ConsultantJoinModal from "@/components/ConsultantJoinModal"; 

// Import Redux hooks and actions
import { useSelector, useDispatch } from "react-redux";
import { setLoginSuccess, setLogout, setClosing } from "@/redux/authSlice"; 

// Import your 'getMe' and new 'logout' functions
import { getMyProfile, logout } from "@/lib/api/auth";

// --- Helper function (No change) ---
const getCookie = (name) => {
  if (typeof window === "undefined") {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

// --- (Constants) (No Change) ---
const NAV_LINKS = [
  // Add your nav links here if any
];

const CATEGORIES = [
  { name: "Income Tax", slug: "income-tax" },
  { name: "GST", slug: "gst" },
  { name: "Accounting", slug: "accounting" },
  { name: "Audit", slug: "audit" },
  { name: "Investment", slug: "investment" },
  { name: "ICAI & Articleship", slug: "icai-and-articleship" },
  { name: "Law & MCA", slug: "law-and-mca" },
];

const DROPDOWN_OPTIONS = [
  "Mentorship",
  "Contents & Files",
  "Articles",
  "Courses",
  "Queries",
];

const AUTH_COOKIE_NAME = "token";
// --- (End of Constants) ---


export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const [openCategoryIndex, setOpenCategoryIndex] = useState(null);
  const categoryRefs = useRef([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ State to remember where the user wanted to go
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [showConsultantModal, setShowConsultantModal] = useState(false);

  // Session check with consultant flow redirect handling
  useEffect(() => {
    const checkUserSession = async () => {
      if (user) {
        // Check if user completed Google auth from consultant join flow
        const consultantFlow = sessionStorage.getItem('consultantJoinFlow');
        if (consultantFlow === 'true') {
          sessionStorage.removeItem('consultantJoinFlow');
          router.push('/expert-profile');
        }
        setIsAuthLoading(false);
        return;
      }
      
      setIsAuthLoading(true);
      try {
        const data = await getMyProfile(); 
        if (data.success) {
          dispatch(setLoginSuccess(data.user)); 
          
          // Check for consultant flow after getting user data
          const consultantFlow = sessionStorage.getItem('consultantJoinFlow');
          if (consultantFlow === 'true') {
            sessionStorage.removeItem('consultantJoinFlow');
            router.push('/expert-profile');
          }
        } else {
          dispatch(setLogout());
        }
      } catch (error) {
        dispatch(setLogout()); 
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkUserSession();
  }, [dispatch, user, router]);

  // Search submit handler (No change)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  // Click outside handlers (No change)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openCategoryIndex !== null &&
        categoryRefs.current[openCategoryIndex] &&
        !categoryRefs.current[openCategoryIndex].contains(e.target)
      ) {
        setOpenCategoryIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openCategoryIndex]);

  // Logout handler (No change)
  const handleLogout = async () => {
    try {
      await logout(); 
    } catch (error) {
      console.error("Logout API failed, but logging out client-side anyway:", error);
    }
    dispatch(setLogout()); 
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false); 
    router.push('/'); 
  };

  // Category link generator (No change)
  const getLinkPath = (item, category) => {
    switch (item) {
      case "Mentorship":
        return `/mentors?filter=${category.slug}`;
      case "Contents & Files":
        return `/category/${category.slug}`;
      default:
        return "/ComingSoon";
    }
  };
  
  // ✅ --- NEW CLICK HANDLER ---
  // This handles the "Join As Consultant" button click
  const handleJoinClick = (isMobile = false) => {
    if (isLoggedIn) {
        // If user is already logged in, send directly to expert profile
        router.push('/expert-profile');
        // Close mobile menu if open
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    } else {
        // If user is logged out, show the specialized consultant modal
        setShowConsultantModal(true);
        // Close mobile menu if open
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    }
  };
  
  // Helper function to close menus on navigation (No change)
  const handleLinkClick = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // ❌ RoleAwareButton component is REMOVED

  

  return (
    <>
      <header className="backdrop-blur-lg bg-black/80 text-white font-sans shadow-2xl rounded-b-2xl z-50 relative">
        
        {/* --- Top Bar (No Change) --- */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black">
          <Link href="/" className="text-3xl font-extrabold tracking-wide">
            MyProfession.CA
          </Link>

          {/* Center: Search Bar (Desktop) (No Change) */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaSearch className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="Search any topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 rounded-full bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </form>
          </div>

          {/* ✅ --- UPDATED Desktop Menu --- */}
          <nav className="hidden md:flex gap-4 items-center text-lg">
            {NAV_LINKS.map(({ label, path }, i) => (
              <Link
                key={i}
                href={path}
                className={`transition duration-200 ${
                  pathname === path
                    ? "text-blue-400 font-semibold"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* ✅ "Join As Consultant" button 
                Visible if NOT logged in, or logged in as a 'USER' */}
            {(!user || user.role === 'USER') && (
              <button
                onClick={() => handleJoinClick(false)}
                className="text-sm font-medium px-3 py-1.5 rounded-lg transition bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-900/50"
              >
                Join As a Consultant
              </button>
            )}

            {/* ✅ Role-specific Admin/Mentor buttons */}
            {isLoggedIn && user?.role === 'MENTOR' && (
              <Link href="/mentor/dashboard" className="text-sm font-medium px-3 py-1.5 rounded-lg transition bg-green-600 hover:bg-green-700 text-white">
                Mentor Dashboard
              </Link>
            )}
            {isLoggedIn && user?.role === 'SUPERADMIN' && (
              <Link href="/superadmin" className="text-sm font-medium px-3 py-1.5 rounded-lg transition bg-red-600 hover:bg-red-700 text-white">
                Superadmin
              </Link>
            )}

            {/* --- UPDATED Conditional Login/Profile Button --- */}
            {isLoggedIn && user ? ( 
              // LOGGED-IN: Show Profile Icon (No change)
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 hover:text-blue-400 transition duration-200"
                >
                  
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'User Avatar'}
                      width={28}
                      height={28}
                      className="rounded-full" 
                    />
                  ) : (
                    <FaUserCircle size={28} /> // Fallback
                  )}
                  <IoMdArrowDropdown />
                </button>

                {profileDropdownOpen && (
                  // Dropdown menu (No change)
                  <div className="absolute right-0 mt-3 w-64 bg-gray-900/90 backdrop-blur-md shadow-xl border border-gray-700 rounded-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.name || "Valued User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email || user?.phone}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/my-sessions"
                        onClick={handleLinkClick}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition duration-200 rounded-lg"
                      >
                        <FaUser className="mr-3 w-4" />
                        My Sessions
                      </Link>

                      {user.role === 'MENTOR' && (
                        <Link
                          href="/mentor/myprofile"
                          onClick={handleLinkClick}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition duration-200 rounded-lg"
                        >
                          <FaUser className="mr-3 w-4" />
                          My Profile
                        </Link>
                      )}

                      {user.role === 'MENTOR' && (
                        <Link
                          href="/mentor/dashboard"
                          onClick={handleLinkClick}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition duration-200 rounded-lg"
                        >
                          <FaTachometerAlt className="mr-3 w-4" />
                          Mentor Dashboard
                        </Link>
                      )}
                      
                      {user.role === 'SUPERADMIN' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={handleLinkClick}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition duration-200 rounded-lg"
                        >
                          <FaTachometerAlt className="mr-3 w-4" />
                          Superadmin Panel
                        </Link>
                      )}
                    </div>

                    <div className="py-1 border-t border-gray-700">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition duration-200 rounded-lg"
                      >
                        <FaSignOutAlt className="mr-3 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ✅ LOGGED-OUT: Show SMALLER Button
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-sm font-medium px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Login / Sign Up
              </button>
            )}
          </nav>

          {/* Mobile Hamburger (No Change) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-white text-2xl"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* --- Mobile Menu --- */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-4">
            {/* Search (No Change) */}
            <form onSubmit={handleSearchSubmit} className="relative w-full pt-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pt-2">
                <FaSearch className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="Search any topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 rounded-full bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </form>

            {/* Nav Links (No Change) */}
            {NAV_LINKS.map(({ label, path }, i) => (
              <Link
                key={i}
                href={path}
                className={`block transition duration-200 ${
                  pathname === path
                    ? "text-blue-400 font-semibold"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Social Icons (No Change) */}
            <div className="flex items-center gap-4 text-2xl text-blue-400 mt-2">
              <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="text-pink-500 hover:opacity-80 transition" />
              </a>
              <a href="https://youtube.com/yourchannel" target="_blank" rel="noopener noreferrer">
                <FaYoutube className="text-red-600 hover:opacity-80 transition" />
              </a>
              <a href="mailto:yourmail@gmail.com">
                <FaEnvelope className="text-gray-400 hover:text-white transition" />
              </a>
            </div>

            {/* ✅ --- UPDATED Professional Mobile Auth Section --- */}
            <div className="space-y-3 pt-4 border-t border-gray-700/50">
              {isLoggedIn && user ? (
                // LOGGED-IN (MOBILE)
                <>
                  <Link
                    href="/my-sessions"
                    onClick={handleLinkClick}
                    className="block text-center w-full px-4 py-2 bg-gray-700 text-white rounded-lg transition"
                  >
                    My Sessions
                  </Link>
                  
                  {user.role === 'MENTOR' && (
                    <Link
                      href="/mentor/myprofile"
                      onClick={handleLinkClick}
                      className="block text-center w-full px-4 py-2 bg-gray-700 text-white rounded-lg transition"
                    >
                      My Profile
                    </Link>
                  )}
                  
                  {user.role === 'MENTOR' && (
                    <Link
                      href="/mentor/dashboard"
                      onClick={handleLinkClick}
                      className="block text-center w-full px-4 py-2 bg-gray-700 text-white rounded-lg transition"
                    >
                      Mentor Dashboard
                    </Link>
                  )}

                  {user.role === 'SUPERADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      onClick={handleLinkClick}
                      className="block text-center w-full px-4 py-2 bg-gray-700 text-white rounded-lg transition"
                    >
                      Superadmin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block text-center w-full px-4 py-2 bg-red-600/50 border border-red-500 text-red-300 hover:bg-red-500/50 rounded-lg transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // LOGGED-OUT (MOBILE)
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block text-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Login / Sign Up
                </button>
              )}

              {/* ✅ "Join As Consultant" button 
                  Visible if NOT logged in, or logged in as a 'USER' */}
              {(!user || user.role === 'USER') && (
                  <button
                    onClick={() => handleJoinClick(true)}
                    className="block text-center w-full px-4 py-2 rounded-lg transition bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-900/50"
                  >
                    Join As Consultant
                  </button>
              )}
            </div>
            
          </div>
        )}

        {/* --- FULL SUBHEADER CODE (No Change) --- */}
        <div className="px-4 md:px-10 py-3 border-t border-b border-gray-700 bg-gradient-to-r from-gray-950 via-gray-900 to-black">
          <div className="flex flex-wrap justify-center gap-6">
            {CATEGORIES.map((category, i) => (
              <div
                key={i}
                className="relative"
                ref={(el) => (categoryRefs.current[i] = el)}
              >
                <button
                  onClick={() =>
                    setOpenCategoryIndex(openCategoryIndex === i ? null : i)
                  }
                  className="text-xl text-gray-300 flex items-center gap-1 hover:text-blue-400 transition"
                >
                  {category.name}
                  <IoMdArrowDropdown size={20} />
                </button>

                {openCategoryIndex === i && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-xl z-50 text-xl">
                    {DROPDOWN_OPTIONS.map((item, idx) => (
                      <Link
                        key={idx}
                        href={getLinkPath(item, category)}
                        onClick={() => setOpenCategoryIndex(null)} // Close dropdown on click
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition rounded-lg"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --- MODALS --- */}

      {/* ✅ UPDATED Login Modal - now handles pendingRedirect */}
      {showLoginModal && (
        <AuthModal
          onClose={() => {
            setShowLoginModal(false);
            setPendingRedirect(null); // Clear redirect if modal is closed
            // Reset closing state to allow reopening
            dispatch(setClosing(false));
          }}
          onLoginSuccess={(userData) => { 
            setShowLoginModal(false);
            dispatch(setLoginSuccess(userData)); 
            
            // This is the new logic
            if (pendingRedirect) {
              router.push(pendingRedirect);
              setPendingRedirect(null); // Clear redirect after using it
            }
            // Ensure closing state is reset for future modal opens
            dispatch(setClosing(false));
          }}
        />
      )}

      {/* ✅ NEW Consultant Join Modal */}
      {showConsultantModal && (
        <ConsultantJoinModal
          onClose={() => {
            setShowConsultantModal(false);
            // Reset closing state to allow reopening
            dispatch(setClosing(false));
          }}
          onLoginSuccess={(userData) => {
            setShowConsultantModal(false);
            dispatch(setLoginSuccess(userData));
            // Ensure closing state is reset for future modal opens
            dispatch(setClosing(false));
          }}
        />
      )}
    </>
  );
}