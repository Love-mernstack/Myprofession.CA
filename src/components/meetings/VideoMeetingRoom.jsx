import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getJoinCredentials } from '@/lib/api/meetingApi';
import MeetingTimer from './MeetingTimer';

export default function VideoMeetingRoom({ meetingId, onMeetingEnd }) {
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initMeeting() {
      try {
        setLoading(true);
        
        // 1. Fetch credentials from backend
        console.log('[VideoMeeting] Fetching join credentials...');
        const response = await getJoinCredentials(meetingId);
        
        if (!isMounted) return;

        if (!response.success) {
          throw new Error(response.message || 'Failed to get join credentials');
        }

        const { credentials: creds, meeting } = response;
        setCredentials({ ...creds, meeting });
        
        console.log('[VideoMeeting] Credentials received:', {
          roomId: creds.roomId,
          role: creds.role,
          meetingType: creds.meetingType
        });

        // ZegoCloud implementation removed
        setLoading(false);
        
      } catch (error) {
        console.error('[VideoMeeting] Initialization error:', error);
        if (isMounted) {
          setError(error.message || 'Failed to join meeting');
          setLoading(false);
          toast.error(error.message || 'Failed to join meeting');
        }
      }
    }

    initMeeting();

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  const handleTimeUp = () => {
    toast('Meeting time has ended', {
      icon: '⏰',
      duration: 5000,
    });
    if (onMeetingEnd) {
      onMeetingEnd();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-2">Unable to Join Meeting</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-900 flex flex-col items-center justify-center">
      {credentials && (
        <MeetingTimer 
          scheduledAt={credentials.scheduledAt}
          duration={60} // Default 60 minutes
          onTimeUp={handleTimeUp}
        />
      )}
      
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl max-w-2xl border border-gray-700">
        <div className="mb-6 p-4 bg-blue-900/30 rounded-full inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Video Service Disabled</h2>
        <p className="text-gray-300 mb-8 text-lg">
          The video meeting service has been temporarily disabled. 
          Please contact support or try again later.
        </p>
        <div className="flex justify-center gap-4">
            <button 
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-medium"
            >
                Go Back
            </button>
        </div>
      </div>
    </div>
  );
}

