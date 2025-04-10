// components/UpdateLocationAndWeather.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text } from 'react-native';
import GetLocationData from "./GetLocationData";
import GetWeatherData, { WeatherData } from "./GetWeatherData";

interface LocationCoords {
    longitude: number | null;
    latitude: number | null;
}

interface UpdateLocationAndWeatherProps {
    locationType: "Detected" | "Selected";
    initialTime: number;
    finalTime: number;
    onWeatherUpdate: (data: WeatherData | null) => void;
    onLocationUpdate: (longitude: number, latitude: number) => void;
}

const TEN_MINUTES_IN_SECONDS = 600;

const UpdateLocationAndWeather: React.FC<UpdateLocationAndWeatherProps> = ({
    locationType,
    initialTime,
    finalTime: propFinalTime,
    onWeatherUpdate,
    onLocationUpdate,
}) => {
    const [currentLongitudeInternal, setCurrentLongitudeInternal] = useState<number | null>(null);
    const [currentLatitudeInternal, setCurrentLatitudeInternal] = useState<number | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [fetchingLocation, setFetchingLocation] = useState<boolean>(false);
    const [fetchingWeather, setFetchingWeather] = useState<boolean>(false);
    const hasInitialLocationFetched = useRef(false); // Track if initial location was fetched

    const handleGetDetectedLocation = useCallback(async () => {
        if (fetchingLocation || fetchingWeather) {
            console.log("[UpdateLocationAndWeather] Already fetching location or weather, skipping.");
            return;
        }
        setFetchingLocation(true);
        console.log("[UpdateLocationAndWeather] Handling get detected location...");
        const locationResult = await GetLocationData();
        console.log("[UpdateLocationAndWeather] GetLocationData result:", locationResult);
        if (locationResult.coords) {
            console.log("[UpdateLocationAndWeather] Detected location:", locationResult.coords);
            if (locationResult.coords.longitude !== null && locationResult.coords.latitude !== null) {
                setCurrentLongitudeInternal(locationResult.coords.longitude);
                setCurrentLatitudeInternal(locationResult.coords.latitude);
                console.log("[UpdateLocationAndWeather] Internal state updated - Longitude:", currentLongitudeInternal, "Latitude:", currentLatitudeInternal);
                console.log("[UpdateLocationAndWeather] Calling onLocationUpdate with:", locationResult.coords.longitude, locationResult.coords.latitude);
                if (onLocationUpdate) {
                    onLocationUpdate(locationResult.coords.longitude, locationResult.coords.latitude);
                }
                console.log("[UpdateLocationAndWeather] About to call GetWeatherData...");
                setFetchingWeather(true);
                const weatherData = await GetWeatherData({
                    latitude: locationResult.coords.latitude,
                    longitude: locationResult.coords.longitude,
                });
                setFetchingWeather(false);
                console.log("[UpdateLocationAndWeather] GetWeatherData result:", weatherData);
                console.log("[UpdateLocationAndWeather] Calling onWeatherUpdate with data:", weatherData);
                onWeatherUpdate(weatherData);
            } else {
                console.warn("[UpdateLocationAndWeather] Received null coordinates despite locationResult.coords being truthy.");
                setLocationError("Error: Received null coordinates.");
            }
        } else {
            setLocationError(locationResult.error);
            console.error("[UpdateLocationAndWeather] Error getting detected location:", locationResult.error);
        }
        setFetchingLocation(false);
    }, [onLocationUpdate, onWeatherUpdate, fetchingLocation, fetchingWeather]);

    useEffect(() => {
        console.log("[UpdateLocationAndWeather] Component rendered or props changed. Location Type:", locationType, "Initial Time:", initialTime);
        const timeDiffSeconds = Math.floor((Date.now() - initialTime) / 1000);
        console.log(`[UpdateLocationAndWeather] Time Difference (seconds): ${timeDiffSeconds}`);

        if (timeDiffSeconds < 5 && !hasInitialLocationFetched.current) {
            console.log("[UpdateLocationAndWeather] Initial load condition met, attempting to get location.");
            hasInitialLocationFetched.current = true; // Mark that initial fetch has occurred
            if (locationType === "Detected") {
                handleGetDetectedLocation();
            } else if (locationType === "Selected") {
                // Handle selected location logic (not implemented here)
                console.log("[UpdateLocationAndWeather] Selected location logic not implemented.");
            }
        } else if (timeDiffSeconds >= TEN_MINUTES_IN_SECONDS) {
            console.log("[UpdateLocationAndWeather] 10 minutes elapsed, potentially updating data (logic not fully implemented).");
            // Implement logic to re-fetch data after 10 minutes if needed
            if (locationType === "Detected") {
                handleGetDetectedLocation();
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationType, initialTime, handleGetDetectedLocation]);

    return (
        <View>
            {typeof locationError === 'string' && <Text>Location Error: {locationError}</Text>}
            {currentLatitudeInternal !== null && currentLongitudeInternal !== null && (
                <Text style={{ display: 'none' }}>
                    {/* Latitude: {currentLatitudeInternal}, Longitude: {currentLongitudeInternal} */}
                </Text>
            )}
            {fetchingLocation && <Text>Fetching Location...</Text>}
            {fetchingWeather && <Text>Fetching Weather...</Text>}
        </View>
    );
};

export default UpdateLocationAndWeather;