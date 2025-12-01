'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { fetchClasses } from '@/redux/classSlice';
import { toast } from 'react-hot-toast';
import {
  FaCalendarCheck,
  FaUserTie,
  FaClock,
  FaChartLine,
  FaVideo,
  FaCheckCircle,
  FaTimesCircle,
  FaPlayCircle
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';

export default function MySessionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { stats } = useSelector((state) => state.classes || {});
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isLoggedIn);

  // Create state to track auth initialization
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authCheckDelay, setAuthCheckDelay] = useState(true);
  const loadingMessages = [
    "Loading your sessions... 📚",
    "Preparing mentor space... 📊",
    "Gathering session data... 📋",
    "Almost there... 🎯",
    "Ready to view sessions! 🎉"
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Give Redux 1 second to initialize on page refresh
    const timer = setTimeout(() => {
      setAuthCheckDelay(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Cycle through messages while loading
  useEffect(() => {
    if (!isAuthLoading) return;
    
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 800);

    return () => clearInterval(messageTimer);
  }, [isAuthLoading, loadingMessages.length]);

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
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router, authCheckDelay]);

  const defaultStats = {
    nextSession: '05 Aug, 3:00 PM',
    clients: 18,
    hours: 122,
    performance: '92%',
    insights: [
      { date: 'Mon', live: 5, questions: 12 },
      { date: 'Tue', live: 8, questions: 9 },
      { date: 'Wed', live: 6, questions: 11 },
      { date: 'Thu', live: 9, questions: 14 },
      { date: 'Fri', live: 12, questions: 7 },
      { date: 'Sat', live: 4, questions: 5 },
      { date: 'Sun', live: 7, questions: 10 },
    ],
  };

  const allSessions = [
    {
      _id: '3',
      date: '2025-08-05',
      time: '03:00 PM',
      withWhom: 'John Doe',
      status: 'Upcoming',
      email: 'john.doe@example.com',
      paymentStatus: 'Paid'
    },
    {
      _id: '4',
      date: '2025-08-06',
      time: '02:00 PM',
      withWhom: 'Jane Smith',
      status: 'Upcoming',
      email: 'jane.smith@example.com',
      paymentStatus: 'Paid'
    },
    {
      _id: '1',
      date: '2025-08-01',
      time: '10:00 AM',
      withWhom: 'Alice Johnson',
      status: 'Completed',
      email: 'alice.johnson@example.com',
      paymentStatus: 'Paid'
    },
    {
      _id: '2',
      date: '2025-08-02',
      time: '11:30 AM',
      withWhom: 'Michael Brown',
      status: 'Completed',
      email: 'michael.brown@example.com',
      paymentStatus: 'Paid'
    },
    {
      _id: '5',
      date: '2025-08-07',
      time: '04:00 PM',
      withWhom: 'Sarah Wilson',
      status: 'Pending Payment',
      email: 'sarah.wilson@example.com',
      paymentStatus: 'Pending'
    }
  ];

  useEffect(() => {
    // Only fetch classes if user is authenticated and is a mentor
    // Don't redirect here - that's handled by the main auth check
    if (user && isAuthenticated && user.role === "MENTOR") {
      dispatch(fetchClasses());
    }
  }, [user, isAuthenticated, dispatch]);

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

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-md ${color}`}>
      <Icon className="text-white text-2xl" />
      <div>
        <div className="text-gray-200 text-sm">{label}</div>
        <div className="text-white font-semibold text-lg">{value}</div>
      </div>
    </div>
  );

  const handleJoinSession = (sessionId) => {
    toast.success(`Joining session ${sessionId}...`);
    // In real implementation, this would redirect to video call or open meeting link
    setTimeout(() => {
      toast("Video call feature would open here");
    }, 1000);
  };

  const handleCompleteSession = (sessionId) => {
    toast.success(`Session ${sessionId} marked as completed`);
    // In real implementation, this would make an API call to update session status
  };

  const handleRejectSession = (sessionId) => {
    toast.error(`Session ${sessionId} rejected`);
    // In real implementation, this would make an API call to reject the session
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Upcoming': 'bg-blue-500 text-white',
      'Completed': 'bg-green-500 text-white',
      'Pending Payment': 'bg-yellow-500 text-white',
      'Rejected': 'bg-red-500 text-white'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${statusConfig[status] || 'bg-gray-500 text-white'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black">
      <div className="md:w-64 w-full">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 sm:p-6 overflow-x-auto text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Sessions</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
          >
            ← Back to Website
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard icon={FaCalendarCheck} label="Next Session" value={stats?.nextSession || defaultStats.nextSession} color="bg-blue-700" />
          <StatCard icon={FaUserTie} label="Clients" value={stats?.clients || defaultStats.clients} color="bg-purple-700" />
          <StatCard icon={FaClock} label="Hours Mentored" value={stats?.hours || defaultStats.hours} color="bg-green-700" />
          <StatCard icon={FaChartLine} label="Performance" value={stats?.performance || defaultStats.performance} color="bg-yellow-600" />
        </div>

        {/* Engagement Chart */}
        <motion.div
          className="my-10 bg-[#1f2937] p-4 sm:p-6 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-xl font-semibold mb-4">Engagement Insights</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.insights || defaultStats.insights}>
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} labelStyle={{ color: '#fff' }} />
              <Line type="monotone" dataKey="live" stroke="#FBBF24" strokeWidth={2} />
              <Line type="monotone" dataKey="questions" stroke="#60A5FA" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sessions Table */}
        <motion.div
          className="overflow-x-auto bg-[#1f2937] p-4 sm:p-6 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h2 className="text-xl font-semibold mb-4">All Sessions</h2>
          <table className="min-w-full text-left border border-gray-700 text-sm">
            <thead className="bg-[#374151] text-gray-300">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Student</th>
                <th className="p-3">Email</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allSessions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((session, index) => (
                  <tr
                    key={session._id}
                    className={`border-t border-gray-700 ${
                      index % 2 === 0 ? 'bg-[#1e293b]' : 'bg-[#111827]'
                    } hover:bg-[#2d3748] transition`}
                  >
                    <td className="p-3">{new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td className="p-3">{session.time}</td>
                    <td className="p-3 font-medium">{session.withWhom}</td>
                    <td className="p-3 text-gray-400 text-xs">{session.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        session.paymentStatus === 'Paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                      }`}>
                        {session.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {session.status === 'Upcoming' && session.paymentStatus === 'Paid' && (
                          <>
                            <button 
                              onClick={() => handleJoinSession(session._id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition flex items-center gap-1"
                            >
                              <FaPlayCircle />
                              Join Now
                            </button>
                            <button 
                              onClick={() => handleCompleteSession(session._id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition flex items-center gap-1"
                            >
                              <FaCheckCircle />
                              Complete
                            </button>
                            <button 
                              onClick={() => handleRejectSession(session._id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition flex items-center gap-1"
                            >
                              <FaTimesCircle />
                              Reject
                            </button>
                          </>
                        )}
                        {session.status === 'Completed' && (
                          <span className="text-gray-400 text-xs">Session completed</span>
                        )}
                        {session.status === 'Pending Payment' && (
                          <span className="text-yellow-400 text-xs">Awaiting payment</span>
                        )}
                        {session.status === 'Rejected' && (
                          <span className="text-red-400 text-xs">Session rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </motion.div>
      </main>
    </div>
  );
}
