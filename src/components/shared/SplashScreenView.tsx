import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, StatusBar } from 'react-native';

interface SplashScreenViewProps {
  onFinish: () => void;
}

export function SplashScreenView({ onFinish }: SplashScreenViewProps): React.JSX.Element {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const logoFade = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Subtle entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Smooth exit animation after 800ms hydration
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 850);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, logoFade, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#124734" />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: logoFade,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../android/app/src/main/res/drawable/splash_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Amrutam</Text>
        <Text style={styles.subtitle}>AYURVEDIC HEALTHCARE & WELLNESS</Text>
      </Animated.View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Pure • Authentic • Holistic</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#124734',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 130,
    height: 130,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFDF8',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4AF37',
    letterSpacing: 2.5,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#A8C3B5',
    letterSpacing: 1.2,
  },
});
