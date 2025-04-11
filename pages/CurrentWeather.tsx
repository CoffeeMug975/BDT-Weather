// ./pages/CurrentWeather.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WeatherData } from '../App';
import ThisWeekScreen from './ThisWeek';
import TwoWeekForecastScreen from './TwoWeekForecast';
import UpdateLocationAndWeather from '../components/UpdateLocationAndWeather';

interface CurrentWeatherRouteProp extends RouteProp<RootStackParamList, 'Main'> {}

const CurrentWeatherScreen: React.FC = () => {
    const route = useRoute<CurrentWeatherRouteProp>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const initialWeatherData = route.params?.weatherData;
    const initialLatitude = route.params?.latitude;
    const initialLongitude = route.params?.longitude;

    const [weatherData, setWeatherData] = useState<WeatherData | null>(initialWeatherData || null);
    const [currentLatitude, setCurrentLatitude] = useState<number | null>(initialLatitude || null);
    const [currentLongitude, setCurrentLongitude] = useState<number | null>(initialLongitude || null);
    const [locationType, setLocationType] = useState<'detected' | 'selected'>(initialLatitude && initialLongitude ? 'selected' : 'detected');
    const [activeTab, setActiveTab] = useState<'current' | 'week' | 'twoWeek'>('current');
    const [hourlyForecastToday, setHourlyForecastToday] = useState<{ time: Date; temperature: number; weatherCode: number }[]>([]);
    const initialRenderTime = useRef(Date.now());

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Weather',
            headerLeft: () => null,
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerIcon}>
                    <Text>⚙️</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        if (initialLatitude !== undefined && initialLongitude !== undefined) {
            setCurrentLatitude(initialLatitude);
            setCurrentLongitude(initialLongitude);
            setLocationType('selected');
        } else {
            setLocationType('detected');
        }
        if (initialWeatherData) {
            setWeatherData(initialWeatherData);
        }
    }, [initialLatitude, initialLongitude, initialWeatherData]);

    useEffect(() => {
        if (weatherData?.hourly) {
            const today = new Date();
            const forecastToday = weatherData.hourly.time
                .map((timeStr, i) => {
                    const forecastTime = new Date(timeStr);
                    if (
                        forecastTime.getFullYear() === today.getFullYear() &&
                        forecastTime.getMonth() === today.getMonth() &&
                        forecastTime.getDate() === today.getDate()
                    ) {
                        return {
                            time: forecastTime,
                            temperature: weatherData.hourly.temperature2m[i],
                            weatherCode: weatherData.hourly.weatherCode[i],
                        };
                    }
                    return null;
                })
                .filter(Boolean) as { time: Date; temperature: number; weatherCode: number }[];

            setHourlyForecastToday(forecastToday);
        }
    }, [weatherData]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'current':
                return (
                    <View>
                        <Text style={styles.subtitle}>Current Conditions</Text>
                        {weatherData && (
                            <View style={styles.card}>
                                <Text style={styles.cardText}>🕒 {weatherData.current.time.toLocaleTimeString()}</Text>
                                <Text style={styles.cardText}>🌡️ {weatherData.current.temperature2m}°C</Text>
                                <Text style={styles.cardText}>💧 {weatherData.current.relativeHumidity2m}%</Text>
                                <Text style={styles.cardText}>☁️ Code: {weatherData.current.weatherCode}</Text>
                            </View>
                        )}
                        <Text style={styles.subtitle}>Hourly Forecast for Today</Text>
                        {hourlyForecastToday.length > 0 ? (
                            hourlyForecastToday.map((item, index) => (
                                <View key={index} style={styles.hourlyItem}>
                                    <Text style={styles.hourlyTime}>{item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    <Text style={styles.hourlyTemp}>{item.temperature}°C</Text>
                                    <Text style={styles.hourlyCode}>Code: {item.weatherCode}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.cardText}>No hourly forecast data available for today.</Text>
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
            {currentLatitude !== null && currentLongitude !== null && (
                <View style={styles.locationInfo}>
                    <Text style={styles.locationText}>📍 {currentLatitude.toFixed(4)}, {currentLongitude.toFixed(4)}</Text>
                </View>
            )}
            <View style={styles.content}>
                {weatherData ? (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {renderTabContent()}
                    </ScrollView>
                ) : (
                    <Text style={styles.loadingText}>Loading weather details...</Text>
                )}
            </View>
            <View style={styles.bottomNav}>
                <TouchableOpacity style={[styles.navItem, activeTab === 'current' && styles.activeNavItem]} onPress={() => setActiveTab('current')}>
                    <Text style={[styles.navText, activeTab === 'current' && styles.activeNavText]}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, activeTab === 'week' && styles.activeNavItem]} onPress={() => setActiveTab('week')}>
                    <Text style={[styles.navText, activeTab === 'week' && styles.activeNavText]}>This Week</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, activeTab === 'twoWeek' && styles.activeNavItem]} onPress={() => setActiveTab('twoWeek')}>
                    <Text style={[styles.navText, activeTab === 'twoWeek' && styles.activeNavText]}>2-Week</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.navText}>⚙️</Text>
                    <Text style={styles.navText}>Settings</Text>
                </TouchableOpacity>
            </View>

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
                        setLocationType('detected');
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e0f7fa',
    },
    locationInfo: {
        padding: 12,
        alignItems: 'center',
        backgroundColor: '#b2ebf2',
        borderBottomWidth: 1,
        borderBottomColor: '#81d4fa',
    },
    locationText: {
        fontSize: 16,
        color: '#004d40',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00796b',
        marginBottom: 10,
        marginTop: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    hourlyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#e1f5fe',
        borderRadius: 8,
        marginBottom: 8,
    },
    hourlyTime: {
        fontWeight: 'bold',
        color: '#0277bd',
    },
    hourlyTemp: {
        color: '#ff5722',
    },
    hourlyCode: {
        color: '#555',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#b2ebf2',
        borderTopWidth: 1,
        borderTopColor: '#4dd0e1',
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 14,
        color: '#006064',
    },
    activeNavItem: {
        borderBottomWidth: 3,
        borderBottomColor: '#004d40',
    },
    activeNavText: {
        fontWeight: 'bold',
        color: '#004d40',
    },
    headerIcon: {
        marginRight: 15,
    },
    loadingText: {
        padding: 20,
        fontSize: 16,
        color: '#555',
    },
});

export default CurrentWeatherScreen;
