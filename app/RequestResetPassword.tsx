import React, { useState } from 'react';
            import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
            import { LinearGradient } from 'expo-linear-gradient';
            import { Mail, ArrowRight } from 'lucide-react-native';
            import axios from 'axios';
            import { useNavigation } from '@react-navigation/native';

            export default function RequestResetPassword() {
                const navigation = useNavigation();
                const [email, setEmail] = useState('');

                const handleRequestReset = async () => {
                    try {
                        const response = await axios.post(
                            'http://172.20.10.5:8080/api/user/request-password-reset',
                            { email }
                        );

                        if (response.status === 200) {
                            Alert.alert('Success', 'Reset code sent to your email');
                            navigation.navigate('ResetPassword', { email });
                        } else {
                            Alert.alert('Error', 'Failed to send reset code');
                        }
                    } catch (error) {
                        console.error(error);
                        Alert.alert('Error', 'Failed to send reset code');
                    }
                };

                return (
                    <ScrollView style={styles.container}>
                        <LinearGradient
                            colors={['#0056b3', '#003366']}
                            style={styles.headerGradient}
                        >
                            <Text style={styles.headerTitle}>Request Password Reset</Text>
                        </LinearGradient>

                        <View style={styles.contentContainer}>
                            <View style={styles.card}>
                                <View style={styles.inputContainer}>
                                    <Mail size={24} color="#0056b3" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#666"
                                        keyboardType="email-address"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>

                                <TouchableOpacity style={styles.button} onPress={handleRequestReset}>
                                    <View style={styles.buttonContent}>
                                        <Text style={styles.buttonText}>Request Reset Code</Text>
                                        <ArrowRight size={20} color="#fff" style={styles.buttonIcon} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                );
            }

            const styles = StyleSheet.create({
                container: {
                    flex: 1,
                    backgroundColor: '#f5f5f5',
                },
                headerGradient: {
                    padding: 20,
                    paddingTop: 40,
                    paddingBottom: 40,
                },
                headerTitle: {
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#fff',
                    textAlign: 'center',
                },
                contentContainer: {
                    padding: 20,
                    marginTop: -30,
                },
                card: {
                    backgroundColor: '#fff',
                    borderRadius: 15,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                },
                inputContainer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#e1e1e1',
                    borderRadius: 10,
                    paddingHorizontal: 15,
                    backgroundColor: '#fff',
                    marginBottom: 20,
                },
                icon: {
                    marginRight: 12,
                },
                input: {
                    flex: 1,
                    height: 50,
                    color: '#333',
                    fontSize: 16,
                },
                button: {
                    height: 50,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#0056b3',
                },
                buttonContent: {
                    flexDirection: 'row',
                    alignItems: 'center',
                },
                buttonText: {
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: '600',
                    marginRight: 8,
                },
                buttonIcon: {
                    marginTop: 2,
                },
            });