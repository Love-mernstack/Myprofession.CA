"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useSelector } from "react-redux";
import {
  FaCalendarAlt, FaClock, FaUser, FaVideo, FaComments,
  FaCheckCircle, FaTimesCircle, FaArrowLeft, FaBook,
  FaFileAlt, FaUserGraduate, FaShoppingBag
} from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUserBookings } from '@/lib/api/bookingApi';

const STATUS_CONFIG = {
  'Scheduled': { color: 'blue', icon: FaCalendarAlt, label: 'Scheduled' },
  'Completed': { color: 'green', icon: FaCheckCircle, label: 'Completed' },
  'Cancelled': { color: 'red', icon: FaTimesCircle, label: 'Cancelled' },
  'No-Show': { color: 'orange', icon: FaTimesCircle, label: 'No Show' },
};

const ORDER_TYPES = [
  { id: 'mentorship', label: 'Mentorship', icon: FaUserGraduate },
  { id: 'courses', label: 'Courses', icon: FaBook },
  { id: 'files', label: 'Files', icon: FaFileAlt },
];

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('mentorship');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
      return;
    }
    
    if (activeTab === 'mentorship') {
      fetchBookings();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, filter, activeTab]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: 1,
        limit: 50
      };
      
      if (filter === 'upcoming') {
        params.upcoming = true;
      }
      
      const result = await getUserBookings(params);
      
      if (result.success) {
        setBookings(result.bookings || []);
      } else {
        setError(result.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredBookings = () => {
    const now = new Date();
    
    if (filter === 'upcoming') {
      return bookings.filter(b => new Date(b.scheduledAt) >= now);
    } else if (filter === 'past') {
      return bookings.filter(b => new Date(b.scheduledAt) < now);
    }
    return bookings;
  };

  const formatTimeUntilMeeting = (milliseconds) => {
    const minutes = Math.ceil(milliseconds / 60000);
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days}d`;
  };

  const filteredBookings = getFilteredBookings();

  // Render coming soon for courses and files
  const renderComingSoon = (type) => (
    <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700">
      {type === 'courses' ? (
        <FaBook className="text-5xl text-blue-500 mx-auto mb-4" />
      ) : (
        <FaFileAlt className="text-5xl text-purple-500 mx-auto mb-4" />
      )}
      <h3 className="text-xl font-semibold text-gray-300 mb-2">
        {type === 'courses' ? 'Courses' : 'Files'} Coming Soon!
      </h3>
      <p className="text-gray-400 mb-6">
        We're working on bringing you amazing {type === 'courses' ? 'courses' : 'files'}.
        <br />
        Stay tuned for updates!
      </p>
    </div>
  );

  if (isLoading && activeTab === 'mentorship') {
    return (
      <div className="bg-black min-h-screen text-white">
        <Header />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white min-h-screen">
      <Header />
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all hover:gap-3 mb-4"
          >
            <FaArrowLeft className="text-xl" />
            <span className="text-lg font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <FaShoppingBag className="text-3xl text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              My Orders
            </h1>
          </div>
          <p className="text-gray-400">View and manage all your purchases</p>
        </div>

        {/* Order Type Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {ORDER_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setActiveTab(type.id);
                  setFilter('all');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeTab === type.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'courses' && renderComingSoon('courses')}
        {activeTab === 'files' && renderComingSoon('files')}
        
        {activeTab === 'mentorship' && (
          <>
            {/* Filter Tabs for Mentorship */}
            <div className="mb-6 flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'past'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Past
              </button>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-6">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700">
                <FaCalendarAlt className="text-5xl text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No mentorship sessions found</h3>
                <p className="text-gray-400 mb-6">
                  {filter === 'upcoming' 
                    ? "You don't have any upcoming sessions"
                    : filter === 'past'
                    ? "You don't have any past sessions"
                    : "You haven't booked any mentorship sessions yet"}
                </p>
                <button
                  onClick={() => router.push('/mentors')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-colors"
                >
                  Browse Mentors
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.map((booking) => {
                  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG['Scheduled'];
                  const StatusIcon = statusConfig.icon;
                  const SessionIcon = booking.meetingType === 'video' ? FaVideo : FaComments;
                  
                  return (
                    <div
                      key={booking._id}
                      className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      {/* Mentor Info */}
                      <div className="flex items-center gap-3 mb-4">
                        {booking.mentor.avatar ? (
                          <img
                            src={booking.mentor.avatar}
                            alt={booking.mentor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                            <FaUser className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{booking.mentor.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <SessionIcon className="text-xs" />
                            <span className="capitalize">{booking.meetingType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <FaCalendarAlt className="text-blue-400" />
                          <span className="text-sm">{formatDate(booking.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <FaClock className="text-purple-400" />
                          <span className="text-sm">{formatTime(booking.scheduledAt)}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-${statusConfig.color}-900/30 border border-${statusConfig.color}-700`}>
                          <StatusIcon className={`text-${statusConfig.color}-400 text-xs`} />
                          <span className={`text-xs font-medium text-${statusConfig.color}-300`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Order #{booking.order.orderNumber}</span>
                          <span className="text-green-400 font-semibold">
                            ₹{(booking.order.amount / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Join Button (for scheduled meetings within join window) */}
                      {booking.status === 'Scheduled' && (() => {
                        const meetingTime = new Date(booking.scheduledAt);
                        const sessionDuration = 15; // 15 minutes session duration
                        const allowedStartTime = new Date(meetingTime.getTime() - 5 * 60 * 1000); // 5 min before
                        const meetingEndTime = new Date(meetingTime.getTime() + sessionDuration * 60 * 1000); // scheduled time + 15 min
                        
                        // Show join button if current time is within the join window
                        const isWithinJoinWindow = currentTime >= allowedStartTime && currentTime <= meetingEndTime;
                        
                        if (!isWithinJoinWindow) {
                          return null; // Don't show button outside join window
                        }
                        
                        const canJoin = currentTime >= allowedStartTime;
                        const timeUntil = allowedStartTime - currentTime;
                        const formattedTime = formatTimeUntilMeeting(timeUntil);
                        
                        return (
                          <button
                            onClick={() => {
                              if (!canJoin) {
                                alert(`Meeting can be joined in ${formattedTime}`);
                                return;
                              }
                              router.push(`/meeting/${booking._id}`);
                            }}
                            className={`w-full mt-4 ${canJoin ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-gray-600 cursor-not-allowed'} text-white py-2 rounded-lg transition-all font-medium`}
                            disabled={!canJoin}
                          >
                            {canJoin ? 'Join Session' : `Join in ${formattedTime}`}
                          </button>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
