// ./pages/CurrentWeather.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WeatherData } from '../App';
import ThisWeekScreen from './ThisWeek';
import TwoWeekForecastScreen from './TwoWeekForecast';

interface CurrentWeatherRouteProp extends RouteProp<RootStackParamList, 'Main'> {}

const CurrentWeatherScreen: React.FC = () => {
    const route = useRoute<CurrentWeatherRouteProp>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { weatherData, latitude, longitude } = route.params!;
    const [activeTab, setActiveTab] = useState<'current' | 'week' | 'twoWeek'>('current');
    const [hourlyForecastToday, setHourlyForecastToday] = useState<
        { time: Date; temperature: number; weatherCode: number }[]
    >([]);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Weather',
            headerLeft: () => null,
            headerRight: () => null, // Remove the header settings button
        });

        if (weatherData?.hourly) {
            const today = new Date();
            const hourlyData = weatherData.hourly;
            const forecastToday = [];

            for (let i = 0; i < hourlyData.time.length; i++) {
                const forecastTime = new Date(hourlyData.time[i]);
                if (
                    forecastTime.getFullYear() === today.getFullYear() &&
                    forecastTime.getMonth() === today.getMonth() &&
                    forecastTime.getDate() === today.getDate()
                ) {
                    forecastToday.push({
                        time: forecastTime,
                        temperature: hourlyData.temperature2m[i],
                        weatherCode: hourlyData.weatherCode[i],
                    });
                }
            }
            setHourlyForecastToday(forecastToday);
        }
    }, [navigation, weatherData]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'current':
                return (
                    <View>
                        <Text style={styles.subtitle}>Current Conditions</Text>
                        <Text>Time: {weatherData.current.time.toLocaleTimeString()}</Text>
                        <Text>Temperature: {weatherData.current.temperature2m}°C</Text>
                        <Text>Humidity: {weatherData.current.relativeHumidity2m}%</Text>
                        <Text>Weather Code: {weatherData.current.weatherCode}</Text>

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
                return <ThisWeekScreen weatherData={weatherData} latitude={latitude} longitude={longitude} />;
            case 'twoWeek':
                return <TwoWeekForecastScreen weatherData={weatherData} latitude={latitude} longitude={longitude} />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.locationInfo}>
                <Text>Latitude: {latitude}</Text>
                <Text>Longitude: {longitude}</Text>
            </View>
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
        textAlign: 'center',
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