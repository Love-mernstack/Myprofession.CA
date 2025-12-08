"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/router'; // Pages Router uses next/router, not next/navigation
import Script from 'next/script';
import { useDispatch, useSelector } from "react-redux";
import { 
  FaComments, FaVideo, FaArrowLeft, FaCalendarAlt, 
  FaClock, FaUser, FaMapMarkerAlt, FaStar, FaCheck, FaVideoSlash,
  FaBusinessTime
} from "react-icons/fa";
import "react-day-picker/dist/style.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { setLoginSuccess } from "@/redux/authSlice";
import { getMentorById, getCalendarSlots, getAvailableSlotsForDate } from '@/lib/api/mentorApi';
import { createBooking, verifyPayment, cancelBooking } from '@/lib/api/bookingApi';

const MODES = [
  { type: "chat", icon: <FaComments />, label: "Chat" },
  { type: "video", icon: <FaVideo />, label: "Video Call" },
];

// Custom Calendar with Event Visualization
const CustomCalendar = ({ selected, onSelect, dayWiseAvailableDates }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [hoveredDay, setHoveredDay] = useState(null);
  
  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };
  
  // Generate calendar days with events
  const renderDay = (day) => {
    // Format date as YYYY-MM-DD in local timezone
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const dayNum = String(day.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayNum}`;
    
    const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
    const hasEvents = dayWiseAvailableDates.find(d => d.date === dateStr);
    const isSelected = selected === dateStr;
    const isPast = day < today;
    const isAvailable = hasEvents && hasEvents.slots && hasEvents.slots.length > 0;
    
    return (
      <div
        className={`
          relative h-14 p-1 border rounded-lg transition-all cursor-pointer
          ${isPast || !isAvailable ? 'opacity-40 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-800/50'}
          ${isSelected ? 'border-blue-500 bg-blue-900/30 ring-2 ring-blue-500/50' : 'border-gray-700'}
          ${!isPast && !hasEvents && 'opacity-60'}
        `}
        onClick={() => !isPast && isAvailable && onSelect(dateStr)}
        onMouseEnter={() => setHoveredDay(dateStr)}
        onMouseLeave={() => setHoveredDay(null)}
      >
        <div className="text-center">
          <div className={`text-sm font-medium ${isSelected ? 'text-blue-300' : isPast ? 'text-gray-500' : isAvailable ? 'text-white' : 'text-gray-600'}`}>
            {day.getDate()}
          </div>
          <div className="text-xs text-gray-400">
            {day.toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
        </div>
        
        {isAvailable && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className={`w-2 h-2 bg-green-600 rounded-full`}></div>
          </div>
        )}
        
        {hoveredDay === dateStr && hasEvents && (
          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            <div className="text-white text-xs">
              <div className="font-semibold mb-1">{dayName}</div>
              <div className="space-y-1">
                {hasEvents.slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs">
                    <FaClock className="text-blue-400" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-px">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startPadding = firstDayOfMonth.getDay(); // Sunday = 0
    const days = [];
    
    // Add padding days for days before month starts
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
      const prevDay = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(
        <div key={`prev-${prevDay.getDate()}`} className="h-14 opacity-30 text-gray-600">
          <div className="text-center">
            <div className="text-sm">{prevDay.getDate()}</div>
          </div>
        </div>
      );
    }
    
    // Add actual days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(renderDay(new Date(year, month, day)));
    }
    
    // Add padding days for days after month ends
    const totalCells = days.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 cols
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="h-14 opacity-30 text-gray-600">
          <div className="text-center">
            <div className="text-sm">{day}</div>
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-semibold text-blue-400">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays()}
      </div>
    </div>
  );
};

export default function BookingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const mentorId = router.query.id; // Pages Router uses router.query, not useParams()
  
  // Auth state from Redux
  const { user, isLoggedIn, authLoading } = useSelector(state => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [mentor, setMentor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedMode, setSelectedMode] = useState("video");
  const [meetingTopic, setMeetingTopic] = useState("");
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [calendarSlots, setCalendarSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [dateSlots, setDateSlots] = useState([]);
  const [isLoadingDateSlots, setIsLoadingDateSlots] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (!mentorId) {
      setIsLoading(false);
      setError("No mentor ID specified.");
      return;
    }

    const fetchMentorDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await getMentorById(mentorId);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch mentor details');
        }

        const mentorData = result.data;

        const transformedMentor = {
          id: mentorData._id,
          name: mentorData.userRef.name,
          image: mentorData.userRef.avatar || "https://i.pravatar.cc/150?img=12",
          title: mentorData.registrationRef?.qualification?.[0] || 'Professional Mentor',
          rating: mentorData.rating || 4.5,
          pricing: mentorData.pricing || null,
          minSessionDuration: mentorData.minSessionDuration || 15,
          isActive: mentorData.isActive || false,
          isBanned: mentorData.isBanned || false,
          isAvailableNow: mentorData.isAvailableNow || false,
          availabilitySchedule: mentorData.availability || [],
          languages: mentorData.registrationRef?.languages || [],
          experience: mentorData.registrationRef?.experienceInfo || "Experienced professional",
          qualifications: mentorData.registrationRef?.qualification || [],
          expertise: mentorData.registrationRef?.expertise || [],
          location: mentorData.registrationRef?.languages?.join(", ") || "Location not specified",
          about: `${mentorData.registrationRef?.experienceInfo || "Experienced professional"} with expertise in ${mentorData.registrationRef?.expertise?.join(", ") || "multiple areas"}.`,
          socials: mentorData.socials || {},
        };

        setMentor(transformedMentor);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorDetails();
  }, [mentorId]);

  // Fetch calendar slots when mentor is loaded
  useEffect(() => {
    if (!mentorId) return;

    const fetchCalendarSlots = async () => {
      try {
        setIsLoadingSlots(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = today.toISOString().split('T')[0];
        
        // Fetch slots for next 60 days
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 60);
        const endDateStr = endDate.toISOString().split('T')[0];
        
        console.log('Fetching calendar slots for mentorId:', mentorId);
        const result = await getCalendarSlots(mentorId, startDate, endDateStr);
        
        if (result.success) {
          setCalendarSlots(result.slots || []);
        }
      } catch (err) {
        console.error('Failed to fetch calendar slots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchCalendarSlots();
  }, [mentorId]);

  // Use calendar slots from API (already filtered for booked slots)
  const dayWiseAvailableDates = calendarSlots.map(slot => ({
    date: slot.date,
    day: slot.dayOfWeek,
    slots: slot.availableSlots.filter(s => s.available), // Only show available slots
    isBlocked: slot.isBlocked
  }));
  
  // Get unique dates that have available slots
  const uniqueAvailableDates = dayWiseAvailableDates
    .filter(d => d.slots && d.slots.length > 0)
    .map(d => d.date);

  // Function to get price per 15-minute session based on selected mode
  const getPricePer15Minutes = (mode) => {
    if (!mentor?.pricing) return null;
    const pricingItem = mentor.pricing.find(p => p.type === mode);
    return pricingItem?.price || null;
  };

  // Function to calculate total duration for selected slots
  const getTotalDuration = () => {
    return selectedSlots.reduce((total, slot) => {
      const start = new Date(`1970-01-01T${slot.startTime}:00`);
      const end = new Date(`1970-01-01T${slot.endTime}:00`);
      const duration = (end - start) / (1000 * 60); // Convert to minutes
      return total + duration;
    }, 0);
  };

  const getPriceForDuration = (duration, mode) => {
    const pricePer15Minutes = getPricePer15Minutes(mode);
    if (pricePer15Minutes === null) return 'Pricing not available';
    
    // Calculate how many 15-minute blocks are needed
    const sessionBlocks = Math.ceil(duration / 15);
    const totalPrice = sessionBlocks * pricePer15Minutes;
    return `₹${totalPrice}`;
  };

  

  // Function to handle booking submission
  const handleBookingSubmit = async () => {
    // Check if user is logged in first
    if (!isLoggedIn || !user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedDate || selectedSlots.length === 0 || !meetingTopic.trim()) {
      alert("Please select a date, at least one time slot, and provide a meeting topic");
      return;
    }

    // Check if pricing is available
    if (!mentor?.pricing) {
      alert("Pricing information is not available for this mentor. Please contact support.");
      return;
    }

    // Check if Razorpay is loaded
    if (!razorpayLoaded || typeof window.Razorpay === 'undefined') {
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }

    const totalDuration = getTotalDuration();
    const priceForDuration = getPriceForDuration(totalDuration, selectedMode);
    if (priceForDuration === 'Pricing not available') {
      alert("Pricing is not available for the selected session type. Please try another mode or contact the mentor.");
      return;
    }

    setIsBookingLoading(true);
    
    try {
      // Format slots for backend
      const formattedSlots = selectedSlots.map(slot => ({
        date: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        sessionType: selectedMode
      }));

      // Create booking and get Razorpay order
      const bookingResponse = await createBooking({
        mentorId: mentor.id,
        slots: formattedSlots
      });

      if (!bookingResponse.success) {
        throw new Error(bookingResponse.message || 'Failed to create booking');
      }

      const { order } = bookingResponse;

      // Initialize Razorpay payment
      const options = {
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "CA Mentorship",
        description: `Session with ${order.mentor.name}`,
        order_id: order.razorpayOrderId,
        handler: async function (response) {
          await handlePaymentSuccess(response, order.orderId);
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#3B82F6"
        },
        modal: {
          ondismiss: function() {
            handlePaymentDismiss(order.orderId);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to create booking. Please try again.');
      setIsBookingLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentResponse, orderId) => {
    try {
      const verificationResponse = await verifyPayment({
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature
      });

      if (verificationResponse.success) {
        alert('🎉 Booking confirmed successfully! You will receive a confirmation email.');
        // Redirect to dashboard or bookings page
        router.push('/dashboard');
      } else {
        throw new Error(verificationResponse.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment succeeded but verification failed. Please contact support with your payment details.');
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Handle payment modal dismissal
  const handlePaymentDismiss = async (orderId) => {
    try {
      // Cancel the booking to release locked slots
      await cancelBooking(orderId);
      alert('Booking cancelled. Slots have been released.');
    } catch (error) {
      console.error('Cancel booking error:', error);
      alert('Payment was cancelled. Slots will be automatically released in 10 minutes.');
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Fetch slots when a date is selected
  useEffect(() => {
    // Guard: Ensure both selectedDate and mentorId are available before fetching
    if (!selectedDate || !mentorId) {
      console.log('Skipping slot fetch - selectedDate or mentorId not available:', { selectedDate, mentorId });
      return;
    }

    const fetchSlotsForDate = async () => {
      try {
        setIsLoadingDateSlots(true);
        console.log('Fetching slots for date:', selectedDate, 'mentorId:', mentorId);
        const result = await getAvailableSlotsForDate(mentorId, selectedDate);
        
        if (result.success) {
          // Show ALL slots (including booked ones with disabled state)
          setDateSlots(result.slots || []);
        } else {
          setDateSlots([]);
        }
      } catch (err) {
        console.error('Failed to fetch slots for date:', err);
        setDateSlots([]);
      } finally {
        setIsLoadingDateSlots(false);
      }
    };

    fetchSlotsForDate();
  }, [selectedDate, mentorId]);

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Header />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading booking page...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error || !mentor) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Header />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-2xl max-w-md">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-red-400 text-xl font-bold mb-3">Unable to Load Booking</h2>
            <p className="text-red-300 mb-4">{error || 'Mentor not found'}</p>
            <button
              onClick={() => router.push('/mentors')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-colors"
            >
              Go Back to Mentors
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white min-h-screen">
      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            dispatch(setLoginSuccess(user));
            setShowAuthModal(false);
          }}
        />
      )}
      
      {/* Load Razorpay Checkout Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error('Failed to load Razorpay script');
          setRazorpayLoaded(false);
        }}
      />
      
      <Header />
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all hover:gap-3"
          >
            <FaArrowLeft className="text-xl" />
            <span className="text-lg font-medium">Back to Profile</span>
          </button>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Book Your Session
            </h1>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        

        {/* Compact Booking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Section - 7 columns */}
          <div className="lg:col-span-7">
            <div className="bg-[#0f172a]/50 backdrop-blur-md border border-gray-800 rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <FaCalendarAlt />
                Select Date & Time
              </h3>
              
              {isLoadingSlots ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-400">Loading available slots...</p>
                </div>
              ) : dayWiseAvailableDates.length > 0 ? (
                <div className="space-y-4">
                  {/* Enhanced Calendar with Events */}
                  <CustomCalendar
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedSlots([]); // Clear selected slots when changing date
                    }}
                    dayWiseAvailableDates={dayWiseAvailableDates}
                  />

                  {/* Time Slots Grid */}
                  {selectedDate && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-lg text-white font-semibold">Available slots for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</p>
                        <p className="text-xs text-gray-500">
                          {selectedSlots.length > 0 && `${selectedSlots.length} slot${selectedSlots.length !== 1 ? 's' : ''} selected`}
                        </p>
                      </div>
                      {isLoadingDateSlots ? (
                        <div className="text-center py-8 bg-gray-800/30 rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <p className="text-gray-400 text-sm">Loading time slots...</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {dateSlots.map((slot, idx) => {
                              const isSelected = selectedSlots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                              const isBooked = !slot.available;
                              
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (isBooked) return; // Prevent clicking booked slots
                                    
                                    setSelectedSlots(prev => {
                                      const isAlreadySelected = prev.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                                      if (isAlreadySelected) {
                                        return prev.filter(s => !(s.startTime === slot.startTime && s.endTime === slot.endTime));
                                      } else {
                                        return [...prev, slot];
                                      }
                                    });
                                  }}
                                  disabled={isBooked}
                                  className={`relative p-3 rounded-lg text-xs sm:text-sm transition-all group border-2 ${
                                    isBooked
                                      ? "bg-gray-800/30 text-gray-500 border-gray-700/50 cursor-not-allowed opacity-60"
                                      : isSelected
                                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 transform scale-105 border-blue-400"
                                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700 hover:border-blue-500 cursor-pointer"
                                  }`}
                                >
                                  <div className="font-semibold text-center text-white whitespace-nowrap">
                                    {slot.startTime} → {slot.endTime}
                                  </div>
                                  {isBooked && (
                                    <div className="absolute top-1 right-1 bg-red-600/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                      BOOKED
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {dateSlots.length === 0 && (
                            <div className="text-center py-8 bg-gray-800/30 rounded-lg">
                              <FaVideoSlash className="text-3xl text-gray-500 mx-auto mb-2" />
                              <p className="text-gray-400">No available slots</p>
                              <p className="text-gray-500 text-sm">Please select another date</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {selectedSlots.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                          <p className="text-sm text-blue-300 font-medium mb-2">Selected Time Slots:</p>
                          <div className="space-y-1">
                            {selectedSlots.map((slot, index) => (
                              <div key={index} className="flex justify-between items-center text-white text-sm bg-gray-800/50 p-2 rounded">
                                <span>{slot.startTime} - {slot.endTime}</span>
                                <button
                                  onClick={() => {
                                    setSelectedSlots(prev => prev.filter(s => !(s.startTime === slot.startTime && s.endTime === slot.endTime)));
                                  }}
                                  className="text-red-400 hover:text-red-300 text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available Days Summary */}
                  {!selectedDate && (
                    <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-xs text-gray-400 font-medium mb-2">Mentor's Weekly Schedule:</p>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-xs">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                          const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx];
                          const daySchedule = mentor?.availabilitySchedule?.find(d => d.day === dayName);
                          const hasSlots = daySchedule?.slots && daySchedule.slots.length > 0;
                          return (
                            <div 
                              key={day}
                              className={`text-center p-2 rounded border ${
                                hasSlots 
                                  ? 'bg-green-900/20 border-green-700/50 text-green-400' 
                                  : 'bg-gray-800/50 border-gray-700 text-gray-500'
                              }`}
                            >
                              <div className="font-medium">{day}</div>
                              {hasSlots && (
                                <div className="text-xs mt-1">
                                  {daySchedule.slots.length} slot{daySchedule.slots.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg">
                  <FaCalendarAlt className="text-4xl text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">No available dates currently</p>
                  <p className="text-gray-500 text-sm">Please contact the mentor directly</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - 5 columns */}
          <div className="lg:col-span-5 space-y-4">
            {/* Session Mode */}
            <div className="bg-[#0f172a]/50 backdrop-blur-md border border-gray-800 rounded-xl p-4">
              <h3 className="text-base font-semibold text-blue-400 mb-3">Session Mode</h3>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map(({ type, icon, label }) => {
                  const pricePer15Minutes = getPricePer15Minutes(type);
                  const isPricingAvailable = pricePer15Minutes !== null;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => isPricingAvailable && setSelectedMode(type)}
                      className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                        selectedMode === type
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : isPricingAvailable
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
                          : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!isPricingAvailable}
                    >
                      <div className="text-lg">{icon}</div>
                      <span className="text-xs font-medium">{label}</span>
                      <span className="text-xs">
                        {isPricingAvailable ? `₹${pricePer15Minutes}/15 min` : 'Not available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Duration Info */}
            <div className="bg-[#0f172a]/50 backdrop-blur-md border border-gray-800 rounded-xl p-4">
              <h3 className="text-base font-semibold text-blue-400 mb-3">Session Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaBusinessTime className="text-green-400" />
                    <span className="text-sm">Session Duration</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {selectedSlots.length > 0 ? `${getTotalDuration()} minutes (${selectedSlots.length} slot${selectedSlots.length !== 1 ? 's' : ''})` : 'No slots selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm">₹</span>
                    <span className="text-sm">Rate</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {getPricePer15Minutes(selectedMode) !== null 
                      ? `₹${getPricePer15Minutes(selectedMode)}/15 min session` 
                      : 'Not available'
                    }
                  </span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  selectedSlots.length > 0 && getPriceForDuration(getTotalDuration(), selectedMode) !== 'Pricing not available'
                    ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600/50'
                    : 'bg-gray-800/30 border border-gray-600'
                }`}>
                  <span className="text-sm font-medium">Total Session Cost</span>
                  <span className={`text-lg font-bold ${
                    selectedSlots.length > 0 && getPriceForDuration(getTotalDuration(), selectedMode) !== 'Pricing not available'
                      ? 'text-green-400'
                      : 'text-gray-500'
                  }`}>
                    {selectedSlots.length > 0 ? getPriceForDuration(getTotalDuration(), selectedMode) : 'No slots selected'}
                  </span>
                </div>
              </div>
              {!mentor?.pricing && (
                <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    ⚠️ Pricing information not available. Please contact the mentor for session rates.
                  </p>
                </div>
              )}
              {mentor?.pricing && (
                <div className="mt-3 p-2 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">
                    💡 Sessions are billed in 15-minute blocks. Select multiple slots to book longer sessions.
                    {selectedSlots.length > 0 && ` Total duration: ${getTotalDuration()} minutes requiring ${Math.ceil(getTotalDuration() / 15)} × 15-minute blocks.`}
                  </p>
                </div>
              )}
            </div>

            {/* Meeting Topic */}
            <div className="bg-[#0f172a]/50 backdrop-blur-md border border-gray-800 rounded-xl p-4">
              <h3 className="text-base font-semibold text-blue-400 mb-3">What would you like to discuss?</h3>
              <textarea
                value={meetingTopic}
                onChange={(e) => setMeetingTopic(e.target.value)}
                placeholder="I'd like to discuss..."
                className="w-full bg-gray-800/50 text-white border border-gray-700 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none resize-none text-sm"
                rows={3}
                maxLength={500}
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-500">{meetingTopic.length}/500</span>
              </div>
            </div>

            {/* Summary */}
            {(selectedDate || selectedSlots.length > 0) && (
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-600/50 rounded-xl p-4">
                <h3 className="text-base font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  <FaCheck className="text-green-400" />
                  Booking Summary
                </h3>
                <div className="space-y-2 text-sm">
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">{selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</span>
                    </div>
                  )}
                  
                  {selectedSlots.length > 0 && (
                    <div>
                      <div className="text-gray-400 mb-1">Time Slots:</div>
                      <div className="space-y-1">
                        {selectedSlots.map((slot, index) => (
                          <div key={index} className="text-white ml-2 text-xs">
                            • {slot.startTime} - {slot.endTime}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode:</span>
                    <span className="text-white capitalize">{selectedMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{ getTotalDuration() } min ({selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''})</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-300 font-medium">Total:</span>
                    <span className={`text-lg font-bold ${
                      getPriceForDuration(getTotalDuration(), selectedMode) !== 'Pricing not available'
                        ? 'text-green-400'
                        : 'text-gray-500'
                    }`}>
                      {getPriceForDuration(getTotalDuration(), selectedMode)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBookingSubmit}
              disabled={
                isBookingLoading || 
                !selectedDate || 
                selectedSlots.length === 0 || 
                !meetingTopic.trim() ||
                !mentor?.pricing ||
                getPricePer15Minutes(selectedMode) === null
              }
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                isBookingLoading || 
                !selectedDate || 
                selectedSlots.length === 0 || 
                !meetingTopic.trim() ||
                !mentor?.pricing ||
                getPricePer15Minutes(selectedMode) === null
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
              }`}
            >
              {!mentor?.pricing ? "Pricing Not Available" : isBookingLoading ? "Processing..." : "Book Sessions"}
            </button>

            {/* Helper Text */}
            {!selectedDate && uniqueAvailableDates.length > 0 && (
              <p className="text-center text-gray-500 text-xs">Select a date to continue</p>
            )}
            {selectedDate && selectedSlots.length === 0 && dateSlots.length > 0 && (
              <p className="text-center text-gray-500 text-xs">Choose one or more time slots</p>
            )}
            {selectedDate && selectedSlots.length > 0 && !meetingTopic.trim() && (
              <p className="text-center text-gray-500 text-xs">Describe your meeting topic</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
