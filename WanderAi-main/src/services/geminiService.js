import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAEcrDbC8p1TFy9RFZnW0s0ekt-JZOhOMw';
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateItinerary = async (formData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert AI travel planner specializing in creating personalized, detailed travel itineraries. Create a comprehensive travel plan based on the following user preferences:

**Trip Details:**
- Destination: ${formData.destination}
- Duration: ${formData.duration} days
- Budget: $${formData.budget} USD total
- Trip Type: ${formData.tripType}
- Season: ${formData.season}
- Group Size: ${formData.groupSize}
- Travel Pace: ${formData.pace}
- Accommodation Preference: ${formData.accommodation}
- Transportation Preference: ${formData.transportation}
- Interests: ${formData.interests.join(', ')}

**Instructions:**
Create an engaging, friendly, and inspirational travel itinerary that includes:

1. **Trip Title & Summary**: A catchy title and 2-3 sentence summary that captures the essence of the trip
2. **Daily Itinerary**: For each day, provide:
   - Morning activity (9 AM - 12 PM) with specific location, description, and estimated cost
   - Afternoon activity (1 PM - 5 PM) with specific location, description, and estimated cost
   - Evening activity (7 PM - 11 PM) with specific location, description, and estimated cost
   - 3 practical daily tips
3. **Cost Breakdown**: Realistic cost estimates that fit within the total budget
4. **Restaurant Recommendations**: 3-4 highly-rated local restaurants with cuisine type, price range, and specialty
5. **Accommodation Suggestions**: 2-3 hotels/stays matching the accommodation preference with nightly rates and amenities
6. **Local Tips**: 6-8 cultural notes, practical tips, and insider recommendations

**Tone**: Enthusiastic, friendly, and inspiring. Make the traveler excited about their upcoming adventure!

**Output Format**: Return ONLY a valid JSON object with this exact structure:
{
  "title": "Trip title here",
  "summary": "Trip summary here",
  "totalCost": ${formData.budget},
  "dailyBudget": calculated_daily_budget,
  "days": [
    {
      "day": 1,
      "date": "formatted_date",
      "morning": {
        "time": "9:00 AM - 12:00 PM",
        "activity": "activity_name",
        "location": "specific_location",
        "cost": estimated_cost,
        "description": "detailed_description"
      },
      "afternoon": {
        "time": "1:00 PM - 5:00 PM",
        "activity": "activity_name",
        "location": "specific_location",
        "cost": estimated_cost,
        "description": "detailed_description"
      },
      "evening": {
        "time": "7:00 PM - 11:00 PM",
        "activity": "activity_name",
        "location": "specific_location",
        "cost": estimated_cost,
        "description": "detailed_description"
      },
      "tips": ["tip1", "tip2", "tip3"]
    }
  ],
  "restaurants": [
    {
      "name": "restaurant_name",
      "type": "cuisine_type",
      "priceRange": "$$ or $$$ format",
      "rating": 4.5,
      "speciality": "signature_dish"
    }
  ],
  "accommodations": [
    {
      "name": "hotel_name",
      "type": "hotel_type",
      "pricePerNight": nightly_rate,
      "rating": 4.5,
      "amenities": ["amenity1", "amenity2", "amenity3"]
    }
  ],
  "tips": ["tip1", "tip2", "tip3", "tip4", "tip5", "tip6"]
}

Ensure all costs are realistic and the total daily costs don't exceed the daily budget. Make recommendations specific to the destination and season.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Parse the JSON response
    const itinerary = JSON.parse(jsonText);
    
    // Add dates to each day
    const startDate = new Date();
    itinerary.days = itinerary.days.map((day, index) => ({
      ...day,
      date: new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));
    
    return itinerary;
    
  } catch (error) {
    console.error('Error generating itinerary:', error);
    
    // Fallback to mock data if API fails
    return generateFallbackItinerary(formData);
  }
};

const generateFallbackItinerary = (formData) => {
  const days = parseInt(formData.duration);
  const dailyBudget = Math.floor(parseInt(formData.budget) / days);
  
  return {
    title: `${days}-Day ${formData.tripType.charAt(0).toUpperCase() + formData.tripType.slice(1)} Adventure in ${formData.destination}`,
    summary: `Experience the best of ${formData.destination} with this carefully curated ${days}-day itinerary, perfectly balanced for ${formData.pace} travelers who love ${formData.interests.join(', ')}.`,
    totalCost: formData.budget,
    dailyBudget: dailyBudget,
    days: Array.from({ length: days }, (_, index) => ({
      day: index + 1,
      date: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      morning: {
        time: "9:00 AM - 12:00 PM",
        activity: `Explore ${formData.destination}'s historic district`,
        location: "Historic Downtown",
        cost: Math.floor(dailyBudget * 0.3),
        description: "Start your day discovering the rich history and architecture of the old town."
      },
      afternoon: {
        time: "1:00 PM - 5:00 PM",
        activity: `${formData.tripType === 'beach' ? 'Beach time and water sports' : formData.tripType === 'culture' ? 'Museum and gallery hopping' : 'Local market and food tour'}`,
        location: formData.tripType === 'beach' ? "Main Beach" : formData.tripType === 'culture' ? "Arts District" : "Central Market",
        cost: Math.floor(dailyBudget * 0.4),
        description: "Immerse yourself in the local culture and lifestyle."
      },
      evening: {
        time: "7:00 PM - 11:00 PM",
        activity: "Dinner at local restaurant and evening stroll",
        location: "Restaurant District",
        cost: Math.floor(dailyBudget * 0.3),
        description: "End your day with delicious local cuisine and a peaceful evening walk."
      },
      tips: [
        "Book restaurant reservations in advance",
        "Carry cash for small vendors",
        "Stay hydrated and wear comfortable shoes"
      ]
    })),
    restaurants: [
      {
        name: "Local Flavor Bistro",
        type: "Traditional",
        priceRange: "$$",
        rating: 4.8,
        speciality: "Local cuisine"
      },
      {
        name: "Sunset Cafe",
        type: "International",
        priceRange: "$$$",
        rating: 4.6,
        speciality: "Seafood"
      }
    ],
    accommodations: [
      {
        name: "Boutique Hotel Central",
        type: "Hotel",
        pricePerNight: Math.floor(dailyBudget * 0.4),
        rating: 4.7,
        amenities: ["WiFi", "Breakfast", "Pool"]
      }
    ],
    tips: [
      "Download offline maps before you go",
      "Learn basic phrases in the local language",
      "Check local customs and etiquette",
      "Pack layers for changing weather",
      "Keep copies of important documents",
      "Research local transportation options"
    ]
  };
};