import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      name,
      email,
      createdAt: new Date()
    });
    return result;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const saveItinerary = async (itinerary) => {
    if (!currentUser) return;
    
    try {
      console.log('Starting to save itinerary for user:', currentUser.uid);
      console.log('Itinerary data to save:', itinerary);
      
      const itineraryId = `${currentUser.uid}_${Date.now()}`;
      const itineraryData = {
        ...itinerary,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        id: itineraryId,
        title: itinerary.title || 'Untitled Trip',
        summary: itinerary.summary || 'No description available',
        totalCost: Number(itinerary.totalCost) || 0,
        days: itinerary.days || [],
        restaurants: itinerary.restaurants || [],
        accommodations: itinerary.accommodations || [],
        tips: itinerary.tips || [],
        formData: itinerary.formData || {}
      };
      
      console.log('Final itinerary data structure:', itineraryData);
      
      const itineraryRef = doc(db, 'itineraries', itineraryId);
      await setDoc(itineraryRef, itineraryData);
      
      console.log('Itinerary saved successfully with ID:', itineraryId);
      return true;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    saveItinerary
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};