"use client";

import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FaUser } from "react-icons/fa";
import { FiRefreshCw, FiLoader } from "react-icons/fi"; // Added loader icon
import { motion, AnimatePresence } from "framer-motion";
const{getActiveMentors} = require('@/lib/api/mentorApi'); // --- 1. IMPORT API SERVICE ---

// --- UPDATED categories array to include "All" ---
const categories = ["All", "IncomeTax", "GST", "Accounting", "Audit", "Investment", "Exam Oriented" ];

// --- REMOVED hardcoded 'mentors' array ---

const MentorCard = ({ mentor }) => {
  const router = useRouter();

  const handleViewProfile = (e) => {
    e.stopPropagation(); // Prevent card click from firing
    // TODO: Update this to use the mentor's ID or slug
    router.push(`/mentor/${mentor.id}`); 
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={handleViewProfile}
      className="cursor-pointer relative w-full bg-[#0D1117] border border-blue-600 rounded-3xl p-6 shadow-xl hover:scale-[1.02] hover:shadow-blue-500/30 transition-all flex flex-col justify-between mx-auto sm:max-w-[300px]"
    >
      <div className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
        {mentor.image ? (
          <Image src={mentor.image} alt={mentor.name} fill className="object-cover" sizes="112px" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <FaUser className="text-white text-3xl" />
          </div>
        )}
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
        <p className="text-base text-gray-400">{mentor.title}</p>
      </div>

      <div className="mt-4 text-sm text-center flex flex-wrap justify-center gap-2">
        {mentor.specialization.split(",").map((tag, i) => (
          <span
            key={i}
            className="bg-blue-800/30 text-blue-300 px-3 py-1 rounded-full border border-blue-500 shadow font-medium"
          >
            {tag.trim()}
          </span>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button 
          className="border border-blue-500 text-blue-400 hover:bg-blue-800 hover:text-white px-6 py-2 rounded-full text-base font-medium transition" 
          onClick={handleViewProfile}
        > 
          View 
        </button> 
      </div>
    </motion.div>
  );
};

export default function MentorListPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  

  // --- 2. ADDED API States ---
  const [allMentors, setAllMentors] = useState([]); // Master list from API
  const [filtered, setFiltered] = useState([]); // List to display
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 3. ADDED useEffect for Data Fetching ---
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Call your API service
        const result = await getActiveMentors(); 

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch mentors');
        }

        // Transform the API data to match what the MentorCard component expects
        const transformedMentors = result.data.map(mentor => ({
          id: mentor._id, // Use the mentor profile ID
          name: mentor.userRef.name,
          image: mentor.userRef.avatar,
          // Create a title from qualifications or a default
          title: mentor.registrationRef.qualification[0] || 'Chartered Accountant',
          // Join the expertise array into a comma-separated string
          specialization: mentor.registrationRef.expertise.join(', '), 
        }));

        setAllMentors(transformedMentors);
        setFiltered(transformedMentors); // Set initial filtered list
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, []); // Empty array means run once on mount

  // --- 4. UPDATED useEffect for Filtering ---
  useEffect(() => {
    const text = searchText.trim().toLowerCase();
    
    // Use the master 'allMentors' list as the source
    let filteredList = allMentors.filter(({ name, specialization }) => {
      const matchText = name.toLowerCase().includes(text) || specialization.toLowerCase().includes(text);
      const matchCategory = selectedCategories.includes("All") || selectedCategories.some((cat) => specialization.toLowerCase().includes(cat.toLowerCase()));
      return matchText && matchCategory;
    });

    setFiltered(filteredList);
  }, [searchText, selectedCategories, allMentors]); // Re-run when master list changes

  const resetFilters = () => {
    setSearchText("");
    setSelectedCategories(["All"]);
  };

  return (
    // ✅ --- FIX: Removed 'font-['Outfit']' from this line ---
    <div className="bg-black min-h-screen text-white text-[17px] sm:text-[18px]">
      <Header />

      <section className="px-5 sm:px-10 md:px-20 py-12 min-h-screen">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10">
          <span className="text-blue-500">Meet</span> <i>Our Consultants</i>
        </h1>

        {/* Search & Filter (Unchanged) */}
        <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex w-full gap-2">
            <input
              type="text"
              placeholder="Search by name or expertise..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-5 py-3 rounded-full bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-base"
            />
            {(searchText || !selectedCategories.includes("All")) && (
              <button
                onClick={resetFilters}
                className="p-3 bg-gray-800 border border-gray-600 rounded-full text-blue-400 hover:text-white hover:bg-blue-700 transition-all"
                title="Reset Filters"
              >
                <FiRefreshCw size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters (Unchanged) */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (cat === "All") {
                  setSelectedCategories(["All"]);
                } else {
                  setSelectedCategories((prev) => {
                    const updated = prev.includes(cat)
                      ? prev.filter((c) => c !== cat)
                      : [...prev.filter((c) => c !== "All"), cat];
                    return updated.length === 0 ? ["All"] : updated;
                  });
                }
              }}
              className={`px-4 py-2 rounded-full border text-base font-medium transition-all duration-300 shadow-md ${
                selectedCategories.includes(cat)
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-blue-900 text-blue-300 border-blue-700 hover:bg-blue-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- 5. UPDATED Mentor Cards Section with Loading/Error --- */}
        {isLoading && (
          <div className="flex justify-center items-center gap-3 text-lg text-gray-400 mt-20">
            <FiLoader className="animate-spin" size={24} />
            Loading mentors...
          </div>
        )}

        {error && (
          <div className="text-center p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg max-w-lg mx-auto mt-10">
            <strong>Error:</strong> {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {!isLoading && !error && filtered.map((mentor) => (
              // Use mentor.id for the key
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </AnimatePresence>

        {/* Empty state */}
        {!isLoading && !error && filtered.length === 0 && (
          <p className="text-center text-gray-400 text-lg mt-20">
            No mentors found matching your criteria.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
}