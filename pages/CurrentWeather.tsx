// ./pages/CurrentWeather.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList, WeatherData } from '../App'; // Import types
import ThisWeekScreen from './ThisWeek';
import TwoWeekForecastScreen from './TwoWeekForecast';
import UpdateLocationAndWeather from '../components/UpdateLocationAndWeather'; // Import this

interface CurrentWeatherRouteProp extends RouteProp<RootStackParamList, 'Main'> {}

const CurrentWeatherScreen: React.FC = () => {
    const route = useRoute<CurrentWeatherRouteProp>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { weatherData, latitude, longitude } = route.params!;
    const [activeTab, setActiveTab] = useState<'current' | 'week' | 'twoWeek'>('current');
    const [hourlyForecastToday, setHourlyForecastToday] = useState<
        { time: Date; temperature: number; weatherCode: number }[]
    >([]);
    const initialRenderTime = useRef(Date.now());

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Weather',
            headerLeft: () => null,
            headerRight: () => null, // Remove the header settings button
        });

        if (weatherData?.hourly) {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDate = now.getDate();
    
            const hourlyData = weatherData.hourly;
            const forecastToday = [];
    
            const localOffsetMilliseconds = now.getTimezoneOffset() * 60 * 1000; // Offset in milliseconds
            const utcNowMilliseconds = now.getTime() + localOffsetMilliseconds;
            const todayStartLocal = new Date(utcNowMilliseconds - (utcNowMilliseconds % (24 * 60 * 60 * 1000))); // Start of local day in UTC milliseconds
            const tomorrowStartLocal = new Date(todayStartLocal.getTime() + (24 * 60 * 60 * 1000)); // Start of next local day in UTC milliseconds
    
            for (let i = 0; i < hourlyData.time.length; i++) {
                const forecastTimeUtcMilliseconds = new Date(hourlyData.time[i]).getTime();
    
                if (forecastTimeUtcMilliseconds >= todayStartLocal.getTime() && forecastTimeUtcMilliseconds < tomorrowStartLocal.getTime()) {
                    forecastToday.push({
                        time: new Date(forecastTimeUtcMilliseconds), // Use the original UTC time
                        temperature: hourlyData.temperature2m[i],
                        weatherCode: hourlyData.weatherCode[i],
                    });
                }
            }
    
            // Sort the forecast by time to ensure chronological order
            forecastToday.sort((a, b) => a.time.getTime() - b.time.getTime());
    
            setHourlyForecastToday(forecastToday);
            console.log('CurrentWeatherScreen - Hourly Forecast for Today (Local Time):', forecastToday);
        }
    }, [weatherData]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'current':
                return (
                    <View>
                        <Text style={styles.subtitle}>Current Conditions</Text>
                        {weatherData && (
                            <>
                                <Text>Time: {weatherData.current.time.toLocaleTimeString()}</Text>
                                <Text>Temperature: {weatherData.current.temperature2m}°C</Text>
                                <Text>Humidity: {weatherData.current.relativeHumidity2m}%</Text>
                                <Text>Weather Code: {weatherData.current.weatherCode}</Text>
                            </>
                        )}

                        <Text style={styles.subtitle}>Hourly Forecast for Today</Text>
                        {hourlyForecastToday.length > 0 ? (
                            hourlyForecastToday.map((item, index) => (
                                <View key={index} style={styles.hourlyItem}>
                                    <Text>{item.time.toLocaleTimeString()}</Text>
                                    <Text>{item.temperature}°C</Text>
                                    <Text>Code: {item.weatherCode}</Text>
                                </View>
                            ))
                        ) : (
                            <Text>No hourly forecast data available for today.</Text>
                        )}
                    </View>
                );
            case 'week':
                return <ThisWeekScreen weatherData={weatherData} latitude={currentLatitude} longitude={currentLongitude} />;
            case 'twoWeek':
                return <TwoWeekForecastScreen weatherData={weatherData} latitude={currentLatitude} longitude={currentLongitude} />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {(currentLatitude !== null && currentLongitude !== null) && (
                <View style={styles.locationInfo}>
                    <Text>Latitude: {currentLatitude?.toFixed(4)}</Text>
                    <Text>Longitude: {currentLongitude?.toFixed(4)}</Text>
                </View>
            )}
            <View style={styles.content}>
                {weatherData ? (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {renderTabContent()}
                    </ScrollView>
                ) : (
                    <Text>Loading weather details...</Text>
                )}
            </View>
            <View style={styles.bottomNav}>
                <TouchableOpacity style={[styles.navItem, activeTab === 'current' && styles.activeNavItem]} onPress={() => setActiveTab('current')}>
                    <Text style={[styles.navText, activeTab === 'current' && styles.activeNavText]}>Current</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, activeTab === 'week' && styles.activeNavItem]} onPress={() => setActiveTab('week')}>
                    <Text style={[styles.navText, activeTab === 'week' && styles.activeNavText]}>This Week</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, activeTab === 'twoWeek' && styles.activeNavItem]} onPress={() => setActiveTab('twoWeek')}>
                    <Text style={[styles.navText, activeTab === 'twoWeek' && styles.activeNavText]}>2-Week</Text>
                </TouchableOpacity>
                {/* New Settings Button */}
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.navText}>⚙️</Text>
                    <Text style={styles.navText}>Settings</Text>
                </TouchableOpacity>
            </View>
            {/* Conditionally render UpdateLocationAndWeather only if we don't have weather data initially */}
            {weatherData === null && (
                <UpdateLocationAndWeather
                    locationType={locationType === 'detected' ? 'Detected' : 'Selected'}
                    longitude={currentLongitude || undefined}
                    latitude={currentLatitude || undefined}
                    initialTime={initialRenderTime.current}
                    onWeatherUpdate={setWeatherData}
                    onLocationUpdate={(lon, lat) => {
                        setCurrentLongitude(lon);
                        setCurrentLatitude(lat);
                        setLocationType('detected'); // Update location type if detected here
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    locationInfo: {
        padding: 15,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    hourlyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#e0e0e0',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    navItem: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    navText: {
        fontSize: 16,
        color: '#555',
    },
    activeNavItem: {
        backgroundColor: '#d0d0d0',
    },
    activeNavText: {
        color: '#333',
        fontWeight: 'bold',
    },
});

export default CurrentWeatherScreen;