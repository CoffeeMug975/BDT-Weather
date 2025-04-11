// pages/Settings.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WeatherData } from '../App';
import UpdateLocationAndWeather from '../components/UpdateLocationAndWeather';
import { geocodeCity } from '../utils/geocode'; // Ensure this path is correct
import GetWeatherData, { WeatherData as FetchedWeatherData } from '../components/GetWeatherData'; // Renamed to avoid conflict

interface SettingsScreenProps {}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [locationType, setLocationType] = useState<'detected' | 'selected'>('detected');
    const [citySearch, setCitySearch] = useState('');
    const [selectedCityCoordinates, setSelectedCityCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
    const [fetchedWeatherData, setFetchedWeatherData] = useState<FetchedWeatherData | null>(null);
    const [isFetchingWeather, setIsFetchingWeather] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleToggleLocationType = useCallback(() => {
        console.log("[Settings] handleToggleLocationType called");
        setLocationType(prevType => (prevType === 'detected' ? 'selected' : 'detected'));
        setCitySearch('');
        setSelectedCityCoordinates(null);
        setFetchedWeatherData(null); // Clear previous weather data
    }, []);

    const handleSearchCity = useCallback(async () => {
        if (!citySearch) {
            Alert.alert('Error', 'Please enter a city name.');
            return;
        }

        setIsFetchingWeather(true);
        setSearchError(null);
        console.log("[Settings] handleSearchCity called with:", citySearch);

        try {
            const coordinates = await geocodeCity(citySearch);
            console.log("[Settings] geocodeCity result:", coordinates);
            if (coordinates) {
                setSelectedCityCoordinates(coordinates);
                console.log("[Settings] Selected coordinates:", coordinates);
                // Immediately fetch weather data after getting coordinates
                console.log("[Settings] Fetching weather for:", coordinates);
                const weatherData = await GetWeatherData({
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                });
                console.log("[Settings] GetWeatherData result:", weatherData);
                setFetchedWeatherData(weatherData);
            } else {
                setSearchError('City not found. Please try again.');
                setSelectedCityCoordinates(null);
                setFetchedWeatherData(null);
            }
        } catch (error: any) {
            console.error('Error searching city or fetching weather:', error);
            setSearchError('Failed to search for city or get weather. Please check your network and try again.');
            setSelectedCityCoordinates(null);
            setFetchedWeatherData(null);
        } finally {
            setIsFetchingWeather(false);
            console.log("[Settings] handleSearchCity finished. isFetchingWeather:", isFetchingWeather);
        }
    }, [citySearch]);

    const handleGoBack = useCallback(() => {
        console.log("[Settings] handleGoBack called. locationType:", locationType, "selectedCityCoordinates:", selectedCityCoordinates, "fetchedWeatherData:", fetchedWeatherData);
        navigation.navigate(
            'Main',
            locationType === 'selected' && selectedCityCoordinates && fetchedWeatherData
                ? {
                      latitude: selectedCityCoordinates.latitude,
                      longitude: selectedCityCoordinates.longitude,
                      weatherData: fetchedWeatherData,
                  }
                : undefined
        );
    }, [navigation, selectedCityCoordinates, fetchedWeatherData, locationType]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Location Settings</Text>

            <View style={styles.settingItem}>
                <Text>Location Mode: {locationType === 'detected' ? 'Detected' : 'Selected'}</Text>
                <TouchableOpacity style={styles.button} onPress={handleToggleLocationType}>
                    <Text>{locationType === 'detected' ? 'Switch to Selected' : 'Switch to Detected'}</Text>
                </TouchableOpacity>
            </View>

            {locationType === 'selected' && (
                <View style={styles.selectedModeContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter city name"
                        value={citySearch}
                        onChangeText={setCitySearch}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSearchCity} disabled={isFetchingWeather}>
                        <Text>{isFetchingWeather ? 'Searching...' : 'Search City'}</Text>
                    </TouchableOpacity>
                    {searchError && <Text style={styles.error}>{searchError}</Text>}
                    {selectedCityCoordinates && (
                        <Text style={styles.coordinates}>
                            Latitude: {selectedCityCoordinates.latitude.toFixed(4)}, Longitude: {selectedCityCoordinates.longitude.toFixed(4)}
                        </Text>
                    )}
                    {fetchedWeatherData && (
                        <Text style={styles.weatherFetched}>Weather data fetched!</Text>
                    )}
                </View>
            )}

            <TouchableOpacity onPress={handleGoBack} style={styles.backButton} disabled={isFetchingWeather}>
                <Text style={styles.backButtonText}>{isFetchingWeather ? 'Loading...' : 'Back to Weather'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    settingItem: {
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    selectedModeContainer: {
        marginTop: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    coordinates: {
        marginTop: 10,
        fontSize: 16,
    },
    error: {
        marginTop: 10,
        color: 'red',
    },
    weatherFetched: {
        marginTop: 10,
        color: 'green',
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#ddd',
        borderRadius: 5,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;