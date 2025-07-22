"use client"

import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { COLORS } from "../../constants/Colors"
import { globalAuthToken, useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"


// Screen width can be used for responsive layouts if needed

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { colors, toggleTheme, isDark } = useTheme()
  const router = useRouter()

  // Shared values para animaciones
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)
  const logoScale = useSharedValue(0.8)
  const formTranslateY = useSharedValue(30)

  useEffect(() => {
    // Secuencia de animaciones de entrada
    opacity.value = withTiming(1, { duration: 600 })
    translateY.value = withTiming(0, { duration: 600 })
    logoScale.value = withSpring(1, { damping: 10 })
    formTranslateY.value = withTiming(0, { duration: 600 })

    const timer = setTimeout(() => {
      translateY.value = withSequence(
        withTiming(-10, { duration: 100 }), 
        withSpring(0, { damping: 15 })
      )
    }, 800)

    return () => clearTimeout(timer)
  }, [opacity, translateY, logoScale, formTranslateY])

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña")
      return
    }

    setIsLoading(true)
    console.log('[LOGIN] Intentando login con:', { email, password })
    try {
      const result = await login(email, password)
      console.log('[LOGIN] Resultado de login:', result)
      console.log('[LOGIN] globalAuthToken actual:', globalAuthToken)
      if (result.success) {
        console.log('[LOGIN] Login exitoso, rol:', result.role)
        // Hacer petición inmediata a salones con el token
        if (globalAuthToken) {
          console.log('[LOGIN] Haciendo fetch inmediato a /api/maestro/salones con token:', globalAuthToken)
          fetch("https://756077eced4b.ngrok-free.app/api/maestro/salones", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${globalAuthToken}`,
              Accept: "application/json",
            },
          })
            .then(res => {
              if (!res.ok) throw new Error("Error al obtener laboratorios")
              return res.json()
            })
            .then(data => {
              console.log('[LOGIN] Respuesta de /api/maestro/salones:', data)
            })
            .catch(error => {
              console.error('[LOGIN] Error al obtener salones:', error)
            })
        } else {
          console.warn('[LOGIN] No hay token global para hacer fetch a salones')
        }
        // Navegar a la pantalla correspondiente según el rol
        if (result.role === 'teacher') {
          console.log('[LOGIN] Redirigiendo a /(teacher)')
          router.replace('/(teacher)')
        } else if (result.role === 'admin') {
          console.log('[LOGIN] Redirigiendo a /(admin)')
          router.replace('/(admin)')
        }
      } else {
        console.log('[LOGIN] Credenciales incorrectas')
        Alert.alert("Error", "Credenciales incorrectas. Por favor, inténtalo de nuevo.")
      }
    } catch (err) {
      console.error('[LOGIN] Error en login:', err)
      Alert.alert("Error", "Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (role: "teacher" | "admin") => {
    // Animación sutil al llenar credenciales
    formTranslateY.value = withSequence(withTiming(-5, { duration: 100 }), withTiming(0, { duration: 100 }))

    if (role === "teacher") {
      setEmail("gael@example.com")
      setPassword("123456789")
    } else {
      setEmail("admin@ejemplo.com")
      setPassword("123456789")
    }
  }

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: logoScale.value }, { translateY: translateY.value }],
    }
  })

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: formTranslateY.value }],
    }
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.background]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo y título */}
          <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
            <View style={styles.logoContainer}>
              <Image source={{ uri: "https://1.bp.blogspot.com/-e5_-hSJNA9A/WrlkItaFslI/AAAAAAAAAsw/ZzGMFh1Ycrw_dQMINX37Y-QwNPoe-fLjACLcBGAs/s1600/logo-universidad-de-la-guajira.png" }} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={[styles.appTitle, { color: colors.text }]}>WajiiraLux</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Control Inteligente de Iluminación</Text>
          </Animated.View>

          {/* Formulario */}
          <Animated.View style={[styles.card, formAnimatedStyle]}>
            <Text style={styles.loginTitle}>Iniciar Sesión</Text>
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={24} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={COLORS.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={24} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={COLORS.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={24}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Credenciales de demo */}
          <Animated.View style={[styles.demoSection, formAnimatedStyle]}>
            <Text style={[styles.demoTitle, { color: colors.textSecondary }]}>Credenciales de Prueba:</Text>

            <TouchableOpacity
              style={[styles.demoButton, { backgroundColor: colors.secondary }]}
              onPress={() => fillDemoCredentials("teacher")}
              activeOpacity={0.8}
            >
              <Ionicons name="school-outline" size={20} color="#FFFFFF" />
              <Text style={styles.demoButtonText}>Docente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoButton, { backgroundColor: colors.accent }]}
              onPress={() => fillDemoCredentials("admin")}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
              <Text style={styles.demoButtonText}>Administrador</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    justifyContent: "center",
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  themeToggle: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 8,
    marginRight: -8,
  },
  buttonIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  loginButton: {
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 5,
    shadowColor: "#000",
    elevation: 8,
    height: 66,
    borderRadius: 12,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  demoSection: {
    alignItems: "center",
  },
  demoTitle: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 6,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  demoButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "600",
  },
})
