import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Users, Compass, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { generateItinerary } from '../services/geminiService';

const PlannerForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    budget: '',
    tripType: '',
    season: '',
    groupSize: '2',
    interests: [],
    pace: 'moderate',
    accommodation: 'mid-range',
    transportation: 'mixed'
  });

  const tripTypes = ['beach', 'adventure', 'culture', 'city', 'nature', 'luxury', 'backpacking'];
  const interests = ['food', 'history', 'art', 'nightlife', 'shopping', 'photography', 'sports', 'museums', 'festivals'];
  const seasons = ['spring', 'summer', 'fall', 'winter'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInterestChange = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(interest)
        ? formData.interests.filter(i => i !== interest)
        : [...formData.interests, interest]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const itinerary = await generateItinerary(formData);
      navigate('/itinerary', { state: { itinerary, formData } });
    } catch (error) {
      console.error('Error generating itinerary:', error);
      // You could show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-orange-600 p-8">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Plan Your Perfect Trip</h2>
              <p className="text-blue-100">Tell us about your dream destination and we'll create a personalized itinerary</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span>Destination</span>
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g., Paris, Tokyo, Bali"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>Trip Duration (days)</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="7"
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <span>Budget (USD)</span>
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="1500"
                  min="100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Group Size</span>
                </label>
                <select
                  name="groupSize"
                  value={formData.groupSize}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="1">Solo traveler</option>
                  <option value="2">Couple</option>
                  <option value="3-4">Small group (3-4)</option>
                  <option value="5+">Large group (5+)</option>
                </select>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-4">
                <Compass className="h-5 w-5 text-blue-500" />
                <span>Trip Type</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tripTypes.map((type) => (
                  <motion.button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, tripType: type })}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.tripType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="text-gray-700 font-medium mb-4 block">Season</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {seasons.map((seasonOption) => (
                  <motion.button
                    key={seasonOption}
                    type="button"
                    onClick={() => setFormData({ ...formData, season: seasonOption })}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.season === seasonOption
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {seasonOption.charAt(0).toUpperCase() + seasonOption.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="text-gray-700 font-medium mb-4 block">Interests (Select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interests.map((interest) => (
                  <motion.button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestChange(interest)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.interests.includes(interest)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label className="text-gray-700 font-medium mb-3 block">Travel Pace</label>
                <select
                  name="pace"
                  value={formData.pace}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="relaxed">Relaxed</option>
                  <option value="moderate">Moderate</option>
                  <option value="packed">Action-packed</option>
                </select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <label className="text-gray-700 font-medium mb-3 block">Accommodation</label>
                <select
                  name="accommodation"
                  value={formData.accommodation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="budget">Budget-friendly</option>
                  <option value="mid-range">Mid-range</option>
                  <option value="luxury">Luxury</option>
                </select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <label className="text-gray-700 font-medium mb-3 block">Transportation</label>
                <select
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="public">Public transport</option>
                  <option value="mixed">Mixed transport</option>
                  <option value="private">Private transport</option>
                </select>
              </motion.div>
            </div>

            <motion.div
              className="text-center pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-12 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                disabled={!formData.destination || !formData.duration || !formData.budget || !formData.tripType || !formData.season}
              >
                ✨ Create My Perfect Itinerary
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default PlannerForm;