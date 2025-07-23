/**
 * Proyecto: WajiraLux - Sistema de iluminación inteligente para laboratorios universitarios
 * Autores:
 *  - Jocelin Esmeralda Martinez Mejia
 *  - Carlos Roberto Rosales Sanchez
 *  - Galilea Estrella Serrano Ruiz
 * Institución:
 *  - Instituto Tecnológico Nacional de México - Campus Colima
 * En colaboración con:
 *  - Universidad de La Guajira (Riohacha, Colombia)
 * Año: 2025
 * Licencia: MIT
 */
"use client"

import { useEffect, useRef } from "react"
import { View, Text, ActivityIndicator, Animated, Image, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { SIZES } from "../constants/Colors"

export default function Index() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const logoRotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Animación de entrada
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ),
    ]).start()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Pequeño delay para mostrar la animación
      const timer = setTimeout(() => {
        if (!user) {
          router.replace("/(auth)/login")
        } else if (user.role === "admin") {
          router.replace("/(admin)")
        } else if (user.role === "teacher") {
          router.replace("/(teacher)")
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [user, isLoading, router])

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFFF" }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
          <Image source={{ uri: "https://1.bp.blogspot.com/-e5_-hSJNA9A/WrlkItaFslI/AAAAAAAAAsw/ZzGMFh1Ycrw_dQMINX37Y-QwNPoe-fLjACLcBGAs/s1600/logo-universidad-de-la-guajira.png" }} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appTitle}>WajiiraLux</Text>
        <Text style={styles.subtitle}>Control Inteligente de Iluminación</Text>
      </Animated.View>

      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="large" color= "00BFD8" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 120,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.8)",
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    color: "#000000",
    marginTop: 16,
    fontSize: 16,
  },
})
