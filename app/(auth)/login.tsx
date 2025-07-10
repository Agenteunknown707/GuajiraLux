"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { SIZES } from "../../constants/Colors"

const { width, height } = Dimensions.get("window")

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { colors, toggleTheme, isDark } = useTheme()
  const router = useRouter()

  // Animaciones con useRef para evitar recreación
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current
  const formSlideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    // Secuencia de animaciones de entrada optimizada
    const animationSequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(formSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ])

    animationSequence.start()

    // Cleanup
    return () => {
      animationSequence.stop()
    }
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setIsLoading(true)

    try {
      const success = await login(email, password)

      if (success) {
        // Animación de salida exitosa
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          router.replace("/")
        })
      } else {
        Alert.alert("Error", "Credenciales incorrectas")
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error durante el inicio de sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (role: "teacher" | "admin") => {
    // Animación sutil al llenar credenciales
    Animated.sequence([
      Animated.timing(formSlideAnim, {
        toValue: -5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    if (role === "teacher") {
      setEmail("carlos.mendoza@uniguajira.edu.co")
      setPassword("123456")
    } else {
      setEmail("admin@uniguajira.edu.co")
      setPassword("admin123")
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Logo y título */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: logoScaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image source={{ uri: "https://1.bp.blogspot.com/-e5_-hSJNA9A/WrlkItaFslI/AAAAAAAAAsw/ZzGMFh1Ycrw_dQMINX37Y-QwNPoe-fLjACLcBGAs/s1600/logo-universidad-de-la-guajira.png" }} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={[styles.appTitle, { color: colors.text }]}>WajiiraLux</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Control Inteligente de Iluminación</Text>
        </Animated.View>

        {/* Formulario */}
        <Animated.View
          style={[
            styles.formSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: formSlideAnim }],
            },
          ]}
        >
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Contraseña"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>{isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Credenciales de demo */}
        <Animated.View
          style={[
            styles.demoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: formSlideAnim }],
            },
          ]}
        >
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
  )
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SIZES.padding,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  themeToggle: {
    padding: 8,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    marginLeft: 15,
    elevation: 8,
  },
  logo: {
    width: 200,
    height: 120,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  formSection: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  loginButton: {
    borderRadius: SIZES.borderRadius,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  demoSection: {
    alignItems: "center",
  },
  demoTitle: {
    fontSize: 14,
    marginBottom: 20,
    fontWeight: "500",
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: SIZES.borderRadius,
    marginBottom: 12,
    minWidth: 180,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  demoButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "600",
  },
} )
