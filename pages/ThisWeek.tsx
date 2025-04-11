// pages/ThisWeek.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WeatherData } from '../App'; // Import types

interface ThisWeekScreenProps {
    weatherData: WeatherData | null;
    latitude: number | null;
    longitude: number | null;
}

const ThisWeekScreen: React.FC<ThisWeekScreenProps> = ({ weatherData, latitude, longitude }) => {
    if (!weatherData?.daily) {
        return (
            <View style={styles.container}>
                <Text>Loading weekly forecast...</Text>
            </View>
        );
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const weeklyForecast = weatherData.daily.time
        .map((date, index) => ({
            time: new Date(date),
            temperatureMean: weatherData.daily.temperature2mMean[index],
            weatherCode: weatherData.daily.weatherCode[index],
        }))
        .filter(item => {
            const itemDate = item.time;
            return itemDate >= tomorrow && itemDate < new Date(tomorrow.getTime() + (7 * 24 * 60 * 60 * 1000)); // Next 7 days from tomorrow
        });

    return (
        <View>
            <Text style={styles.subtitle}>This Week's Forecast</Text>
            {weeklyForecast.map((item, index) => (
                <View key={index} style={styles.dayItem}>
                    <Text style={styles.date}>{item.time.toLocaleDateString()}</Text>
                    <Text>Mean Temp: {item.temperatureMean}°C</Text>
                    <Text>Code: {item.weatherCode}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    dayItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    date: {
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ThisWeekScreen;