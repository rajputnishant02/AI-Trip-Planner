import React from 'react';
import { motion } from 'framer-motion';
import { Plane, MapPin, Calendar, Sparkles } from 'lucide-react';

const LoadingSpinner = () => {
  const loadingSteps = [
    "🧠 Analyzing your travel preferences...",
    "🌍 Researching your destination...",
    "🗺️ Mapping out the perfect route...",
    "🎯 Selecting personalized activities...",
    "💰 Optimizing your budget allocation...",
    "🍽️ Finding amazing local restaurants...",
    "🏨 Selecting ideal accommodations...",
    "✨ Finalizing your perfect itinerary..."
  ];

  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % loadingSteps.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
      <motion.div
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-lg mx-4 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Plane className="h-4 w-4 text-white" />
          </motion.div>
        </motion.div>

        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-6">
          AI is Crafting Your Perfect Trip
        </h2>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <p className="text-lg text-gray-600 font-medium">
            {loadingSteps[currentStep]}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by Google Gemini AI
          </p>
        </motion.div>

        <div className="space-y-4">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-orange-500 h-full rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 8, ease: "easeInOut" }}
            />
          </div>

          <div className="flex justify-center space-x-6 text-gray-400">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
            >
              <MapPin className="h-6 w-6" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            >
              <Calendar className="h-6 w-6" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;