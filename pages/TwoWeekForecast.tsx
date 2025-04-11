// pages/TwoWeekForecast.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { WeatherData, RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface TwoWeekForecastScreenProps {
    weatherData: WeatherData | null;
    latitude: number | null;
    longitude: number | null;
}

const TwoWeekForecastScreen: React.FC<TwoWeekForecastScreenProps> = ({ weatherData, latitude, longitude }) => {
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
                <Text>Loading two-week forecast...</Text>
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
        <View>
            <Text style={styles.subtitle}>Two-Week Forecast</Text>
            <ScrollView>
                {twoWeekForecast.map((item, index) => (
                    <View key={index} style={styles.dayItem}>
                        <Text style={styles.date}>{item.time.toLocaleDateString()}</Text>
                        <Text>Mean Temp: {item.temperatureMean}°C</Text>
                        <Text>Code: {item.weatherCode}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        paddingHorizontal: 15,
    },
    dayItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingHorizontal: 15,
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

export default TwoWeekForecastScreen;