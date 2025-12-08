'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { fetchClasses } from '@/redux/classSlice';
import { toast } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import { getUserBookings } from '@/lib/api/bookingApi';

export default function MySessionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { stats } = useSelector((state) => state.classes || {});
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isLoggedIn);

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
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router, authCheckDelay]);

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user bookings
  useEffect(() => {
    const loadBookings = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await getUserBookings({ limit: 100 });
        
        if (response.success) {
          // Transform API data to match component structure
          const transformedSessions = response.bookings.map(booking => ({
            _id: booking._id,
            date: new Date(booking.scheduledAt).toISOString().split('T')[0],
            time: new Date(booking.scheduledAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            withWhom: booking.mentor.name,
            status: booking.status,
            email: '', // Not provided by API for user bookings
            paymentStatus: booking.order.status,
            completionDate: booking.status === 'Completed' ? new Date(booking.scheduledAt).toISOString().split('T')[0] : null
          }));
          
          setSessions(transformedSessions);
        } else {
          setError('Failed to load bookings');
        }
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError(err.message || 'Failed to load bookings');
        toast.error('Failed to load your sessions');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [isAuthenticated, user]);

  const handleRejectSession = (sessionId) => {
    toast.error(`Session ${sessionId} rejected`);
    // Update session status to rejected
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session._id === sessionId ? { ...session, status: 'Rejected' } : session
      )
    );
  };

  const handleJoinSession = (sessionId) => {
    toast.success(`Joining session ${sessionId}...`);
    // In real implementation, this would open the meeting link/video call
    setTimeout(() => {
      toast("Video call feature would open here");
    }, 1000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Scheduled': 'bg-blue-900 text-blue-300',
      'Upcoming': 'bg-blue-900 text-blue-300',
      'InProgress': 'bg-yellow-900 text-yellow-300',
      'Completed': 'bg-green-900 text-green-300',
      'Cancelled': 'bg-red-900 text-red-300',
      'Rejected': 'bg-red-900 text-red-300'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[status] || 'bg-gray-900 text-gray-300'}`}>
        {status}
      </span>
    );
  };

  // --- FIX START: Wrapped in IF condition and removed extra closing bracket ---
  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-blue-400 mb-2">Loading your sessions...</p>
          <p className="text-sm text-gray-400">Your dashboard is just moments away</p>
        </div>
      </div>
    );
  }
  // --- FIX END ---

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black">
      <div className="md:w-64 w-full">
        <Sidebar />
      </div>

      <main className="flex-1 p-6 overflow-x-auto text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-light">My Sessions</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
          >
            ← Back to Website
          </button>
        </div>

        {/* Upcoming Sessions Table */}
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 mb-6">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-medium text-gray-300">Upcoming Sessions</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Scheduled By</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sessions
                  .filter(session => session.status === 'Scheduled' || session.status === 'Upcoming')
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((session) => (
                    <tr key={session._id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {session.withWhom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {session.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(session.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {session.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleJoinSession(session._id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition"
                          >
                            Join Now
                          </button>
                          <button
                            onClick={() => handleRejectSession(session._id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {sessions.filter(session => session.status === 'Scheduled' || session.status === 'Upcoming').length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400">No upcoming sessions found.</p>
            </div>
          )}
        </div>

        {/* Completed Sessions Table */}
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-medium text-gray-300">Completed Sessions</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Scheduled By</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sessions
                  .filter(session => session.status === 'Completed')
                  .sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate))
                  .map((session) => (
                    <tr key={session._id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {session.withWhom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {session.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(session.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {session.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(session.status)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {sessions.filter(session => session.status === 'Completed').length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400">No completed sessions found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}