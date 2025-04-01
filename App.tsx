// Main page that routes to other page
// Loading page with application logo
// Use Expo-Location to get location (Calgary, Latitude, Longitude) Every 10 min weather app is open

import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import * as Location from 'expo-location';

const Stack = createStackNavigator();

const MainPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to BDT Weather</Text>
      <TouchableOpacity onPress={() => navigation.navigate("CurrentWeather")} style={styles.button}>
        <Text style={styles.buttonText}>Current Weather</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("ThisWeeksWeather")} style={styles.button}>
        <Text style={styles.buttonText}>This Week's Weather</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};

const CurrentWeather = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = await response.json();
      setWeather(data.current_weather);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      Alert.alert("Error", "Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission is required.");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      fetchWeather(latitude, longitude);

      const interval = setInterval(() => {
        fetchWeather(latitude, longitude);
      }, 600000); // every 10 minutes

      return () => clearInterval(interval);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Current Weather</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0084C6" />
      ) : weather ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.bodyText}>Temperature: {weather.temperature}°C</Text>
          <Text style={styles.bodyText}>Windspeed: {weather.windspeed} km/h</Text>
        </View>
      ) : (
        <Text style={styles.bodyText}>No data available.</Text>
      )}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const ThisWeeksWeather = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>This Week's Weather</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainPage">
        <Stack.Screen name="MainPage" component={MainPage} options={{ title: "Home" }} />
        <Stack.Screen name="CurrentWeather" component={CurrentWeather} />
        <Stack.Screen name="ThisWeeksWeather" component={ThisWeeksWeather} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontFamily: "Source Sans Pro",
    color: "#009DEB",
    marginBottom: 20,
    textAlign: 'center'
  },
  button: {
    backgroundColor: "#0084C6",
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
    width: 220,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Open Sans",
  },
  bodyText: {
    fontSize: 18,
    fontFamily: "Open Sans",
    color: "#333333",
    marginVertical: 6,
  },
});
