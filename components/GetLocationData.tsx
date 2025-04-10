// GetLocationData.tsx
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationCoords {
    longitude: number | null;
    latitude: number | null;
}

interface GetLocationDataResult {
    coords: LocationCoords | null;
    error: string | null;
}

const GetLocationData = (): Promise<GetLocationDataResult> => {
    console.log("[GetLocation] GetLocationData function called...");

    return new Promise(async (resolve) => {
        let coords: LocationCoords | null = null; // Regular variable
        let errorMsg: string | null = null;
        let isMounted = true;

        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            console.log("[GetLocation] Permissions status:", status);

            if (status !== 'granted') {
                errorMsg = 'Permission to access location was denied';
                console.log('[GetLocation] Permission to access location was denied');
                resolve({ coords: null, error: errorMsg });
                return;
            } else {
                console.log('[GetLocation] Permission successful');
            }

            try {
                console.log('[GetLocation] Attempting to get current position...');
                let loc = await Location.getCurrentPositionAsync();
                console.log('[GetLocation] Location data received:', loc.coords);
                coords = {
                    longitude: loc.coords.longitude,
                    latitude: loc.coords.latitude,
                };
                if (isMounted) {
                    console.log('[GetLocation] Resolving with coords:', coords);
                    resolve({ coords: coords, error: null });
                }
            } catch (error: any) {
                const errorMessage = 'Error getting location: ' + error.message;
                errorMsg = errorMessage;
                console.error('[GetLocation] Error getting location:', error);
                resolve({ coords: null, error: errorMsg });
            }
        };

        getLocation();

        return () => {
            isMounted = false;
        };
    });
};

export default GetLocationData;