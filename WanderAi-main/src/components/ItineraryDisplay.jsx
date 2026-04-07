import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  MapPin, Clock, DollarSign, Star, Heart, Share2, Download, 
  Coffee, Sun, Moon, ChevronDown, ChevronUp, Utensils, Bed, Lightbulb
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ItineraryDisplay = () => {
  const location = useLocation();
  const { itinerary, formData } = location.state || {};
  const { saveItinerary, currentUser } = useAuth();
  const [expandedDay, setExpandedDay] = useState(null);
  const [saved, setSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">No itinerary found. Please go back and create one.</p>
      </div>
    );
  }

  const handleSave = async () => {
    console.log('Save button clicked');
    console.log('Current user:', currentUser);
    console.log('Itinerary to save:', itinerary);
    console.log('Form data:', formData);
    
    if (!currentUser) {
      console.log('No current user, showing alert');
      alert('Please sign in to save your trip!');
      return;
    }
    
    try {
      console.log('Attempting to save itinerary...');
      const result = await saveItinerary({ ...itinerary, formData });
      console.log('Save result:', result);
      setSaved(true);
      alert('Trip saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip. Please try again.');
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share && window.location.protocol === 'https:') {
        await navigator.share({
          title: itinerary.title,
          text: itinerary.summary,
          url: window.location.href,
        });
        setIsSharing(false);
        return;
      }
    } catch (error) {
      console.log('Native share failed, falling back to clipboard:', error);
    }
    
    // Fallback: copy to clipboard
    try {
      const shareText = `Check out my travel itinerary: ${itinerary.title}\n\n${itinerary.summary}\n\n${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      alert('Itinerary link copied to clipboard!');
    } catch (clipboardError) {
      console.error('Clipboard access failed:', clipboardError);
      // Final fallback: show the text to copy manually
      const shareText = `Check out my travel itinerary: ${itinerary.title}\n\n${itinerary.summary}\n\n${window.location.href}`;
      prompt('Copy this text to share your itinerary:', shareText);
    }
    setIsSharing(false);
  };

  const handleShare_old = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: itinerary.title,
          text: itinerary.summary,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        const shareText = `Check out my travel itinerary: ${itinerary.title}\n\n${itinerary.summary}\n\n${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        alert('Itinerary link copied to clipboard!');
      }
    } catch (error) {
      console.log('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        const shareText = `Check out my travel itinerary: ${itinerary.title}\n\n${itinerary.summary}\n\n${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        alert('Itinerary link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard access failed:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
    setIsSharing(false);
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    
    // Create a comprehensive text version for download
    let pdfContent = `${itinerary.title}\n`;
    pdfContent += `${'='.repeat(itinerary.title.length)}\n\n`;
    pdfContent += `${itinerary.summary}\n\n`;
    pdfContent += `Total Budget: $${itinerary.totalCost}\n`;
    pdfContent += `Duration: ${itinerary.days.length} days\n`;
    pdfContent += `Destination: ${formData.destination}\n\n`;
    
    // Add daily itinerary
    pdfContent += `DAILY ITINERARY\n`;
    pdfContent += `${'-'.repeat(16)}\n\n`;
    
    itinerary.days.forEach(day => {
      pdfContent += `Day ${day.day} - ${day.date}\n`;
      pdfContent += `${'-'.repeat(20)}\n`;
      pdfContent += `Morning (${day.morning.time}): ${day.morning.activity}\n`;
      pdfContent += `Location: ${day.morning.location}\n`;
      pdfContent += `Cost: $${day.morning.cost}\n`;
      pdfContent += `${day.morning.description}\n\n`;
      
      pdfContent += `Afternoon (${day.afternoon.time}): ${day.afternoon.activity}\n`;
      pdfContent += `Location: ${day.afternoon.location}\n`;
      pdfContent += `Cost: $${day.afternoon.cost}\n`;
      pdfContent += `${day.afternoon.description}\n\n`;
      
      pdfContent += `Evening (${day.evening.time}): ${day.evening.activity}\n`;
      pdfContent += `Location: ${day.evening.location}\n`;
      pdfContent += `Cost: $${day.evening.cost}\n`;
      pdfContent += `${day.evening.description}\n\n`;
      
      pdfContent += `Daily Tips:\n`;
      day.tips.forEach(tip => {
        pdfContent += `• ${tip}\n`;
      });
      pdfContent += `\n`;
    });
    
    // Add restaurants
    pdfContent += `RECOMMENDED RESTAURANTS\n`;
    pdfContent += `${'-'.repeat(24)}\n`;
    itinerary.restaurants.forEach(restaurant => {
      pdfContent += `${restaurant.name} (${restaurant.rating}★)\n`;
      pdfContent += `Type: ${restaurant.type} | Price: ${restaurant.priceRange}\n`;
      pdfContent += `Specialty: ${restaurant.speciality}\n\n`;
    });
    
    // Add accommodations
    pdfContent += `RECOMMENDED ACCOMMODATIONS\n`;
    pdfContent += `${'-'.repeat(28)}\n`;
    itinerary.accommodations.forEach(hotel => {
      pdfContent += `${hotel.name} (${hotel.rating}★)\n`;
      pdfContent += `Type: ${hotel.type} | Price: $${hotel.pricePerNight}/night\n`;
      pdfContent += `Amenities: ${hotel.amenities.join(', ')}\n\n`;
    });
    
    // Add general tips
    pdfContent += `TRAVEL TIPS\n`;
    pdfContent += `${'-'.repeat(11)}\n`;
    itinerary.tips.forEach(tip => {
      pdfContent += `• ${tip}\n`;
    });
    
    // Create and download the file
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${itinerary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setIsDownloading(false);
  };
  const timeIcons = {
    morning: Sun,
    afternoon: Sun,
    evening: Moon
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-6">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {itinerary.title}
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {itinerary.summary}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">${itinerary.totalCost}</p>
              <p className="text-gray-600">Total Budget</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{itinerary.days.length} Days</p>
              <p className="text-gray-600">Duration</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{formData.destination}</p>
              <p className="text-gray-600">Destination</p>
            </motion.div>
          </div>

          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={handleSave}
              disabled={!currentUser || saved}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                saved 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved!' : 'Save Trip'}</span>
            </button>
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-all duration-200 disabled:opacity-50"
            >
              <Share2 className="h-5 w-5" />
              <span>{isSharing ? 'Sharing...' : 'Share'}</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Day by Day Itinerary */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {itinerary.days.map((day, index) => (
            <motion.div
              key={day.day}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div 
                className="bg-gradient-to-r from-blue-500 to-orange-500 p-6 cursor-pointer"
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Day {day.day}</h3>
                    <p className="text-blue-100">{day.date}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedDay === day.day ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
              </div>

              {expandedDay === day.day && (
                <motion.div
                  className="p-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    {/* Morning */}
                    <div className="flex space-x-4">
                      <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sun className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">Morning</h4>
                        <p className="text-gray-600 text-sm mb-2">{day.morning.time}</p>
                        <h5 className="text-lg font-medium text-gray-800 mb-2">{day.morning.activity}</h5>
                        <p className="text-gray-600 mb-2">{day.morning.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{day.morning.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${day.morning.cost}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Afternoon */}
                    <div className="flex space-x-4">
                      <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sun className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">Afternoon</h4>
                        <p className="text-gray-600 text-sm mb-2">{day.afternoon.time}</p>
                        <h5 className="text-lg font-medium text-gray-800 mb-2">{day.afternoon.activity}</h5>
                        <p className="text-gray-600 mb-2">{day.afternoon.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{day.afternoon.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${day.afternoon.cost}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Evening */}
                    <div className="flex space-x-4">
                      <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                        <Moon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">Evening</h4>
                        <p className="text-gray-600 text-sm mb-2">{day.evening.time}</p>
                        <h5 className="text-lg font-medium text-gray-800 mb-2">{day.evening.activity}</h5>
                        <p className="text-gray-600 mb-2">{day.evening.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{day.evening.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${day.evening.cost}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        <h6 className="font-semibold text-blue-800">Daily Tips</h6>
                      </div>
                      <ul className="space-y-1">
                        {day.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-blue-700 text-sm">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Recommendations */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Restaurants */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Utensils className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Recommended Restaurants</h3>
            </div>
            <div className="space-y-4">
              {itinerary.restaurants.map((restaurant, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">{restaurant.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{restaurant.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{restaurant.type} • {restaurant.priceRange}</p>
                  <p className="text-gray-700 text-sm">Specialty: {restaurant.speciality}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Accommodations */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Bed className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Recommended Stay</h3>
            </div>
            <div className="space-y-4">
              {itinerary.accommodations.map((hotel, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">{hotel.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{hotel.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{hotel.type} • ${hotel.pricePerNight}/night</p>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity, amenityIndex) => (
                      <span 
                        key={amenityIndex}
                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* General Tips */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mt-8 border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Travel Tips & Cultural Notes</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {itinerary.tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ItineraryDisplay;