"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import {
  FaTwitter, FaLinkedin, FaGlobe,
  FaRegClock, FaCalendarAlt, FaChartLine,
  FaCertificate, FaUniversity
} from "react-icons/fa";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMentorById } from '@/lib/api/mentorApi';

// --- Reusable Components ---

const SocialLinks = ({ socials }) => (
  <div className="flex flex-wrap gap-5 mt-4 justify-center lg:justify-start text-3xl text-blue-400">
    {socials.twitter && (
      <a href={socials.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
    )}
    {socials.linkedin && (
      <a href={socials.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
    )}
    {socials.website && (
      <a href={socials.website} target="_blank" rel="noopener noreferrer"><FaGlobe /></a>
    )}
  </div>
);

const StatCard = ({ icon: Icon, label, value, bg, border, text }) => (
  <div className={`flex items-center ${bg} p-5 rounded-xl gap-4 border ${border} w-full`}>
    <Icon className="text-white text-4xl shrink-0" />
    <div className="overflow-hidden">
      <p className="text-lg sm:text-xl text-gray-300 truncate">{label}</p>
      <p className={`font-bold text-xl sm:text-2xl ${text}`}>{value}</p>
    </div>
  </div>
);

// --- Main Page Component ---
export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params?.id;

  const [mentor, setMentor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // --- API Data Fetching ---
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
          image: mentorData.userRef.avatar,
          email: mentorData.userRef.email,
          designation: mentorData.registrationRef?.status || 'Professional Mentor',
          pricing: mentorData.pricing || [
            { type: "chat", price: 10, duration: 1 },
            { type: "voice", price: 20, duration: 1 },
            { type: "video", price: 30, duration: 1 }
          ],
          minSessionDuration: mentorData.minSessionDuration || 15,
          isActive: mentorData.isActive || false,
          isBanned: mentorData.isBanned || false,
          isAvailableNow: mentorData.isAvailableNow || false,
          availabilitySchedule: mentorData.availability || [],
          languages: mentorData.registrationRef?.languages || [],
          expertise: mentorData.registrationRef?.expertise || [],
          experience: mentorData.registrationRef?.experienceInfo || "Experienced professional",
          qualifications: mentorData.registrationRef?.qualification || [],
          achievements: mentorData.registrationRef?.achievements || [],
          publications: mentorData.registrationRef?.publications || [],
          yearsExperience: mentorData.registrationRef?.yearsOfExperience || 0,
          kycVerified: mentorData.registrationRef?.kycProofNumber ? true : false,
          socials: mentorData.socials || {},
          stats: {
            sessionsCompleted: mentorData.sessionsCompleted || 0,
            totalMinutes: mentorData.totalMinutes || 0,
          },
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

  const handleGoBack = () => {
    router.push('/mentors');
  };

  const handleNavigateToBooking = () => {
    router.push(`/mentor/${mentorId}/booking`);
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Header />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading mentor details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // --- Error State ---
  if (error || !mentor) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Header />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-2xl max-w-md">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-red-400 text-xl font-bold mb-3">Unable to Load Mentor</h2>
            <p className="text-red-300 mb-4">{error || 'Mentor not found'}</p>
            <button
              onClick={handleGoBack}
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

  // --- Main Content ---
  return (
    <div className="bg-black text-white min-h-screen text-[18px] sm:text-[20px] font-sans">
      <Header />
      <section className="px-6 sm:px-8 md:px-14 lg:px-24 py-14 space-y-14 max-w-screen-xl mx-auto">
        
        {/* Top Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2 flex flex-col items-center text-center lg:text-left">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-blue-500">
              {mentor.image ? (
                <Image src={mentor.image} alt={mentor.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <div className="text-white text-4xl sm:text-5xl font-bold">
                    {mentor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                </div>
              )}
            </div>
            
            <SocialLinks socials={mentor.socials} />
          </div>

          <div className="lg:col-span-3 space-y-5 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold">{mentor.name}</h1>
            <p className="text-2xl sm:text-3xl text-blue-400">{mentor.designation}</p>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-lg sm:text-xl">
              {mentor.yearsExperience > 0 && (
                <div className="flex items-center gap-2">
                  <FaRegClock className="text-green-400" />
                  <span className="text-gray-300">{mentor.yearsExperience} years experience</span>
                </div>
              )}
            </div>

            {mentor.expertise.length > 0 && (
              <div className="bg-gray-800 p-5 mt-5 rounded-xl">
                <h3 className="text-blue-300 font-semibold mb-2 text-xl">Specializations</h3>
                <ul className="list-disc list-inside text-gray-200 space-y-2 text-lg sm:text-xl">
                  {mentor.expertise.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-center lg:justify-start">
              <button
                className="border border-blue-600 text-blue-400 px-8 py-4 rounded-full hover:bg-blue-800/20 text-lg sm:text-xl font-medium"
                onClick={handleNavigateToBooking}
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8" data-aos="fade-right">
            {/* About Section */}
            <div className="bg-[#0f172a] p-8 rounded-2xl border border-gray-700 shadow-lg">
              <h2 className="text-3xl sm:text-4xl font-semibold text-blue-400 mb-3">About</h2>
              <div className="text-gray-300 leading-relaxed text-lg sm:text-xl whitespace-pre-line">
                {mentor.experience}
              </div>
            </div>

            {/* Languages Section */}
            {mentor.languages.length > 0 && (
              <div className="bg-[#0f172a] p-8 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-3xl sm:text-4xl font-semibold text-blue-400 mb-3">Languages</h2>
                <div className="flex flex-wrap gap-3">
                  {mentor.languages.map((lang, idx) => (
                    <span key={idx} className="px-4 py-2 bg-blue-900/30 border border-blue-600/50 rounded-full text-lg sm:text-xl text-blue-300">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Section */}
            {mentor.achievements.length > 0 && mentor.achievements[0] !== "" && (
              <div className="bg-[#0f172a] p-8 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-3xl sm:text-4xl font-semibold text-blue-400 mb-3">Achievements</h2>
                <ul className="space-y-3">
                  {mentor.achievements.map((achievement, idx) => (
                    achievement && achievement.trim() && (
                      <li key={idx} className="flex items-start gap-3 text-lg sm:text-xl text-gray-300">
                        <FaCertificate className="text-yellow-400 mt-1 flex-shrink-0" />
                        <span>{achievement}</span>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}

            {/* Publications Section */}
            {mentor.publications.length > 0 && mentor.publications[0] !== "" && (
              <div className="bg-[#0f172a] p-8 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-3xl sm:text-4xl font-semibold text-blue-400 mb-3">Publications</h2>
                <ul className="space-y-3">
                  {mentor.publications.map((publication, idx) => (
                    publication && publication.trim() && (
                      <li key={idx} className="flex items-start gap-3 text-lg sm:text-xl text-gray-300">
                        <FaUniversity className="text-purple-400 mt-1 flex-shrink-0" />
                        <span>{publication}</span>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}
            
            {/* Reviews Section REMOVED here */}
          </div>

          {/* Right Column: Stats */}
          <div className="space-y-8" data-aos="fade-left">
            <div className="bg-[#0e1a2b] border border-blue-800 rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-3 text-blue-400 text-2xl sm:text-3xl font-semibold mb-5">
                <FaChartLine className="text-blue-500" />
                <h3>Community Stats</h3>
              </div>
              <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-1">
                <StatCard
                  icon={FaRegClock}
                  label="Minutes Mentored"
                  value={mentor.stats.totalMinutes}
                  bg="bg-blue-900"
                  border="border-blue-500"
                  text="text-blue-100"
                />
                <StatCard
                  icon={FaCalendarAlt}
                  label="Sessions Completed"
                  value={mentor.stats.sessionsCompleted}
                  bg="bg-green-900"
                  border="border-green-500"
                  text="text-green-100"
                />
              </div>
            </div>
          </div>
        </div>

      </section>
      <Footer />
    </div>
  );
}