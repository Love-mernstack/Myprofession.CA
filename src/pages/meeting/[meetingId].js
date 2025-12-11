import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { getMeetingDetails } from '@/lib/api/meetingApi';

// Dynamic imports to prevent SSR (ZegoCloud requires browser environment)
const VideoMeetingRoom = dynamic(() => import('@/components/meetings/VideoMeetingRoom'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading meeting room...</p>
      </div>
    </div>
  )
});

const ChatMeetingRoom = dynamic(() => import('@/components/meetings/ChatMeetingRoom'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading chat room...</p>
      </div>
    </div>
  )
});

export default function MeetingPage() {
  const router = useRouter();
  const { meetingId } = router.query;
  const { user } = useSelector((state) => state.auth);
  
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canJoin, setCanJoin] = useState(false);
  const [joinWindow, setJoinWindow] = useState(null);

  useEffect(() => {
    if (!meetingId || !user) return;

    async function fetchMeetingDetails() {
      try {
        setLoading(true);
        const response = await getMeetingDetails(meetingId);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch meeting details');
        }

        setMeeting(response.meeting);
        
        // Calculate join window
        const now = new Date();
        const scheduledTime = new Date(response.meeting.scheduledAt);
        const isMentor = user.id === response.meeting.mentor.id || user._id === response.meeting.mentor.id;
        
        const beforeWindow = isMentor ? 15 : 5;
        const afterWindow = isMentor ? 30 : 15;
        
        const allowedStartTime = new Date(scheduledTime.getTime() - beforeWindow * 60 * 1000);
        const allowedEndTime = new Date(scheduledTime.getTime() + afterWindow * 60 * 1000);
        
        const canJoinNow = now >= allowedStartTime && now <= allowedEndTime;
        setCanJoin(canJoinNow);
        setJoinWindow({
          allowedStartTime,
          allowedEndTime,
          scheduledTime,
          isMentor
        });
        
        setLoading(false);
      } catch (error) {
        console.error('[MeetingPage] Error fetching meeting:', error);
        setError(error.message || 'Failed to load meeting');
        setLoading(false);
      }
    }

    fetchMeetingDetails();
  }, [meetingId, user]);

  const handleMeetingEnd = () => {
    toast.success('Meeting ended');
    // Redirect to dashboard
    router.push('/my-sessions');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading meeting...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/my-sessions')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  // Not authorized or meeting not ready
  if (!meeting || !canJoin) {
    const now = new Date();
    const minutesUntilStart = joinWindow 
      ? Math.ceil((joinWindow.allowedStartTime - now) / 60000) 
      : 0;
    const hasExpired = joinWindow && now > joinWindow.allowedEndTime;

    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8 bg-gray-800 rounded-lg">
          {hasExpired ? (
            <>
              <div className="text-yellow-500 text-5xl mb-4">⏱️</div>
              <h2 className="text-white text-2xl font-bold mb-2">Meeting Window Expired</h2>
              <p className="text-gray-300 mb-4">
                The join window for this meeting has closed.
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Scheduled time: {new Date(meeting.scheduledAt).toLocaleString()}
              </p>
            </>
          ) : (
            <>
              <div className="text-blue-500 text-5xl mb-4">🕐</div>
              <h2 className="text-white text-2xl font-bold mb-2">Meeting Not Started</h2>
              <p className="text-gray-300 mb-4">
                You can join {joinWindow?.isMentor ? '15' : '5'} minutes before the scheduled time.
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Scheduled time: {new Date(meeting.scheduledAt).toLocaleString()}
              </p>
              {minutesUntilStart > 0 && (
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4">
                  <p className="text-blue-300 text-lg font-semibold">
                    Join available in {minutesUntilStart} minute{minutesUntilStart !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </>
          )}
          <button
            onClick={() => router.push('/my-sessions')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  // Meeting status check
  if (meeting.status === 'Cancelled') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
          <div className="text-red-500 text-5xl mb-4">🚫</div>
          <h2 className="text-white text-2xl font-bold mb-2">Meeting Cancelled</h2>
          <p className="text-gray-300 mb-4">This meeting has been cancelled.</p>
          <button
            onClick={() => router.push('/my-sessions')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  if (meeting.status === 'Completed') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h2 className="text-white text-2xl font-bold mb-2">Meeting Completed</h2>
          <p className="text-gray-300 mb-4">This meeting has already ended.</p>
          <button
            onClick={() => router.push('/my-sessions')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate meeting room based on type
  if (meeting.type === 'chat') {
    return <ChatMeetingRoom meetingId={meetingId} onMeetingEnd={handleMeetingEnd} />;
  } else {
    return <VideoMeetingRoom meetingId={meetingId} onMeetingEnd={handleMeetingEnd} />;
  }
}
