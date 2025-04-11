// pages/Settings.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WeatherData } from '../App';
import UpdateLocationAndWeather from '../components/UpdateLocationAndWeather';
import { geocodeCity } from '../utils/geocode'; // Ensure this path is correct

interface SettingsScreenProps {}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [locationType, setLocationType] = useState<'detected' | 'selected'>('detected');
    const [citySearch, setCitySearch] = useState('');
    const [selectedCityCoordinates, setSelectedCityCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
    const [fetchedWeatherData, setFetchedWeatherData] = useState<WeatherData | null>(null);
    const [isFetchingWeather, setIsFetchingWeather] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearchCity = useCallback(async () => {
        if (!citySearch.trim()) {
            Alert.alert('Error', 'Please enter a city name.');
            return;
        }
        setSearchError(null);
        try {
            const coordinates = await geocodeCity(citySearch);
            if (coordinates) {
                setSelectedCityCoordinates(coordinates);
                setLocationType('selected');
            } else {
                setSearchError('City not found. Please try again.');
                setSelectedCityCoordinates(null);
                setLocationType('detected'); // Revert to detected if search fails
            }
        } catch (error: any) {
            setSearchError('Error during geocoding.');
            console.error('Geocoding error:', error.message);
            setSelectedCityCoordinates(null);
            setLocationType('detected'); // Revert to detected on error
        }
    }, [citySearch, geocodeCity, setLocationType]);

    const handleWeatherUpdate = useCallback((data: WeatherData | null) => {
        setFetchedWeatherData(data);
        setIsFetchingWeather(false);
        if (data && selectedCityCoordinates) {
            navigation.navigate('Main', {
                weatherData: data,
                latitude: selectedCityCoordinates.latitude,
                longitude: selectedCityCoordinates.longitude,
            });
        }
    }, [navigation, selectedCityCoordinates]);

    useEffect(() => {
        if (selectedCityCoordinates) {
            setIsFetchingWeather(true);
            // No need for direct GetWeatherData call here, UpdateLocationAndWeather will handle it
        }
    }, [selectedCityCoordinates]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Settings</Text>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Enter city name"
                    value={citySearch}
                    onChangeText={setCitySearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearchCity}>
                    <Text>Search</Text>
                </TouchableOpacity>
            </View>

            {searchError && <Text style={styles.errorText}>{searchError}</Text>}

            {selectedCityCoordinates && (
                <Text style={styles.coordinates}>
                    Selected Coordinates: Latitude {selectedCityCoordinates.latitude.toFixed(4)}, Longitude {selectedCityCoordinates.longitude.toFixed(4)}
                </Text>
            )}

            {isFetchingWeather && <Text>Fetching weather for selected city...</Text>}

            {/* This UpdateLocationAndWeather component is now triggered by selectedCityCoordinates */}
            {selectedCityCoordinates && (
                <UpdateLocationAndWeather
                    locationType="Selected"
                    longitude={selectedCityCoordinates.longitude}
                    latitude={selectedCityCoordinates.latitude}
                    onWeatherUpdate={handleWeatherUpdate}
                />
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text>Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: 'lightblue',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    coordinates: {
        marginBottom: 10,
    },
    backButton: {
        marginTop: 30,
        backgroundColor: 'lightgray',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default SettingsScreen;