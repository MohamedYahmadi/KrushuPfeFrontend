import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming you have this package installed

export default function Profile() {
    return (
        <LinearGradient
            colors={['#1a1a1a', '#333']}
            style={styles.container}
        >
            <View style={styles.profileHeader}>
                <Image
                    source={require('../assets/images/img.png')} // Replace with your profile image path
                    style={styles.profileImage}
                />
                <Text style={styles.profileName}>John Doe</Text>
                <Text style={styles.profileEmail}>john.doe@example.com</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.infoContainer}>
                    <Icon name="person" size={24} color="#ccc" style={styles.icon} />
                    <View>
                        <Text style={styles.label}>First Name</Text>
                        <Text style={styles.value}>John</Text>
                    </View>
                </View>
                <View style={styles.infoContainer}>
                    <Icon name="person-outline" size={24} color="#ccc" style={styles.icon} />
                    <View>
                        <Text style={styles.label}>Last Name</Text>
                        <Text style={styles.value}>Doe</Text>
                    </View>
                </View>
                <View style={styles.infoContainer}>
                    <Icon name="email" size={24} color="#ccc" style={styles.icon} />
                    <View>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>john.doe@example.com</Text>
                    </View>
                </View>
                <View style={styles.infoContainer}>
                    <Icon name="group" size={24} color="#ccc" style={styles.icon} />
                    <View>
                        <Text style={styles.label}>Team Name</Text>
                        <Text style={styles.value}>Team Alpha</Text>
                    </View>
                </View>
                <View style={styles.infoContainer}>
                    <Icon name="assignment" size={24} color="#ccc" style={styles.icon} />
                    <View>
                        <Text style={styles.label}>Registration Number</Text>
                        <Text style={styles.value}>123456</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileEmail: {
        fontSize: 16,
        color: '#ccc',
    },
    card: {
        backgroundColor: '#2a2a2a',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    icon: {
        marginRight: 15,
    },
    label: {
        fontSize: 14,
        color: '#ccc',
    },
    value: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});