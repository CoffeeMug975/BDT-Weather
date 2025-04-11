// pages/ThisWeek.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WeatherData, RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface ThisWeekScreenProps {
    weatherData: WeatherData | null;
    latitude: number | null;
    longitude: number | null;
}

const ThisWeekScreen: React.FC<ThisWeekScreenProps> = ({ weatherData }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'This Week',
            headerLeft: () => null,
            headerRight: () => null,
        });
    }, [navigation]);

    if (!weatherData?.daily) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading weekly forecast...</Text>
            </View>
        );
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const weeklyForecast = weatherData.daily.time
        .map((date, index) => ({
            time: new Date(date),
            temperatureMean: weatherData.daily.temperature2mMean[index],
            weatherCode: weatherData.daily.weatherCode[index],
        }))
        .filter(item => {
            const itemDate = item.time;
            return itemDate >= tomorrow && itemDate < new Date(tomorrow.getTime() + (7 * 24 * 60 * 60 * 1000));
        });

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.subtitle}>This Week's Forecast</Text>
            {weeklyForecast.map((item, index) => (
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
        backgroundColor: '#f0f4ff',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1a3c6c',
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
        color: '#34495e',
    },
    code: {
        color: '#7f8c8d',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
    },
    loadingText: {
        fontSize: 16,
        color: '#555',
    },
});

export default ThisWeekScreen;
