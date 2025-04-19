import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "./types";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Activity, ChartBar as BarChart2, Shield } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  withSpring,
  useAnimatedStyle,
  withSequence,
  withDelay,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

type HomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Home"
>;

const { width, height } = Dimensions.get("window");

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const buttonScale = useSharedValue(1);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
      <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.background}
          resizeMode="cover"
      >
        <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
            style={styles.overlay}
        >
          <View style={styles.container}>
            <Animated.View
                entering={FadeInDown.delay(300).springify()}
                style={styles.header}
            >
              <Text style={styles.welcomeText}>ABS</Text>
              <View style={styles.highlightContainer}>
                <Text style={styles.welcomeTextHighlight}>Efficency</Text>
                <View style={styles.underline} />
              </View>
            </Animated.View>

            <View style={styles.contentContainer}>


              <View style={styles.featureContainer}>
                {[
                  {
                    icon: <Activity size={28} color="#00BFFF" />,
                    title: "Real-time Monitoring",
                    description: "Track production metrics and assembly lines with precision",
                    delay: 900,
                  },
                  {
                    icon: <BarChart2 size={28} color="#00BFFF" />,
                    title: "Performance Analytics",
                    description: "Data-driven insights for optimal efficiency",
                    delay: 1100,
                  },
                  {
                    icon: <Shield size={28} color="#00BFFF" />,
                    title: "Quality Assurance",
                    description: "Maintain excellence with automated quality control",
                    delay: 1300,
                  },
                ].map((feature, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInRight.delay(feature.delay).springify()}
                        style={styles.featureItem}
                    >
                      <View style={styles.featureIconContainer}>
                        {feature.icon}
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>{feature.description}</Text>
                      </View>
                    </Animated.View>
                ))}
              </View>

              <AnimatedTouchableOpacity
                  style={[styles.button, buttonAnimatedStyle]}
                  onPress={() => navigation.navigate("Login")}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
              >
                <LinearGradient
                    colors={['#00BFFF', '#0088cc']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <ArrowRight size={20} color="#fff" style={styles.buttonIcon} />
                </LinearGradient>
              </AnimatedTouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 52,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  highlightContainer: {
    position: 'relative',
  },
  welcomeTextHighlight: {
    fontSize: 52,
    fontFamily: 'Inter-Bold',
    color: '#00BFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 191, 255, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  underline: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: '60%',
    height: 4,
    backgroundColor: '#00BFFF',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: 'Inter-Regular',
    color: '#E0E7FF',
    lineHeight: 32,
    marginBottom: 40,
    width: '95%',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureContainer: {
    marginBottom: 48,
  },
  featureItem: {
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 255, 0.2)',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#B2CCFF',
    lineHeight: 22,
  },
  button: {
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});