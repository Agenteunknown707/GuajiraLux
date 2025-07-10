"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated, Image, Dimensions, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import { useLab } from "../../context/LabContext"
import { useTheme } from "../../context/ThemeContext"
import { LabSelectionModal } from "../../components/LabSelectionModal"
import { AnimatedButton } from "../../components/AnimatedButton"
import { RGB_COLORS } from "../../constants/Data"
import { SIZES, FONTS, SHADOWS } from "../../constants/Colors"
import Slider from "@react-native-community/slider"
import ColorWheelPicker from "../../components/ColorWheelPicker"

const { width } = Dimensions.get("window")

export default function TeacherControlScreen() {
  const { user } = useAuth()
  const { labs, updateLight, activateLab, deactivateLab } = useLab()
  const { colors } = useTheme()

  const [showLabModal, setShowLabModal] = useState(false)
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState("#FFFFFF")
  const [globalIntensity, setGlobalIntensity] = useState(100)

  const fadeAnim = new Animated.Value(0)
  const slideAnim = new Animated.Value(50)

  // Filtrar laboratorios asignados al docente
  const assignedLabs = labs.filter((lab) => user?.assignedLabs?.includes(lab.id))
  const currentLab = selectedLabId ? labs.find((l) => l.id === selectedLabId) : null

  useEffect(() => {
    if (selectedLabId) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
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
          setSelectedLabId(null)
          setShowLabModal(true)
          fadeAnim.setValue(0)
          slideAnim.setValue(50)
        },
      },
    ])
  }

  const toggleAllLights = () => {
    if (!currentLab || !selectedLabId) return

    const allOn = currentLab.lights.every((light) => light.isOn)
    currentLab.lights.forEach((light) => {
      updateLight(selectedLabId, light.id, { isOn: !allOn })
    })
  }

  const applyGlobalSettings = () => {
    if (!currentLab || !selectedLabId) return

    currentLab.lights.forEach((light) => {
      updateLight(selectedLabId, light.id, {
        isOn: true,
        color: selectedColor,
        intensity: globalIntensity,
      })
    })
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
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: colors.primary },
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Image source={{ uri: "https://1.bp.blogspot.com/-e5_-hSJNA9A/WrlkItaFslI/AAAAAAAAAsw/ZzGMFh1Ycrw_dQMINX37Y-QwNPoe-fLjACLcBGAs/s1600/logo-universidad-de-la-guajira.png" }} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{currentLab?.name}</Text>
            <Text style={styles.headerSubtitle}>
              {currentLab?.building} - {currentLab?.room}
            </Text>
          </View>
          <TouchableOpacity style={styles.exitButton} onPress={handleExitLab}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Global Controls */}
      <Animated.View
        style={[
          styles.globalControls,
          { backgroundColor: colors.surface },
          SHADOWS.small,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Control General</Text>

        <View style={styles.controlRow}>
          <AnimatedButton
            title="Encender/Apagar Todo"
            onPress={toggleAllLights}
            variant="secondary"
            size="small"
            style={{ flex: 1, marginRight: SIZES.sm }}
          />
          <AnimatedButton
            title="Aplicar Configuración"
            onPress={applyGlobalSettings}
            size="small"
            style={{ flex: 1, marginLeft: SIZES.sm }}
          />
        </View>

        {/* Color Selector */}
        {/* Color Selector */}
        <View style={styles.colorSection}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Color Global</Text>
          <ColorWheelPicker onColorChange={(color) => setSelectedColor(color)} />
          <Text style={{ textAlign: "center", color: colors.text }}>Color seleccionado: {selectedColor}</Text>
        </View>

        {/* Intensity Slider */}
       <View style={styles.intensitySection}>
        <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
          Intensidad Global: {globalIntensity}%
        </Text>
        <Slider
          value={globalIntensity}
          onValueChange={(value) => setGlobalIntensity(Math.round(value))}
          minimumValue={0}
          maximumValue={100}
          step={1}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#ccc"
          thumbTintColor={colors.primary}
          style={{ width: '100%', height: 40 }}
        />
      </View>
      </Animated.View>

      {/* Lights Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.lightsSection,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Focos Individuales ({currentLab?.lights.filter((l) => l.isOn).length}/{currentLab?.lights.length})
          </Text>

          <View style={styles.lightsGrid}>
            {currentLab?.lights.map((light, index) => (
              <Animated.View
                key={light.id}
                style={[
                  styles.lightCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  SHADOWS.small,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* Light Header */}
                <View style={styles.lightHeader}>
                  <View style={styles.lightInfo}>
                    <Text style={[styles.lightName, { color: colors.text }]}>{light.name}</Text>
                    <Text style={[styles.lightIP, { color: colors.textSecondary }]}>IP: {light.ip}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.powerButton, { backgroundColor: light.isOn ? colors.success : colors.textTertiary }]}
                    onPress={() => handleLightToggle(light.id)}
                  >
                    <Ionicons name={light.isOn ? "bulb" : "bulb-outline"} size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {light.isOn && (
                  <>
                    {/* Color Preview */}
                    <TouchableOpacity style={[styles.colorPreview, { backgroundColor: light.color }]}>
                      <Text style={styles.colorPreviewText}>Color Actual</Text>
                    </TouchableOpacity>

                    {/* Individual Color Picker */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.individualColorPicker}>
                      {RGB_COLORS.slice(0, 6).map((color) => (
                        <TouchableOpacity
                          key={color.value}
                          style={[
                            styles.miniColorOption,
                            { backgroundColor: color.value },
                            light.color === color.value && styles.selectedMiniColor,
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
                          style={styles.miniSliderButton}
                          onPress={() => handleLightIntensityChange(light.id, Math.max(0, light.intensity - 10))}
                        >
                          <Ionicons name="remove" size={12} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <View style={styles.miniSliderTrack}>
                          <View
                            style={[
                              styles.miniSliderFill,
                              { backgroundColor: colors.primary, width: `${light.intensity}%` },
                            ]}
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.miniSliderButton}
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
    width: 80,
    height: 60,
    marginRight: SIZES.md,
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: SIZES.borderRadius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.md,
  },
  controlRow: {
    flexDirection: "row" as const,
    marginBottom: SIZES.lg,
  },
  colorSection: {
    marginBottom: SIZES.lg,
  },
  controlLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.sm,
  },
  colorPicker: {
    flexDirection: "row" as const,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginHorizontal: SIZES.md,
    overflow: "hidden" as const,
  },
  sliderFill: {
    height: "100%",
    borderRadius: 3,
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
    borderWidth: 1,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  colorPreview: {
    height: 32,
    borderRadius: SIZES.borderRadiusSmall,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.sm,
  },
  colorPreviewText: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold as any,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  individualColorPicker: {
    marginBottom: SIZES.sm,
  },
  miniColorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SIZES.xs,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedMiniColor: {
    borderColor: "#000000",
    borderWidth: 2,
  },
  lightIntensity: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  intensityLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium as any,
    minWidth: 30,
  },
  miniSliderContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
    marginLeft: SIZES.sm,
  },
  miniSliderButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  miniSliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginHorizontal: SIZES.xs,
    overflow: "hidden" as const,
  },
  miniSliderFill: {
    height: "100%",
    borderRadius: 2,
  },
})