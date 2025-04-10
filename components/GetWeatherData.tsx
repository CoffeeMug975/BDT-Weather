// GetWeatherData.tsx
import { fetchWeatherApi } from 'openmeteo';
import { Alert } from 'react-native';

export interface WeatherData {
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

const GetWeatherData = async ({ latitude, longitude }: {
    latitude: number | null;
    longitude: number | null;
}): Promise<WeatherData | null> => {
    console.log("[GetWeatherData] Function called with latitude:", latitude, "longitude:", longitude);
    if (latitude !== null && longitude !== null) {
        const params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": ["weather_code", "temperature_2m_mean"],
            "hourly": ["temperature_2m", "weather_code", "relative_humidity_2m"],
            "current": ["temperature_2m", "relative_humidity_2m", "weather_code"],
            "forecast_days": 15
        };
        const url = "https://api.open-meteo.com/v1/forecast";

        try {
            console.log("[GetWeatherData] Fetching weather data...");
            const responses = await fetchWeatherApi(url, params);
            const response = responses[0];

            if (response) {
                const utcOffsetSeconds = response.utcOffsetSeconds();

                const current = response.current()!;
                const hourly = response.hourly()!;
                const daily = response.daily()!;

                const range = (start: number, stop: number, step: number) =>
                    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

                const weatherData: WeatherData = {
                    fetchTime: Date.now(),
                    current: {
                        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
                        temperature2m: current.variables(0)!.value(),
                        relativeHumidity2m: current.variables(1)!.value(),
                        weatherCode: current.variables(2)!.value(),
                    },
                    hourly: {
                        time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
                            (t) => new Date((t + utcOffsetSeconds) * 1000)
                        ),
                        temperature2m: [...hourly.variables(0)!.valuesArray()!],
                        weatherCode: [...hourly.variables(1)!.valuesArray()!],
                        relativeHumidity2m: [...hourly.variables(2)!.valuesArray()!],
                    },
                    daily: {
                        time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
                            (t) => new Date((t + utcOffsetSeconds) * 1000)
                        ),
                        weatherCode: [...daily.variables(0)!.valuesArray()!],
                        temperature2mMean: [...daily.variables(1)!.valuesArray()!],
                    },
                };

                console.log("[GetWeatherData] Successfully fetched weather data:", weatherData);
                return weatherData;
            } else {
                console.warn("[GetWeatherData] No weather data response received.");
                Alert.alert("Error", "Could not retrieve weather data.");
                return null;
            }
        } catch (error: any) {
            console.error("[GetWeatherData] Error fetching weather data:", error);
            Alert.alert("Error", "Failed to fetch weather data.");
            return null;
        }
    } else {
        console.warn("[GetWeatherData] Latitude or longitude is null, cannot fetch weather data.");
        return null;
    }
};

export default GetWeatherData;