// pages/Settings.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

const SettingsScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <Text>Here you can implement your settings options.</Text>
            {/* Add your settings components here */}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    backButton: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#ddd',
        borderRadius: 5,
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;