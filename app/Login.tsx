import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "./types";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import Animated, {
  FadeInDown,
  FadeInUp,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Login"
>;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const buttonScale = useSharedValue(1);
  const backButtonScale = useSharedValue(1);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const backButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const handlePressIn = (shared: Animated.SharedValue<number>) => {
    shared.value = withSpring(0.95);
  };

  const handlePressOut = (shared: Animated.SharedValue<number>) => {
    shared.value = withSpring(1);
  };

  const saveCredentials = async (token: string, id: string, role: string | null, department: string | null) => {
    try {
      // Validate required fields
      if (!token || !id) {
        throw new Error('Missing required credentials');
      }

      // Default role if not provided
      const normalizedRole = (role || 'GUEST').toUpperCase();

      if (Platform.OS === "web") {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", id);
        localStorage.setItem("role", normalizedRole);
        if (department) localStorage.setItem("department", department);
      } else {
        await SecureStore.setItemAsync("token", token);
        await SecureStore.setItemAsync("userId", id);
        await SecureStore.setItemAsync("role", normalizedRole);
        if (department) await SecureStore.setItemAsync("department", department);
      }
    } catch (error) {
      console.error("Error saving credentials:", error);
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
          "http://172.20.10.5:8080/api/user/login",
          { email, password },
          {
            timeout: 10000,
            validateStatus: (status) => status < 500 // Accept all status codes below 500
          }
      );

      console.log("Login response:", response.data);

      if (response.data?.token) {
        // Validate response data
        if (!response.data.id) {
          throw new Error("Server response missing user ID");
        }

        await saveCredentials(
            response.data.token,
            String(response.data.id),
            response.data.role || null,
            response.data.department || null
        );

        navigation.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
      } else {
        throw new Error(response.data?.message || "Invalid server response");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        if (error.response) {
          errorMessage = error.response.data?.message ||
              `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = "Network error - no response received";
        } else {
          errorMessage = error.message || "Network error occurred";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFFF" />
        </View>
    );
  }

  return (
      <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.background}
          resizeMode="cover"
      >
        <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
            style={styles.gradient}
        >
          <KeyboardAvoidingView
              style={styles.container}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
          >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
              <AnimatedTouchableOpacity
                  style={[styles.backButton, backButtonAnimatedStyle]}
                  onPress={() => navigation.goBack()}
                  onPressIn={() => handlePressIn(backButtonScale)}
                  onPressOut={() => handlePressOut(backButtonScale)}
              >
                <ArrowLeft size={24} color="#00BFFF" />
              </AnimatedTouchableOpacity>

              <Animated.View
                  entering={FadeInDown.delay(300).springify()}
                  style={styles.logoContainer}
              >
                <Image
                    source={require("../assets/images/img.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.companyName}>KROMBERG & SCHUBERT</Text>
              </Animated.View>

              <Animated.View
                  entering={FadeInDown.delay(500).springify()}
                  style={styles.headerContainer}
              >
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
              </Animated.View>

              <View style={styles.formContainer}>
                <Animated.View
                    entering={FadeInUp.delay(700).springify()}
                    style={styles.inputContainer}
                >
                  <Mail size={20} color="#00BFFF" style={styles.inputIcon} />
                  <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#B2CCFF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={setEmail}
                      editable={!isLoading}
                  />
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(900).springify()}
                    style={styles.inputContainer}
                >
                  <Lock size={20} color="#00BFFF" style={styles.inputIcon} />
                  <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#B2CCFF"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      editable={!isLoading}
                  />
                  <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                  >
                    {showPassword ? (
                        <EyeOff size={20} color="#00BFFF" />
                    ) : (
                        <Eye size={20} color="#00BFFF" />
                    )}
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(1100).springify()}>
                  <TouchableOpacity
                      style={styles.forgotPassword}
                      onPress={() => navigation.navigate("RequestResetPassword")}
                      disabled={isLoading}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <AnimatedTouchableOpacity
                      style={[
                        styles.loginButton,
                        (!email || !password || isLoading) && styles.loginButtonDisabled,
                        buttonAnimatedStyle
                      ]}
                      onPress={handleLogin}
                      onPressIn={() => handlePressIn(buttonScale)}
                      onPressOut={() => handlePressOut(buttonScale)}
                      disabled={isLoading || !email || !password}
                  >
                    <LinearGradient
                        colors={['#00BFFF', '#0088cc']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                    >
                      {isLoading ? (
                          <ActivityIndicator color="white" />
                      ) : (
                          <Text style={styles.loginButtonText}>Sign In</Text>
                      )}
                    </LinearGradient>
                  </AnimatedTouchableOpacity>
                </Animated.View>
              </View>

              <Animated.View
                  entering={FadeInUp.delay(1300).springify()}
                  style={styles.footer}
              >
                <Text style={styles.footerText}>© 2025 Kromberg & Schubert</Text>
                <Text style={styles.footerVersion}>Version 1.0.0</Text>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 255, 0.2)',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 16,
  },
  companyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#00BFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 191, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#B2CCFF',
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#00BFFF',
  },
  loginButton: {
    borderRadius: 20,
    height: 60,
    overflow: 'hidden',
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: 'white',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#B2CCFF',
    marginBottom: 4,
  },
  footerVersion: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(178, 204, 255, 0.5)',
  },
});

export default Login;