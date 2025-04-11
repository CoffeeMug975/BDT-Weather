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
    initialTime?: number; 
    finalTime?: number;   
    onWeatherUpdate: (data: WeatherData | null) => void;
    onLocationUpdate?: (longitude: number, latitude: number) => void;
    longitude?: number;   
    latitude?: number;    
}

const TEN_MINUTES_IN_SECONDS = 600;

const UpdateLocationAndWeather: React.FC<UpdateLocationAndWeatherProps> = ({
    locationType,
    initialTime,
    finalTime: propFinalTime,
    onWeatherUpdate,
    onLocationUpdate,
    longitude: propLongitude,
    latitude: propLatitude,
}) => {
    console.log("[UpdateLocationAndWeather] Props received:", { locationType, initialTime, propLongitude, propLatitude });
    const [currentLongitudeInternal, setCurrentLongitudeInternal] = useState<number | null>(propLongitude || null);
    const [currentLatitudeInternal, setCurrentLatitudeInternal] = useState<number | null>(propLatitude || null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [fetchingLocation, setFetchingLocation] = useState<boolean>(false);
    const [fetchingWeather, setFetchingWeather] = useState<boolean>(false);
    const hasInitialLocationFetched = useRef(false); 

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
                console.log("[UpdateLocationAndWeather] About to call GetWeatherData for detected location...");
                setFetchingWeather(true);
                const weatherData = await GetWeatherData({
                    latitude: locationResult.coords.latitude,
                    longitude: locationResult.coords.longitude,
                });
                setFetchingWeather(false);
                console.log("[UpdateLocationAndWeather] GetWeatherData result for detected:", weatherData);
                console.log("[UpdateLocationAndWeather] Calling onWeatherUpdate with detected data:", weatherData);
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
        console.log("[UpdateLocationAndWeather] useEffect triggered. Location Type:", locationType, "Initial Time:", initialTime, "Prop Longitude:", propLongitude, "Prop Latitude:", propLatitude);
        const timeDiffSeconds = Math.floor((Date.now() - (initialTime || 0)) / 1000); 
        console.log(`[UpdateLocationAndWeather] Time Difference (seconds): ${timeDiffSeconds}`);

        if (locationType === "Detected") {
            if (timeDiffSeconds < 5 && !hasInitialLocationFetched.current) {
                console.log("[UpdateLocationAndWeather] Initial load condition met for detected, attempting to get location.");
                hasInitialLocationFetched.current = true; 
                handleGetDetectedLocation();
            } else if (timeDiffSeconds >= TEN_MINUTES_IN_SECONDS) {
                console.log("[UpdateLocationAndWeather] 10 minutes elapsed for detected, potentially updating data.");
                handleGetDetectedLocation();
            }
        } else if (locationType === "Selected" && propLongitude !== undefined && propLatitude !== undefined) {
            console.log("[UpdateLocationAndWeather] Selected location received - Longitude:", propLongitude, "Latitude:", propLatitude, "Fetching weather.");
            const fetchSelectedWeather = async () => {
                setFetchingWeather(true);
                const weatherData = await GetWeatherData({
                    latitude: propLatitude,
                    longitude: propLongitude,
                });
                setFetchingWeather(false);
                console.log("[UpdateLocationAndWeather] GetWeatherData result for selected:", weatherData);
                console.log("[UpdateLocationAndWeather] Calling onWeatherUpdate with selected data:", weatherData);
                onWeatherUpdate(weatherData);
            };
            fetchSelectedWeather();
        } else {
            console.log("[UpdateLocationAndWeather] Location type is Selected but no coordinates provided.");
        }

    }, [locationType, initialTime, handleGetDetectedLocation, propLongitude, propLatitude, onWeatherUpdate]);

    return (
        <View>
            {typeof locationError === 'string' && <Text>Location Error: {locationError}</Text>}
            {currentLatitudeInternal !== null && currentLongitudeInternal !== null && (
                <Text style={{ display: 'none' }}>
                    Latitude: {currentLatitudeInternal}, Longitude: {currentLongitudeInternal}
                </Text>
            )}
            {fetchingLocation && <Text>Fetching Location...</Text>}
            {fetchingWeather && <Text>Fetching Weather...</Text>}
        </View>
    );
};

export default UpdateLocationAndWeather;