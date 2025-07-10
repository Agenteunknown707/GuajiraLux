"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, StyleSheet } from "react-native"
import Slider from "@react-native-community/slider"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useLab } from "../../../context/LabContext"
import { useTheme } from "../../../context/ThemeContext"
import { RGB_COLORS } from "../../../constants/Data"
import { SIZES } from "../../../constants/Colors"

export default function LabControlScreen() {
  const { labId } = useLocalSearchParams<{ labId: string }>()
  const { labs, updateLight, deactivateLab, practices } = useLab()
  const { colors } = useTheme()
  const router = useRouter()

  const [selectedLight, setSelectedLight] = useState<any>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showPracticeSelector, setShowPracticeSelector] = useState(false)

  const lab = labs.find((l) => l.id === labId)

  useEffect(() => {
    if (!lab) {
      router.back()
    }
  }, [lab])

  const handleLightToggle = (lightId: string) => {
    const light = lab?.lights.find((l) => l.id === lightId)
    if (light && labId) {
      updateLight(labId, lightId, { isOn: !light.isOn })
    }
  }

  const handleColorChange = (color: string) => {
    if (selectedLight && labId) {
      updateLight(labId, selectedLight.id, { color })
      setShowColorPicker(false)
      setSelectedLight(null)
    }
  }

  const handleIntensityChange = (lightId: string, intensity: number) => {
    if (labId) {
      updateLight(labId, lightId, { intensity })
    }
  }

  const handlePracticeSelect = (practice: any) => {
    // Aplicar configuración de práctica a todos los focos
    if (labId) {
      lab?.lights.forEach((light) => {
        updateLight(labId, light.id, {
          isOn: true,
          color: practice.color,
          intensity: practice.intensity,
        })
      })
    }
    setShowPracticeSelector(false)
  }

  const handleDeactivateLab = () => {
    Alert.alert("Desactivar Laboratorio", "¿Estás seguro? Esto apagará todos los focos y liberará el laboratorio.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desactivar",
        onPress: () => {
          if (labId) {
            deactivateLab(labId)
          }
          router.back()
        },
      },
    ])
  }

  const toggleAllLights = () => {
    if (!labId) return
    const allOn = lab?.lights.every((light) => light.isOn)
    lab?.lights.forEach((light) => {
      updateLight(labId, light.id, { isOn: !allOn })
    })
  }

  if (!lab) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Laboratorio no encontrado</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header de control */}
      <View style={[styles.controlHeader, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.labTitle, { color: colors.text }]}>{lab.name}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.primary }]}
            onPress={toggleAllLights}
          >
            <Ionicons name="bulb" size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Todo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.accent }]}
            onPress={() => setShowPracticeSelector(true)}
          >
            <Ionicons name="flask" size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Práctica</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.error }]}
            onPress={handleDeactivateLab}
          >
            <Ionicons name="power" size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Grid de focos */}
        <View style={styles.lightsGrid}>
          {lab.lights.map((light) => (
            <View key={light.id} style={[styles.lightCard, { backgroundColor: colors.surface }]}>
              <View style={styles.lightHeader}>
                <Text style={[styles.lightName, { color: colors.text }]}>{light.name}</Text>
                <TouchableOpacity
                  style={[styles.powerButton, { backgroundColor: light.isOn ? colors.success : colors.textSecondary }]}
                  onPress={() => handleLightToggle(light.id)}
                >
                  <Ionicons name={light.isOn ? "bulb" : "bulb-outline"} size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {light.isOn && (
                <>
                  {/* Selector de color */}
                  <TouchableOpacity
                    style={[styles.colorPreview, { backgroundColor: light.color }]}
                    onPress={() => {
                      setSelectedLight(light)
                      setShowColorPicker(true)
                    }}
                  >
                    <Text style={styles.colorText}>Color</Text>
                  </TouchableOpacity>

                  {/* Control de intensidad */}
                  <View style={styles.intensityControl}>
                    <Text style={[styles.intensityLabel, { color: colors.textSecondary }]}>
                      Intensidad: {light.intensity}%
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={100}
                      value={light.intensity}
                      onValueChange={(value) => handleIntensityChange(light.id, Math.round(value))}
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.border}
                    />
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal selector de color */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Color</Text>

            <View style={styles.colorGrid}>
              {RGB_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[styles.colorOption, { backgroundColor: color.value }]}
                  onPress={() => handleColorChange(color.value)}
                >
                  <Text style={styles.colorName}>{color.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.textSecondary }]}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal selector de práctica */}
      <Modal
        visible={showPracticeSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPracticeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Práctica</Text>

            <ScrollView style={styles.practicesList}>
              {practices.map((practice) => (
                <TouchableOpacity
                  key={practice.id}
                  style={[styles.practiceOption, { backgroundColor: colors.background }]}
                  onPress={() => handlePracticeSelect(practice)}
                >
                  <View style={styles.practiceInfo}>
                    <Text style={[styles.practiceName, { color: colors.text }]}>{practice.name}</Text>
                    <Text style={[styles.practiceDescription, { color: colors.textSecondary }]}>
                      {practice.description}
                    </Text>
                  </View>
                  <View style={styles.practiceSettings}>
                    <View style={[styles.practiceColor, { backgroundColor: practice.color }]} />
                    <Text style={[styles.practiceIntensity, { color: colors.textSecondary }]}>
                      {practice.intensity}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.textSecondary }]}
              onPress={() => setShowPracticeSelector(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlHeader: {
    paddingTop: 50,
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  labTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.borderRadius,
  },
  controlButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  lightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  lightCard: {
    width: "48%",
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  lightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  lightName: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
  },
  powerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  colorPreview: {
    height: 40,
    borderRadius: SIZES.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  colorText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  intensityControl: {
    marginTop: 8,
  },
  intensityLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  colorOption: {
    width: "30%",
    height: 60,
    borderRadius: SIZES.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  colorName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  practicesList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  practiceOption: {
    flexDirection: "row",
    padding: 12,
    borderRadius: SIZES.borderRadius,
    marginBottom: 8,
  },
  practiceInfo: {
    flex: 1,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  practiceDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  practiceSettings: {
    alignItems: "center",
  },
  practiceColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  practiceIntensity: {
    fontSize: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
})
