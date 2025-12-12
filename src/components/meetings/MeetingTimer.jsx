import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function MeetingTimer({ scheduledAt, duration = 60, onTimeUp }) {
  const [elapsed, setElapsed] = useState(0);
  const [hasWarned, setHasWarned] = useState(false);
  
  const totalSeconds = duration * 60;
  const remaining = totalSeconds - elapsed;
  const remainingMinutes = Math.floor(remaining / 60);
  const remainingSeconds = remaining % 60;
  
  useEffect(() => {
    const startTime = new Date(scheduledAt).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      
      setElapsed(elapsedSec);
      
      // 2-minute warning
      if (remaining === 120 && !hasWarned) {
        setHasWarned(true);
        toast((t) => (
          <div className="flex flex-col gap-2">
            <strong className="text-lg">⏰ Meeting Ending Soon</strong>
            <p className="text-sm">2 minutes remaining. Please start wrapping up.</p>
          </div>
        ), {
          duration: 5000,
          icon: '⚠️',
          style: {
            background: '#FFA500',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
        
        // Play notification sound
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.play().catch(() => console.log('Audio playback failed'));
        } catch (error) {
          console.log('Audio not available');
        }
      }
      
      // Time's up
      if (elapsedSec >= totalSeconds) {
        clearInterval(interval);
        toast.error('Meeting time has ended');
        onTimeUp?.();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [scheduledAt, duration, remaining, hasWarned, onTimeUp, totalSeconds]);
  
  const progress = (elapsed / totalSeconds) * 100;
  const timerColor = remaining > 120 ? 'text-green-600' : remaining > 60 ? 'text-yellow-600' : 'text-red-600';
  const progressColor = remaining > 120 ? 'bg-green-500' : remaining > 60 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 min-w-[160px]">
      <div className="text-sm text-gray-600 mb-2 font-medium">Meeting Time</div>
      <div className={`text-3xl font-bold ${timerColor} tabular-nums`}>
        {remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Elapsed: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {remaining <= 120 && (
        <div className="mt-2 text-xs text-orange-600 font-medium">
          ⚠️ Wrapping up
        </div>
      )}
    </div>
  );
}
