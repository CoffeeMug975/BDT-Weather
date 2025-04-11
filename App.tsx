// App.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer, ParamListBase, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackScreenProps } from '@react-navigation/stack'; // Import StackScreenProps
import CurrentWeatherScreen from './pages/CurrentWeather';
import ThisWeekScreen from './pages/ThisWeek';
import TwoWeekForecastScreen from './pages/TwoWeekForecast';
import SettingsScreen from './pages/Settings';
import UpdateLocationAndWeather from './components/UpdateLocationAndWeather';

interface AppProps {}
interface AppState {}

const INITIAL_LONGITUDE: number | null = null;
const INITIAL_LATITUDE: number | null = null;

export type RootStackParamList = ParamListBase & {
    Loading: undefined;
    Main: { weatherData: WeatherData; latitude: number; longitude: number } | undefined;
    Settings: undefined;
    ThisWeek: undefined; // Props are passed directly
    TwoWeekForecast: undefined; // Props are passed directly
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export interface WeatherData {
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
    const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

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
        if (weatherData && currentLatitude !== null && currentLongitude !== null && navigationRef.current) {
            console.log("[App] Navigating to Main from useEffect");
            navigationRef.current.navigate('Main', {
                weatherData: weatherData,
                latitude: currentLatitude,
                longitude: currentLongitude,
            });
        } else if (error) {
            console.error("[App] Error during fetch:", error);
            // Optionally navigate to an error screen
        }
    }, [weatherData, currentLatitude, currentLongitude, error]);

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator>
                <Stack.Screen name="Loading" component={() => (
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
                )} options={{ headerShown: false, headerLeft: () => null }} />
                <Stack.Screen
                    name="Main"
                    component={CurrentWeatherScreen}
                    options={({ navigation }) => ({
                        headerRight: () => (
                            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 15 }}>
                                <Text>⚙️</Text>
                            </TouchableOpacity>
                        ),
                        headerShown: true,
                        headerTitle: 'Weather', // Common title
                        headerLeft: () => null,
                    })}
                />
                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ headerShown: true, headerTitle: 'Settings', headerLeft: () => null }}
                />
                <Stack.Screen
                    name="ThisWeek"
                    component={(props: StackScreenProps<RootStackParamList, 'ThisWeek'>) => (
                        <ThisWeekScreen {...props} weatherData={weatherData} latitude={currentLatitude} longitude={currentLongitude} />
                    )}
                    options={{ headerShown: true, headerTitle: 'This Week', headerLeft: () => null }}
                />
                <Stack.Screen
                    name="TwoWeekForecast"
                    component={(props: StackScreenProps<RootStackParamList, 'TwoWeekForecast'>) => (
                        <TwoWeekForecastScreen {...props} weatherData={weatherData} latitude={currentLatitude} longitude={currentLongitude} />
                    )}
                    options={{ headerShown: true, headerTitle: 'Two Week Forecast', headerLeft: () => null }}
                />
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