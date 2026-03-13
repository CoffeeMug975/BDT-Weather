// utils/geocode.ts
import axios from 'axios';
import 'dotenv/config'; 

const OPENCAGE_API_URL = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY
const OPENCAGE_API_KEY = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY

export const geocodeCity = async (cityName: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!OPENCAGE_API_KEY) {
        console.error("OPENCAGE_API_KEY not found in .env file. Geocoding will not work.");
        return null;
    }

    try {
        const response = await axios.get(OPENCAGE_API_URL, {
            params: {
                q: cityName,
                key: OPENCAGE_API_KEY,
                limit: 1,
            },
        });

        const { results } = response.data;

        if (results && results.length > 0) {
            const { geometry } = results[0];
            return {
                latitude: geometry.lat,
                longitude: geometry.lng,
            };
        } else {
            return null; // City not found
        }
    } catch (error: any) {
        console.error('Error during geocoding:', error.message);
        return null;
    }
};