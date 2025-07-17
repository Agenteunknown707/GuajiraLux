"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, Dimensions, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../../context/AuthContext"
import { useLab } from "../../../context/LabContext"
import { useTheme } from "../../../context/ThemeContext"
import { LabSelectionModal } from "../../../components/LabSelectionModal"
import { AnimatedButton } from "../../../components/AnimatedButton"
import { RGB_COLORS } from "../../../constants/Data"
import { SIZES, FONTS, SHADOWS } from "../../../constants/Colors"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from "react-native-reanimated"

const { width } = Dimensions.get("window")

export default function TeacherControlScreen() {
  const { user } = useAuth()
  const {
    labs,
    practices,
    updateLight,
    activateLab,
    deactivateLab,
    toggleAllLights,
    applyGlobalSettings,
    clearActivePractice,
  } = useLab()
  const { colors } = useTheme()

  const [showLabModal, setShowLabModal] = useState(false)
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState("#FFFFFF")
  const [globalIntensity, setGlobalIntensity] = useState(100)

  // Shared values para animaciones
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)
  const headerTranslateY = useSharedValue(-100)

  // Filtrar laboratorios asignados al docente
  const assignedLabs = labs.filter((lab) => user?.assignedLabs?.includes(lab.id))
  const currentLab = selectedLabId ? labs.find((l) => l.id === selectedLabId) : null

  // Obtener la práctica activa
  const activePractice = currentLab?.activePractice ? practices.find((p) => p.id === currentLab.activePractice) : null

  useEffect(() => {
    if (selectedLabId) {
      // Animaciones de entrada cuando se selecciona un laboratorio
      opacity.value = withTiming(1, { duration: 500 })
      translateY.value = withTiming(0, { duration: 500 })
      headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 })
    }
  }, [selectedLabId])

  useEffect(() => {
    // Solo mostrar el modal si no hay laboratorio seleccionado
    if (!selectedLabId && assignedLabs.length > 0) {
      setShowLabModal(true)
    }
  }, [selectedLabId, assignedLabs])

  const handleLabSelection = (labId: string) => {
    const success = activateLab(labId, user?.id || "")
    if (success) {
      setSelectedLabId(labId)
      setShowLabModal(false)
    } else {
      Alert.alert("Error", "No se pudo activar el laboratorio")
    }
  }

  const handleExitLab = () => {
    Alert.alert("Salir del Laboratorio", "¿Estás seguro? Esto apagará todos los focos y liberará el laboratorio.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        onPress: () => {
          if (selectedLabId) {
            deactivateLab(selectedLabId)
          }
          // Reset animaciones
          opacity.value = 0
          translateY.value = 50
          headerTranslateY.value = -100
          setSelectedLabId(null)
          setShowLabModal(true)
        },
      },
    ])
  }

  const handleToggleAllLights = () => {
    if (!currentLab || !selectedLabId) return
    const allOn = currentLab.lights.every((light) => light.isOn)
    toggleAllLights(selectedLabId, !allOn)
  }

  const handleApplyGlobalSettings = () => {
    if (!currentLab || !selectedLabId) return
    applyGlobalSettings(selectedLabId, selectedColor, globalIntensity)
  }

  const handleLightToggle = (lightId: string) => {
    if (!selectedLabId) return
    const light = currentLab?.lights.find((l) => l.id === lightId)
    if (light) {
      updateLight(selectedLabId, lightId, { isOn: !light.isOn })
    }
  }

  const handleLightColorChange = (lightId: string, color: string) => {
    if (!selectedLabId) return
    updateLight(selectedLabId, lightId, { color })
  }

  const handleLightIntensityChange = (lightId: string, intensity: number) => {
    if (!selectedLabId) return
    updateLight(selectedLabId, lightId, { intensity })
  }

  const handleClearActivePractice = () => {
    if (!selectedLabId) return
    Alert.alert(
      "Limpiar Práctica Activa",
      "¿Deseas limpiar la práctica activa? Esto no afectará la configuración actual de los focos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          onPress: () => {
            clearActivePractice(selectedLabId)
          },
        },
      ],
    )
  }

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
    }
  })

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

  const lightCardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        {
          translateY: interpolate(opacity.value, [0, 1], [30, 0]),
        },
      ],
    }
  })

  if (!selectedLabId) {
    return (
      <LabSelectionModal
        visible={showLabModal}
        labs={assignedLabs}
        onSelectLab={handleLabSelection}
        onClose={() => setShowLabModal(false)}
        currentUserId={user?.id || ""}
      />
    )
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background }, containerAnimatedStyle]}>
      {/* Header */}
      <Animated.View style={[styles.header, { backgroundColor: colors.primary }, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <Image source={{ uri: "/assets/images/uniguajira-logo.png" }} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{currentLab?.name}</Text>
            <Text style={styles.headerSubtitle}>
              {currentLab?.building} - {currentLab?.room}
            </Text>
            {/* Mostrar práctica activa */}
            {activePractice && (
              <View style={styles.activePracticeContainer}>
                <Ionicons name="flask" size={16} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.activePracticeText}>{activePractice.name}</Text>
                <TouchableOpacity onPress={handleClearActivePractice} style={styles.clearPracticeButton}>
                  <Ionicons name="close-circle" size={16} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitLab}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Global Controls */}
      <Animated.View
        style={[styles.globalControls, { backgroundColor: colors.card }, SHADOWS.medium, contentAnimatedStyle]}
      >
        <View style={styles.controlHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Control General</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {currentLab?.lights.filter((l) => l.isOn).length}/{currentLab?.lights.length} activos
            </Text>
          </View>
        </View>

        <View style={styles.controlRow}>
          <AnimatedButton
            title="Encender/Apagar Todo"
            onPress={handleToggleAllLights}
            variant="secondary"
            size="small"
            style={styles.controlButton}
          />
          <AnimatedButton
            title="Aplicar Config."
            onPress={handleApplyGlobalSettings}
            size="small"
            style={[styles.controlButton, { flex: 1, marginLeft: SIZES.sm }]}
          />
        </View>

        {/* Color Selector */}
        <View style={styles.colorSection}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Color Global</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
            {RGB_COLORS.map((color) => (
              <TouchableOpacity
                key={color.value}
                style={[
                  styles.colorOption,
                  { backgroundColor: color.value },
                  selectedColor === color.value && [styles.selectedColorOption, SHADOWS.glow],
                ]}
                onPress={() => setSelectedColor(color.value)}
              >
                {selectedColor === color.value && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Intensity Slider */}
        <View style={styles.intensitySection}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
            Intensidad Global: {globalIntensity}%
          </Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={[styles.sliderButton, { backgroundColor: colors.cardElevated }]}
              onPress={() => setGlobalIntensity(Math.max(0, globalIntensity - 10))}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.sliderFill, { backgroundColor: colors.primary, width: `${globalIntensity}%` }]} />
            </View>
            <TouchableOpacity
              style={[styles.sliderButton, { backgroundColor: colors.cardElevated }]}
              onPress={() => setGlobalIntensity(Math.min(100, globalIntensity + 10))}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Lights Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.lightsSection, contentAnimatedStyle]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Focos Individuales</Text>

          <View style={styles.lightsGrid}>
            {currentLab?.lights.map((light, index) => (
              <Animated.View
                key={light.id}
                style={[
                  styles.lightCard,
                  { backgroundColor: colors.card, borderColor: light.isOn ? colors.primary : colors.border },
                  light.isOn ? SHADOWS.glow : SHADOWS.small,
                  lightCardAnimatedStyle,
                ]}
              >
                {/* Light Header */}
                <View style={styles.lightHeader}>
                  <View style={styles.lightInfo}>
                    <Text style={[styles.lightName, { color: colors.text }]}>{light.name}</Text>
                    <Text style={[styles.lightIP, { color: colors.textSecondary }]}>IP: {light.ip}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.powerButton,
                      { backgroundColor: light.isOn ? colors.success : colors.textTertiary },
                      light.isOn && SHADOWS.glow,
                    ]}
                    onPress={() => handleLightToggle(light.id)}
                  >
                    <Ionicons name={light.isOn ? "bulb" : "bulb-outline"} size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {light.isOn && (
                  <>
                    {/* Color Preview */}
                    <View style={[styles.colorPreview, { backgroundColor: light.color }, SHADOWS.small]}>
                      <Text style={styles.colorPreviewText}>Color Actual</Text>
                    </View>

                    {/* Individual Color Picker */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.individualColorPicker}>
                      {RGB_COLORS.slice(0, 6).map((color) => (
                        <TouchableOpacity
                          key={color.value}
                          style={[
                            styles.miniColorOption,
                            { backgroundColor: color.value },
                            light.color === color.value && [styles.selectedMiniColor, SHADOWS.small],
                          ]}
                          onPress={() => handleLightColorChange(light.id, color.value)}
                        />
                      ))}
                    </ScrollView>

                    {/* Individual Intensity */}
                    <View style={styles.lightIntensity}>
                      <Text style={[styles.intensityLabel, { color: colors.textSecondary }]}>{light.intensity}%</Text>
                      <View style={styles.miniSliderContainer}>
                        <TouchableOpacity
                          style={[styles.miniSliderButton, { backgroundColor: colors.cardElevated }]}
                          onPress={() => handleLightIntensityChange(light.id, Math.max(0, light.intensity - 10))}
                        >
                          <Ionicons name="remove" size={12} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <View style={[styles.miniSliderTrack, { backgroundColor: colors.border }]}>
                          <View
                            style={[
                              styles.miniSliderFill,
                              { backgroundColor: colors.primary, width: `${light.intensity}%` },
                            ]}
                          />
                        </View>
                        <TouchableOpacity
                          style={[styles.miniSliderButton, { backgroundColor: colors.cardElevated }]}
                          onPress={() => handleLightIntensityChange(light.id, Math.min(100, light.intensity + 10))}
                        >
                          <Ionicons name="add" size={12} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SIZES.lg,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.sm,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: SIZES.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: FONTS.size.sm,
    marginTop: 2,
  },
  activePracticeContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: SIZES.xs,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadiusSmall,
  },
  activePracticeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
    marginLeft: SIZES.xs,
    flex: 1,
  },
  clearPracticeButton: {
    marginLeft: SIZES.xs,
  },
  exitButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  globalControls: {
    margin: SIZES.lg,
    padding: SIZES.lg,
    borderRadius: SIZES.borderRadius,
  },
  controlHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
  },
  statusIndicator: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.xs,
  },
  statusText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
  },
  controlRow: {
    flexDirection: "row" as const,
    marginBottom: SIZES.lg,
  },
  controlButton: {
    borderRadius: SIZES.borderRadiusSmall,
  },
  controlLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.sm,
  },
  colorSection: {
    marginBottom: SIZES.lg,
  },
  colorPicker: {
    flexDirection: "row" as const,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SIZES.sm,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
  intensitySection: {
    marginBottom: SIZES.sm,
  },
  sliderContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: SIZES.md,
    overflow: "hidden" as const,
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  lightsSection: {
    padding: SIZES.lg,
  },
  lightsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between",
  },
  lightCard: {
    width: (width - SIZES.lg * 3) / 2,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  lightHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: SIZES.md,
  },
  lightInfo: {
    flex: 1,
  },
  lightName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: 2,
  },
  lightIP: {
    fontSize: FONTS.size.xs,
  },
  powerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  colorPreview: {
    height: 36,
    borderRadius: SIZES.borderRadiusSmall,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.sm,
  },
  colorPreviewText: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold as any,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  individualColorPicker: {
    marginBottom: SIZES.sm,
  },
  miniColorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: SIZES.xs,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedMiniColor: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
  lightIntensity: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  intensityLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium as any,
    minWidth: 35,
  },
  miniSliderContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
    marginLeft: SIZES.sm,
  },
  miniSliderButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  miniSliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: SIZES.xs,
    overflow: "hidden" as const,
  },
  miniSliderFill: {
    height: "100%",
    borderRadius: 3,
  },
})
