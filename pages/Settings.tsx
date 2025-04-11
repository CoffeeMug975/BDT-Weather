// pages/Settings.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

const SettingsScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <Text style={styles.subtitle} >Settings</Text>
            <Text>Here you can implement your settings options.</Text>
            
            <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back to Weather</Text>
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
    backButton: {
        marginTop: 30,
        backgroundColor: 'lightgray',
        padding: 15,
        borderRadius: 5,
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        paddingHorizontal: 15,
    },
});

export default SettingsScreen;