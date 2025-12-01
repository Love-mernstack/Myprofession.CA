"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import AOS from "aos";
import "aos/dist/aos.css";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-hot-toast";
import { getDashboardProfile } from '@/lib/api/mentorApi';
import InactiveProfileModal from "@/components/InactiveProfileModal";
import { 
  FaCalendarDay, 
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaPlayCircle,
  FaMoneyBillWave,
  FaUserGraduate,
  FaVideo,
  FaStar,
  FaChartLine,
  FaChartBar,
  FaTrophy,
  FaClock,
  FaUsers
} from "react-icons/fa";

export default function Dashboard() {
  const stats = useSelector((state) => state.dashboard.stats);
  const meetings = useSelector((state) => state.dashboard.meetings);
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isLoggedIn);
  const router = useRouter();
  
  // State for dashboard profile data
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileInactive, setProfileInactive] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  // Fetch dashboard profile data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getDashboardProfile();
        
        // Check if redirect was handled by axios interceptor
        if (response.redirectHandled) {
          return; // Don't proceed if redirect is happening
        }
        
        if (response.success) {
          console.log('Dashboard data received:', response.data);
          setDashboardData(response.data);
          
          // Check if profile is inactive
          if (!response.data.isActive) {
            setProfileInactive(true);
            setShowProfileModal(true);
          }
        } else {
          throw new Error(response.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        // Handle 403 error specifically for unauthorized access first
        if (err.response && err.response.status === 403) {
          router.push('/unauthorized');
          return;
        }
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Create state to track auth initialization
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authCheckDelay, setAuthCheckDelay] = useState(true);

  useEffect(() => {
    // Give Redux 1 second to initialize on page refresh
    const timer = setTimeout(() => {
      setAuthCheckDelay(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't check authentication until both Redux is ready and delay is over
    if (authCheckDelay) {
      console.log("Waiting for Redux to initialize...");
      setIsAuthLoading(true);
      return;
    }

    console.log("Auth State:", { isAuthenticated, user });
    console.log("User Role:", user?.role);
    
    // If Redux is still initializing (undefined), wait
    if (isAuthenticated === undefined) {
      setIsAuthLoading(true);
      return;
    }
    
    // Once Redux is loaded (true or false), set auth loading to false
    setIsAuthLoading(false);
    
    // User is definitely not logged in
    if (isAuthenticated === false) {
      toast.error("Please login to access mentor dashboard.");
      router.push("/");
      return;
    }
    
    // User is logged in but is not a mentor
    if (isAuthenticated && user && user.role !== "MENTOR") {
      toast.error("Access denied. Mentor access required.");
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, user, router, authCheckDelay]);

  const loadingMessages = [
    "Launching your dashboard... 🚀",
    "Preparing mentor space... 📊",
    "Powering up insights... ⚡",
    "Crafting your experience... ✨",
    "Almost there... 🎯",
    "Ready to mentor! 🎉"
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Cycle through messages while loading
  useEffect(() => {
    if (!isAuthLoading) return;
    
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 800);

    return () => clearInterval(messageTimer);
  }, [isAuthLoading, loadingMessages.length]);

  // Return loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-blue-400 mb-2">{loadingMessages[currentMessageIndex]}</p>
          <p className="text-sm text-gray-400">Your mentor dashboard is just moments away</p>
        </div>
      </div>
    );
  }

  // Return loading while dashboard data is being fetched
  if (isLoading) {
    return (
      <div className="relative bg-black text-white font-sans min-h-screen flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading dashboard data...</p>
          </div>
        </main>
      </div>
    );
  }

  // Handle profile completion success
  const handleProfileComplete = () => {
    setProfileInactive(false);
    setShowProfileModal(false);
    setDashboardData(prev => ({ ...prev, isActive: true }));
    toast.success('Profile completed successfully! Welcome aboard!');
  };

  // Return error state if data fetch failed
  if (error) {
    return (
      <div className="relative bg-black text-white font-sans min-h-screen flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 flex items-center justify-center">
          <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-2xl max-w-md">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-red-400 text-xl font-bold mb-3">Unable to Load Dashboard</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Professional stats display - use actual data from API or defaults
  const mentorStats = {
    totalEarnings: dashboardData?.totalEarnings || 0,
    studentsMentored: dashboardData?.studentsMentored || 0,
    sessionsCompleted: dashboardData?.sessionsCompleted || 0,
    avgRating: dashboardData?.avgRating || 0,
    thisMonthEarnings: dashboardData?.thisMonthEarnings || 0,
    pendingSessions: dashboardData?.pendingSessions || 0
  };

  return (
    <div className="relative bg-black text-white font-sans min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-8 w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-purple-900/40 border border-blue-700/50 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                Myprofession<span className="text-white">.CA</span>
              </div>
              <div className="h-8 w-px bg-gray-600"></div>
              <FaUserTie className="text-blue-400 text-2xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-300">
              Welcome back, {user?.name?.split(' ')[0] || "Mentor"}!
            </h1>
            <p className="text-base sm:text-lg text-gray-400 mt-1">
              Your mentor dashboard at a glance
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
            >
              ← Back to Website
            </button>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "MN"}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FaMoneyBillWave}
            title="Total Earnings"
            value={`₹${mentorStats.totalEarnings.toLocaleString()}`}
            subtitle="Lifetime earnings"
            gradient="from-green-600 to-emerald-500"
          />
          <StatCard
            icon={FaUserGraduate}
            title="Students Mentored"
            value={mentorStats.studentsMentored}
            subtitle="Total students"
            gradient="from-purple-600 to-pink-500"
          />
          <StatCard
            icon={FaVideo}
            title="Sessions"
            value={mentorStats.sessionsCompleted}
            subtitle="Completed"
            gradient="from-blue-600 to-cyan-500"
          />
          <StatCard
            icon={FaStar}
            title="Rating"
            value={mentorStats.avgRating}
            subtitle="Average rating"
            gradient="from-yellow-500 to-orange-500"
          />
        </div>

        {/* Performance Overview */}
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FaChartLine className="text-blue-400" />
            Performance Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-300">This Month</h3>
                <FaChartBar className="text-green-400 text-xl" />
              </div>
              <p className="text-3xl font-bold text-green-400">₹{mentorStats.thisMonthEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">This month's earnings</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-300">Pending Sessions</h3>
                <FaCalendarDay className="text-blue-400 text-xl" />
              </div>
              <p className="text-3xl font-bold text-blue-400">{mentorStats.pendingSessions}</p>
              <p className="text-sm text-gray-400 mt-1">No pending sessions</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-300">Completion Rate</h3>
                <FaTrophy className="text-yellow-400 text-xl" />
              </div>
              <p className="text-3xl font-bold text-yellow-400">0%</p>
              <p className="text-sm text-gray-400 mt-1">No sessions completed yet</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FaClock className="text-blue-400" />
            Upcoming Sessions
          </h2>

          {meetings && meetings.length > 0 ? (
            <div className="space-y-4">
              {meetings.slice(0, 5).map((meeting, idx) => (
                <div key={idx} className="bg-gray-800/30 p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{meeting.topic || "CA Guidance Session"}</h3>
                      <p className="text-sm text-gray-400">with {meeting.with || "Student"}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <span className="text-sm text-blue-400">{meeting.date || "Today"}, {meeting.time || "3:00 PM"}</span>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
                        Join Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaCalendarDay className="text-5xl mx-auto" />
              </div>
              <p className="text-gray-400">No upcoming sessions scheduled</p>
              <button className="mt-4 text-blue-400 hover:text-blue-300 underline">
                View Calendar
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="View Profile"
            description="Manage your professional profile"
            icon={FaUserTie}
            onClick={() => router.push("/mentor/myprofile")}
          />
          <QuickActionCard
            title="My Bookings"
            description="View your bookings"
            icon={FaCalendarDay}
            onClick={() => router.push("/mentor/mybookings")}
          />
          <QuickActionCard
            title="My Sessions"
            description="View your sessions"
            icon={FaUsers}
            onClick={() => router.push("/mentor/my-sessions")}
          />
          <QuickActionCard
            title="My Earnings"
            description="View your earnings"
            icon={FaMoneyBillWave}
            onClick={() => {
              toast.info("Earnings feature coming soon!");
            }}
          />
        </div>

        {/* Footer Branding */}
        <footer className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <div className="text-xl font-bold text-blue-400">
                Myprofession<span className="text-white">.CA</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Professional CA Services Platform
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>© 2024 Myprofession.CA</span>
              <span>•</span>
              <span>Mentor Portal</span>
            </div>
          </div>
        </footer>
      </main>
      
      {/* Inactive Profile Modal */}
      <InactiveProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileComplete={handleProfileComplete}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, title, value, subtitle, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl bg-gradient-to-br ${gradient} group-hover:scale-105 transition-all duration-300`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
        <Icon className="text-8xl" />
      </div>
      <div className="relative">
        <Icon className="text-3xl mb-4 opacity-80" />
        <h3 className="text-2xl font-bold mb-1">{value}</h3>
        <p className="text-sm opacity-80">{subtitle}</p>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ title, description, icon: Icon, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700 hover:border-gray-600 rounded-xl p-4 text-left transition-all duration-200 group"
    >
      <Icon className="text-2xl text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </button>
  );
}
