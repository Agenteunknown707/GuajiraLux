"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, Dimensions, StyleSheet, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import { useLab } from "../../context/LabContext"
import { useTheme } from "../../context/ThemeContext"
import { LabSelectionModal } from "../../components/LabSelectionModal"
import { ColorWheelPicker } from "../../components/ColorWheelPicker"
import { AnimatedButton } from "../../components/AnimatedButton"
import { SIZES, FONTS, SHADOWS } from "../../constants/Colors"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from "react-native-reanimated"

const { width } = Dimensions.get("window")

interface HSVColor {
  hue: number
  saturation: number
  value: number
}

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
  const [showLightColorPicker, setShowLightColorPicker] = useState<string | null>(null)

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

  const handleGlobalColorChange = (color: string, hsv: HSVColor) => {
    setSelectedColor(color)
    console.log("Global Color HSV:", hsv)
  }

  const handleGlobalIntensityChange = (intensity: number, hsv: HSVColor) => {
    setGlobalIntensity(intensity)
    console.log("Global Intensity HSV:", hsv)
  }

  const handleApplyGlobalSettings = () => {
    if (!currentLab || !selectedLabId) return
    applyGlobalSettings(selectedLabId, selectedColor, globalIntensity)
    Alert.alert("Éxito", "Configuración aplicada a todos los focos activos")
  }

  const handleLightToggle = (lightId: string) => {
    if (!selectedLabId) return
    const light = currentLab?.lights.find((l) => l.id === lightId)
    if (light) {
      updateLight(selectedLabId, lightId, { isOn: !light.isOn })
    }
  }

  const handleLightColorChange = (lightId: string, color: string, hsv: HSVColor) => {
    if (!selectedLabId) return
    updateLight(selectedLabId, lightId, { color })
    console.log(`Light ${lightId} HSV:`, hsv)
  }

  const handleLightIntensityChange = (lightId: string, intensity: number, hsv: HSVColor) => {
    if (!selectedLabId) return
    updateLight(selectedLabId, lightId, { intensity })
    console.log(`Light ${lightId} Intensity HSV:`, hsv)
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
      <Animated.View style={[styles.header, { backgroundColor: colors.primaryDark }, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <Image source={require("../../assets/images/logoUniGuajira.png")} style={styles.logo} resizeMode="contain" />
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
            <TouchableOpacity style={styles.exitButton} onPress={handleExitLab}>
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

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

          {/* Botones de Control */}
          <View style={styles.controlRow}>
            <AnimatedButton
              title={currentLab?.lights.every((light) => light.isOn) ? "Apagar Todo" : "Encender Todo"}
              onPress={handleToggleAllLights}
              variant="secondary"
              size="medium"
              style={styles.controlButton}
            />
            <AnimatedButton
              title="Aplicar Configuración"
              onPress={handleApplyGlobalSettings}
              variant="primary"
              size="small"
              style={styles.controlButton}
            />
          </View>

          {/* Selector de Color Global Grande */}
          <View style={styles.globalColorSection}>
            <ColorWheelPicker
              selectedColor={selectedColor}
              intensity={globalIntensity}
              onColorChange={handleGlobalColorChange}
              onIntensityChange={handleGlobalIntensityChange}
              size={Math.min(width * 0.9, 220)}
              showHSVValues={true}
            />
          </View>
        </Animated.View>

        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}></ScrollView>
        
        {/* Lights Grid */}
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
                    <TouchableOpacity
                      style={[styles.colorPreview, { backgroundColor: light.color }, SHADOWS.small]}
                      onPress={() => setShowLightColorPicker(light.id)}
                    >
                      <Text style={styles.colorPreviewText}>Cambiar Color</Text>
                      <Ionicons name="color-palette-outline" size={16} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Intensity Display */}
                    <View style={styles.lightIntensityDisplay}>
                      <Text style={[styles.intensityLabel, { color: colors.textSecondary }]}>
                        Intensidad: {light.intensity}%
                      </Text>
                      <View style={[styles.intensityBar, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.intensityFill,
                            { backgroundColor: colors.primary, width: `${light.intensity}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </>
                )}
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal para selector de color individual */}
      <Modal
        visible={!!showLightColorPicker}
        animationType="slide"
        presentationStyle="formSheet"
        transparent={true}
        onRequestClose={() => setShowLightColorPicker(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowLightColorPicker(null)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {showLightColorPicker && currentLab?.lights.find((l) => l.id === showLightColorPicker)?.name}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          
          {showLightColorPicker && (
            <ColorWheelPicker
              selectedColor={currentLab?.lights.find((l) => l.id === showLightColorPicker)?.color || "#FFFFFF"}
              intensity={currentLab?.lights.find((l) => l.id === showLightColorPicker)?.intensity || 100}
              onColorChange={(color, hsv) => handleLightColorChange(showLightColorPicker, color, hsv)}
              onIntensityChange={(intensity, hsv) => handleLightIntensityChange(showLightColorPicker, intensity, hsv)}
              size={Math.min(width * 0.7, 250)}
              showHSVValues={true}
            />
          )}
        </View>
      </Modal>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: SIZES.lg,
    justifyContent: "space-between" as const,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.sm,
    justifyContent: "space-between" as const,
  },
  logo: {
    width: 80,
    height: 60,
    marginRight: SIZES.md,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: SIZES.borderRadiusSmall,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: FONTS.size.md,
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
    marginTop: SIZES.lg,
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
  content: {
    flex: 1,
  },
  globalControls: {
    margin: SIZES.md,
    padding: SIZES.lg,
    borderRadius: SIZES.borderRadius,
    alignItems: "center" as const,
  },
  controlHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.lg,
    width: "100%",
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
  globalColorSection: {
    alignItems: "center" as const,
    marginBottom: SIZES.xl,
  },
  controlRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    width: "100%",
    gap: SIZES.md,
  },
  controlButton: {
    flex: 1,
  },
  lightsSection: {
    padding: SIZES.lg,
  },
  lightsGrid: {
    flexDirection: "column" as const,
  },
  lightCard: {
    width: "100%",
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  lightHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: SIZES.lg,
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
    height: 40,
    borderRadius: SIZES.borderRadiusSmall,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.sm,
    flexDirection: "row" as const,
  },
  colorPreviewText: {
    color: "#FFFFFF",
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold as any,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginRight: SIZES.xs,
  },
  lightIntensityDisplay: {
    marginTop: SIZES.sm,
  },
  intensityLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.xs,
  },
  intensityBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  intensityFill: {
    height: "100%",
    borderRadius: 3,
  },
  exitButton: {
    position: "absolute",
    top: SIZES.sm,
    right: SIZES.sm,
    padding: SIZES.sm,
    borderRadius: SIZES.borderRadiusSmall,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    marginTop: -SIZES.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: SIZES.lg,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: SIZES.lg,
    alignItems: "center" as const,
  },
})
