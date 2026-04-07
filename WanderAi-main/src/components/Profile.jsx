import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  User, MapPin, Calendar, DollarSign, Heart, Trash2, Eye, Plus, 
  Mail, Clock, TrendingUp, Award, Globe, Camera, Settings, Edit3,
  Plane, Star, Coffee, Mountain, Waves, Building, Palette, Music
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    totalTrips: 0,
    totalSpent: 0,
    countriesVisited: 0,
    favoriteType: 'adventure'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        console.log('No current user in Profile');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching data for user:', currentUser.uid);
        
        // Simple query without orderBy to avoid index issues
        const q = query(
          collection(db, 'itineraries'),
          where('userId', '==', currentUser.uid)
        );
        
        console.log('Executing Firestore query...');
        const querySnapshot = await getDocs(q);
        console.log('Query snapshot size:', querySnapshot.size);
        
        const itineraries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort manually by createdAt
        itineraries.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        console.log('Fetched itineraries:', itineraries);
        setSavedItineraries(itineraries);
        
        // Calculate user stats
        const stats = {
          totalTrips: itineraries.length,
          totalSpent: itineraries.reduce((sum, trip) => sum + (Number(trip.totalCost) || 0), 0),
          countriesVisited: new Set(itineraries.map(trip => trip.formData?.destination).filter(Boolean)).size,
          favoriteType: getMostFrequentTripType(itineraries)
        };
        console.log('Calculated stats:', stats);
        setUserStats(stats);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        console.error('Error details:', error.message);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser]);

  const getMostFrequentTripType = (trips) => {
    if (!trips || trips.length === 0) return 'adventure';
    const types = trips.map(trip => trip.formData?.tripType).filter(Boolean);
    if (types.length === 0) return 'adventure';
    const frequency = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b, 'adventure');
  };

  const handleView = (itinerary) => {
    console.log('Viewing itinerary:', itinerary);
    navigate('/itinerary', { 
      state: { 
        itinerary: itinerary, 
        formData: itinerary.formData || { destination: 'Unknown' }
      } 
    });
  };

  const handleDelete = async (itineraryId) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }
    
    setDeletingId(itineraryId);
    try {
      await deleteDoc(doc(db, 'itineraries', itineraryId));
      setSavedItineraries(prev => prev.filter(item => item.id !== itineraryId));
      
      // Recalculate stats after deletion
      const updatedItineraries = savedItineraries.filter(item => item.id !== itineraryId);
      const newStats = {
        totalTrips: updatedItineraries.length,
        totalSpent: updatedItineraries.reduce((sum, trip) => sum + (Number(trip.totalCost) || 0), 0),
        countriesVisited: new Set(updatedItineraries.map(trip => trip.formData?.destination).filter(Boolean)).size,
        favoriteType: getMostFrequentTripType(updatedItineraries)
      };
      setUserStats(newStats);
      
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      alert('Failed to delete itinerary. Please try again.');
    }
    setDeletingId(null);
  };

  const getTripTypeIcon = (type) => {
    const icons = {
      beach: Waves,
      adventure: Mountain,
      culture: Palette,
      city: Building,
      nature: Mountain,
      luxury: Star,
      backpacking: Coffee,
      music: Music
    };
    return icons[type] || Plane;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div 
          className="text-center bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <User className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to sign in to view your profile.</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 p-8">
            <div className="flex items-center space-x-6">
              <motion.div
                className="bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <User className="h-12 w-12 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.h1 
                  className="text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome back, Traveler!
                </motion.h1>
                <motion.div 
                  className="flex items-center space-x-2 text-blue-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-lg">{currentUser.email}</span>
                </motion.div>
                <motion.p 
                  className="text-blue-100 mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Member since {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                </motion.p>
              </div>
              <motion.button
                className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Settings feature coming soon!')}
              >
                <Settings className="h-6 w-6 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="p-8">
            <div className="grid md:grid-cols-4 gap-6">
              <motion.div
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-800">{userStats.totalTrips}</p>
                    <p className="text-blue-600 text-sm">Total Trips</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-800">${userStats.totalSpent}</p>
                    <p className="text-green-600 text-sm">Total Spent</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-800">{userStats.countriesVisited}</p>
                    <p className="text-orange-600 text-sm">Destinations</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-800 capitalize">{userStats.favoriteType}</p>
                    <p className="text-purple-600 text-sm">Favorite Type</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-8 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'trips', label: 'My Trips', icon: MapPin },
              { id: 'achievements', label: 'Achievements', icon: Award }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  <span>Travel Activity</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                    <span className="text-gray-700">This Month</span>
                    <span className="font-bold text-blue-600">{savedItineraries.filter(trip => {
                      const tripDate = trip.createdAt?.toDate ? trip.createdAt.toDate() : new Date(trip.createdAt);
                      const thisMonth = new Date();
                      return tripDate.getMonth() === thisMonth.getMonth() && tripDate.getFullYear() === thisMonth.getFullYear();
                    }).length} trips</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <span className="text-gray-700">Average Budget</span>
                    <span className="font-bold text-green-600">${userStats.totalTrips > 0 ? Math.round(userStats.totalSpent / userStats.totalTrips) : 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                    <span className="text-gray-700">Next Adventure</span>
                    <span className="font-bold text-orange-600">Plan Now!</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                  <Camera className="h-6 w-6 text-purple-500" />
                  <span>Recent Activity</span>
                </h3>
                <div className="space-y-4">
                  {savedItineraries.slice(0, 3).map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-orange-500 w-10 h-10 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{trip.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(trip.createdAt || 0).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {savedItineraries.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No trips yet. Start planning your first adventure!</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'trips' && (
            <motion.div
              key="trips"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {savedItineraries.length === 0 ? (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">No Saved Trips Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start planning your next adventure and save your favorite itineraries here!
                    </p>
                    <motion.a
                      href="/"
                      className="inline-block bg-gradient-to-r from-blue-500 to-orange-500 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-orange-600 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Plan Your First Trip
                    </motion.a>
                  </div>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {savedItineraries.map((itinerary, index) => {
                    const TripIcon = getTripTypeIcon(itinerary.formData?.tripType);
                    return (
                      <motion.div
                        key={itinerary.id}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                          <div className="relative">
                            <div className="flex items-center space-x-3 mb-2">
                              <TripIcon className="h-6 w-6 text-white" />
                              <h3 className="text-xl font-bold text-white line-clamp-1">
                                {itinerary.title}
                              </h3>
                            </div>
                            <p className="text-blue-100 text-sm">
                              Created {itinerary.createdAt?.toDate ? 
                                new Date(itinerary.createdAt.toDate()).toLocaleDateString() :
                                new Date(itinerary.createdAt).toLocaleDateString()
                              }
                            </p>
                          </div>
                        </div>

                        <div className="p-6">
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {itinerary.summary}
                          </p>

                          <div className="space-y-3 mb-6">
                            <motion.div 
                              className="flex items-center space-x-3 text-sm text-gray-600"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span>{itinerary.formData?.destination || 'Unknown destination'}</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-center space-x-3 text-sm text-gray-600"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Calendar className="h-4 w-4 text-green-500" />
                              <span>{itinerary.days?.length || 0} days</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-center space-x-3 text-sm text-gray-600"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <DollarSign className="h-4 w-4 text-orange-500" />
                              <span>${itinerary.totalCost || 0}</span>
                            </motion.div>
                          </div>

                          <div className="flex space-x-3">
                            <motion.button 
                              onClick={() => handleView(itinerary)}
                              className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-2 group"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                              <span>View</span>
                            </motion.button>
                            <motion.button 
                              onClick={() => handleDelete(itinerary.id)}
                              disabled={deletingId === itinerary.id}
                              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors duration-200 disabled:opacity-50 group"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className={`h-4 w-4 group-hover:scale-110 transition-transform duration-200 ${deletingId === itinerary.id ? 'animate-spin' : ''}`} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Add New Trip Card */}
                  <motion.div
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 flex items-center justify-center min-h-[400px] group"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: savedItineraries.length * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <motion.a
                      href="/"
                      className="flex flex-col items-center justify-center p-8 text-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Plus className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Plan New Trip</h3>
                      <p className="text-gray-600">Create another amazing itinerary</p>
                    </motion.a>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { 
                  title: 'First Trip', 
                  description: 'Planned your first adventure', 
                  icon: Plane, 
                  unlocked: userStats.totalTrips >= 1,
                  color: 'blue'
                },
                { 
                  title: 'Explorer', 
                  description: 'Visited 3 different destinations', 
                  icon: Globe, 
                  unlocked: userStats.countriesVisited >= 3,
                  color: 'green'
                },
                { 
                  title: 'Big Spender', 
                  description: 'Spent over $5000 on trips', 
                  icon: DollarSign, 
                  unlocked: userStats.totalSpent >= 5000,
                  color: 'yellow'
                },
                { 
                  title: 'Frequent Traveler', 
                  description: 'Planned 5 or more trips', 
                  icon: Star, 
                  unlocked: userStats.totalTrips >= 5,
                  color: 'purple'
                },
                { 
                  title: 'Adventure Seeker', 
                  description: 'Planned an adventure trip', 
                  icon: Mountain, 
                  unlocked: savedItineraries.some(trip => trip.formData?.tripType === 'adventure'),
                  color: 'orange'
                },
                { 
                  title: 'Beach Lover', 
                  description: 'Planned a beach vacation', 
                  icon: Waves, 
                  unlocked: savedItineraries.some(trip => trip.formData?.tripType === 'beach'),
                  color: 'cyan'
                }
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'hover:shadow-2xl' 
                      : 'opacity-60 grayscale'
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={achievement.unlocked ? { scale: 1.05, y: -5 } : {}}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      achievement.unlocked 
                        ? `bg-${achievement.color}-100` 
                        : 'bg-gray-100'
                    }`}>
                      <achievement.icon className={`h-8 w-8 ${
                        achievement.unlocked
                          ? `text-${achievement.color}-600` 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{achievement.title}</h3>
                    <p className="text-gray-600 text-sm">{achievement.description}</p>
                    {achievement.unlocked && (
                      <motion.div
                        className="mt-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          ✓ Unlocked
                        </span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;