// App.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer, ParamListBase, NavigationProp, RouteProp, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CurrentWeatherScreen from './pages/CurrentWeather';
import UpdateLocationAndWeather from './components/UpdateLocationAndWeather';

interface AppProps {}
interface AppState {}

const INITIAL_LONGITUDE: number | null = null;
const INITIAL_LATITUDE: number | null = null;

export type RootStackParamList = ParamListBase & {
    Loading: undefined; // This refers to the App component acting as the loading screen
    CurrentWeather: { weatherData: WeatherData; latitude: number; longitude: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface WeatherData {
    fetchTime: number;
    current: {
        time: Date;
        temperature2m: number;
        relativeHumidity2m: number;
        weatherCode: number;
    };
    hourly: {
        time: Date[];
        temperature2m: number[];
        weatherCode: number[];
        relativeHumidity2m: number[];
    };
    daily: {
        time: Date[];
        weatherCode: number[];
        temperature2mMean: number[];
    };
}

const App: React.FC = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [currentLongitude, setCurrentLongitude] = useState<number | null>(INITIAL_LONGITUDE);
    const [currentLatitude, setCurrentLatitude] = useState<number | null>(INITIAL_LATITUDE);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const initialRenderTime = useRef(Date.now());
    const navigation = useRef<NavigationContainerRef<RootStackParamList>>(null); // Ref for the navigation container

    const handleWeatherUpdate = useCallback((data: WeatherData | null) => {
        console.log("[App] handleWeatherUpdate called with data:", data);
        setWeatherData(data);
        setLoading(false);
    }, []);

    const handleLocationUpdate = useCallback((longitude: number, latitude: number) => {
        console.log("[App] onLocationUpdate called with longitude:", longitude, "latitude:", latitude);
        setCurrentLongitude(longitude);
        setCurrentLatitude(latitude);
    }, []);

    useEffect(() => {
        console.log("[App] useEffect for navigation - Latitude:", currentLatitude, "Longitude:", currentLongitude, "WeatherData:", weatherData);
        if (weatherData && currentLatitude !== null && currentLongitude !== null && navigation.current) {
            console.log("[App] Navigating to CurrentWeather from useEffect");
            navigation.current.navigate('CurrentWeather', {
                weatherData: weatherData,
                latitude: currentLatitude,
                longitude: currentLongitude,
                
            });
        } else if (error) {
            console.error("[App] Error during fetch:", error);
            // Optionally navigate to an error screen
        } else if (weatherData) {
            console.log("[App] Weather data received, waiting for location...");
        } else if (currentLatitude !== null && currentLongitude !== null) {
            console.log("[App] Location received, waiting for weather data...");
        }
    }, [weatherData, currentLatitude, currentLongitude, navigation, error]);

    return (
        <NavigationContainer ref={navigation}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Loading" options={{ headerShown: false }}>
                    {() => (
                        <View style={styles.container}>
                            <Text>Loading Screen Content</Text>
                            {loading && <Text>Loading Location and Weather...</Text>}
                            {error && <Text>Error: {error}</Text>}
                            <UpdateLocationAndWeather
                                locationType="Detected"
                                initialTime={initialRenderTime.current}
                                finalTime={Date.now()}
                                onWeatherUpdate={handleWeatherUpdate}
                                onLocationUpdate={handleLocationUpdate}
                            />
                            {weatherData && <Text>Weather Data Received...</Text>}
                        </View>
                    )}
                </Stack.Screen>
                <Stack.Screen name="CurrentWeather" component={CurrentWeatherScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default App;