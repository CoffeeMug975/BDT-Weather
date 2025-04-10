// ./pages/CurrentWeather.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App'; // Import your RootStackParamList
import UpdateLocationAndWeather from '../components/UpdateLocationAndWeather';

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

interface CurrentWeatherScreenProps {
    route: RouteProp<RootStackParamList, 'CurrentWeather'>;
}

const CurrentWeatherScreen: React.FC<CurrentWeatherScreenProps> = ({ route }) => {
    const { weatherData: initialWeatherData, latitude: initialLatitude, longitude: initialLongitude } = route.params;
    const [currentWeatherData, setCurrentWeatherData] = useState<WeatherData | null>(initialWeatherData);
    const [currentLatitude, setCurrentLatitude] = useState<number | null>(initialLatitude);
    const [currentLongitude, setCurrentLongitude] = useState<number | null>(initialLongitude);
    const [hourlyForecastToday, setHourlyForecastToday] = useState<
        { time: Date; temperature: number; weatherCode: number }[]
    >([]);
    const [dailyForecastFuture, setDailyForecastFuture] = useState<
        { time: Date; temperatureMean: number; weatherCode: number }[]
    >([]);

    const handleWeatherUpdate = (data: WeatherData | null) => {
        console.log("[CurrentWeatherScreen] Received updated weather data:", data);
        setCurrentWeatherData(data);
    };

    const handleLocationUpdate = (longitude: number, latitude: number) => {
        console.log("[CurrentWeatherScreen] Received updated location:", longitude, latitude);
        setCurrentLongitude(longitude);
        setCurrentLatitude(latitude);
    };

    useEffect(() => {
        if (currentWeatherData?.hourly) {
            const today = new Date();
            const hourlyData = currentWeatherData.hourly;
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

        if (currentWeatherData?.daily) {
            const today = new Date();
            const dailyData = currentWeatherData.daily;
            const futureForecast = [];

            for (let i = 0; i < dailyData.time.length; i++) {
                const forecastDate = new Date(dailyData.time[i]);
                if (
                    forecastDate.getFullYear() === today.getFullYear() &&
                    forecastDate.getMonth() === today.getMonth() &&
                    forecastDate.getDate() >= today.getDate()
                ) {
                    futureForecast.push({
                        time: forecastDate,
                        temperatureMean: dailyData.temperature2mMean[i],
                        weatherCode: dailyData.weatherCode[i],
                    });
                } else if (
                    forecastDate.getFullYear() > today.getFullYear() ||
                    forecastDate.getMonth() > today.getMonth()
                ) {
                    futureForecast.push({
                        time: forecastDate,
                        temperatureMean: dailyData.temperature2mMean[i],
                        weatherCode: dailyData.weatherCode[i],
                    });
                }
            }
            setDailyForecastFuture(futureForecast);
        }
    }, [currentWeatherData]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <UpdateLocationAndWeather
                locationType="Detected"
                onWeatherUpdate={handleWeatherUpdate}
                onLocationUpdate={handleLocationUpdate}
                initialTime={Date.now()}
                finalTime={Date.now()}
            />
            <Text style={styles.title}>Current Weather</Text>
            <View style={styles.locationInfo}>
                <Text>Latitude: {currentLatitude}</Text>
                <Text>Longitude: {currentLongitude}</Text>
            </View>
            {currentWeatherData ? (
                <View style={styles.weatherInfo}>
                    <Text style={styles.subtitle}>Current Conditions</Text>
                    <Text>Time: {currentWeatherData.current.time.toLocaleTimeString()}</Text>
                    <Text>Temperature: {currentWeatherData.current.temperature2m}°C</Text>
                    <Text>Humidity: {currentWeatherData.current.relativeHumidity2m}%</Text>
                    <Text>Weather Code: {currentWeatherData.current.weatherCode}</Text>

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

                    <Text style={styles.subtitle}>Daily Forecast</Text>
                    {dailyForecastFuture.length > 0 ? (
                        dailyForecastFuture.map((item, index) => (
                            <View key={index} style={styles.dailyItem}>
                                <Text>{item.time.toLocaleDateString()}</Text>
                                <Text>Mean Temp: {item.temperatureMean}°C</Text>
                                <Text>Code: {item.weatherCode}</Text>
                            </View>
                        ))
                    ) : (
                        <Text>No daily forecast data available.</Text>
                    )}
                </View>
            ) : (
                <Text>Loading weather data...</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        alignItems: 'stretch',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    locationInfo: {
        marginBottom: 15,
        alignItems: 'center',
    },
    weatherInfo: {
        marginTop: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    hourlyForecast: {
        marginBottom: 15,
    },
    hourlyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    dailyForecast: {},
    dailyItem: {
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default CurrentWeatherScreen;