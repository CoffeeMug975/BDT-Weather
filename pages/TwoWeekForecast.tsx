// pages/TwoWeekForecast.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WeatherData, RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface TwoWeekForecastScreenProps {
    weatherData: WeatherData | null;
    latitude: number | null;
    longitude: number | null;
}

const TwoWeekForecastScreen: React.FC<TwoWeekForecastScreenProps> = ({ weatherData }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Two Week Forecast',
            headerLeft: () => null,
            headerRight: () => null,
        });
    }, [navigation]);

    if (!weatherData?.daily) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading two-week forecast...</Text>
            </View>
        );
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const twoWeekForecast = weatherData.daily.time
        .map((date, index) => ({
            time: new Date(date),
            temperatureMean: weatherData.daily.temperature2mMean[index],
            weatherCode: weatherData.daily.weatherCode[index],
        }))
        .filter(item => {
            const itemDate = item.time;
            return itemDate >= tomorrow && itemDate < new Date(tomorrow.getTime() + (14 * 24 * 60 * 60 * 1000));
        });

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.subtitle}>Two-Week Forecast</Text>
            {twoWeekForecast.map((item, index) => (
                <View key={index} style={styles.card}>
                    <Text style={styles.date}>{item.time.toLocaleDateString()}</Text>
                    <Text style={styles.temp}>Mean Temp: {item.temperatureMean}°C</Text>
                    <Text style={styles.code}>Weather Code: {item.weatherCode}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 16,
        backgroundColor: '#e9f7f9',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#0c4a6e',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    date: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        color: '#2c3e50',
    },
    temp: {
        color: '#1e3a8a',
    },
    code: {
        color: '#555',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e9f7f9',
    },
    loadingText: {
        fontSize: 16,
        color: '#555',
    },
});

export default TwoWeekForecastScreen;
