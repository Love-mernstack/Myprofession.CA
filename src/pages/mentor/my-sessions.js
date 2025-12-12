'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { fetchClasses } from '@/redux/classSlice';
import { toast } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import { getMentorMeetings, cancelMentorMeeting } from '@/lib/api/bookingApi';

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
  const [cancellingMeetingId, setCancellingMeetingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [error, setError] = useState(null);

  // Fetch mentor meetings
  useEffect(() => {
    const loadMeetings = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await getMentorMeetings({ limit: 100 });
        
        if (response.success) {
          // Transform API data to match component structure
          const transformedSessions = response.meetings.map(meeting => ({
            _id: meeting._id,
            date: new Date(meeting.scheduledAt).toISOString().split('T')[0],
            time: new Date(meeting.scheduledAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            withWhom: meeting.user.name,
            status: meeting.status,
            email: meeting.user.email,
            paymentStatus: meeting.order.status,
            completionDate: meeting.status === 'Completed' ? new Date(meeting.scheduledAt).toISOString().split('T')[0] : null
          }));
          
          setSessions(transformedSessions);
        } else {
          setError('Failed to load meetings');
        }
      } catch (err) {
        console.error('Error loading meetings:', err);
        setError(err.message || 'Failed to load meetings');
        toast.error('Failed to load your sessions');
      } finally {
        setIsLoading(false);
      }
    };

    loadMeetings();
  }, [isAuthenticated, user]);

  const handleCancelClick = (sessionId) => {
    setSelectedMeetingId(sessionId);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setSelectedMeetingId(null);
    setCancellationReason('');
  };

  const handleConfirmCancellation = async () => {
    if (!cancellationReason || cancellationReason.trim() === '') {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    
    try {
      setCancellingMeetingId(selectedMeetingId);
      setShowCancelModal(false);
      
      const response = await cancelMentorMeeting(selectedMeetingId, cancellationReason.trim());
      
      if (response.success) {
        toast.success('Meeting cancelled successfully. Refund has been initiated.');
        
        // Refresh meetings list
        const updatedMeetings = await getMentorMeetings({ limit: 100 });
        if (updatedMeetings.success) {
          const transformedSessions = updatedMeetings.meetings.map(meeting => ({
            _id: meeting._id,
            date: new Date(meeting.scheduledAt).toISOString().split('T')[0],
            time: new Date(meeting.scheduledAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            withWhom: meeting.user.name,
            status: meeting.status,
            email: meeting.user.email,
            paymentStatus: meeting.order.status,
            completionDate: meeting.status === 'Completed' ? new Date(meeting.scheduledAt).toISOString().split('T')[0] : null
          }));
          setSessions(transformedSessions);
        }
      } else {
        toast.error(response.message || 'Failed to cancel meeting');
      }
    } catch (err) {
      console.error('Error cancelling meeting:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel meeting');
    } finally {
      setCancellingMeetingId(null);
      setSelectedMeetingId(null);
      setCancellationReason('');
    }
  };

  const formatTimeUntilMeeting = (milliseconds) => {
    const minutes = Math.ceil(milliseconds / 60000);
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      if (remainingMinutes > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (remainingHours > 0) {
      return `${days} day${days !== 1 ? 's' : ''} and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const handleJoinSession = (sessionId, scheduledAt, status) => {
    // Check if meeting is still scheduled
    if (status === 'Cancelled') {
      toast.error('This meeting has been cancelled');
      return;
    }
    
    if (status === 'Completed') {
      toast.error('This meeting has already ended');
      return;
    }
    
    // Check time window (mentor can join 15 min before, 30 min after)
    const now = new Date();
    const meetingTime = new Date(scheduledAt);
    const allowedStartTime = new Date(meetingTime.getTime() - 15 * 60 * 1000);
    const allowedEndTime = new Date(meetingTime.getTime() + 30 * 60 * 1000);
    
    if (now < allowedStartTime) {
      const timeUntil = allowedStartTime - now;
      const formattedTime = formatTimeUntilMeeting(timeUntil);
      toast.error(`Meeting can be joined in ${formattedTime}`);
      return;
    }
    
    if (now > allowedEndTime) {
      toast.error('Meeting join window has expired');
      return;
    }
    
    // Route to meeting page
    router.push(`/meeting/${sessionId}`);
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
                            onClick={() => handleJoinSession(session._id, session.date + 'T' + session.time, session.status)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition"
                          >
                            Start Meeting
                          </button>
                          <button
                            onClick={() => handleCancelClick(session._id)}
                            disabled={cancellingMeetingId === session._id}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingMeetingId === session._id ? 'Cancelling...' : 'Cancel'}
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

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Cancel Meeting</h3>
              <p className="text-sm text-gray-400 mt-1">Please provide a reason for cancellation</p>
            </div>
            
            <div className="p-6">
              <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-300 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                id="cancellation-reason"
                rows={4}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g., Emergency came up, need to reschedule..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                The user will be notified and a full refund will be initiated automatically.
              </p>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
              <button
                onClick={handleCancelModalClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancellation}
                disabled={!cancellationReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}