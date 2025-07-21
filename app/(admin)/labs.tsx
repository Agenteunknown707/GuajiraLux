"use client"

import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert, Dimensions, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useLab } from "../../context/LabContext"
import { ColorWheelPicker } from "../../components/ColorWheelPicker"
import { SIZES, FONTS, SHADOWS } from "../../constants/Colors"
import { AnimatedButton } from "../../components/AnimatedButton"

const { width } = Dimensions.get("window")

interface HSVColor {
  hue: number
  saturation: number
  value: number
}

interface Light {
  id: string
  name: string
  position: { x: number; y: number }
  isOn: boolean
  color: string
  intensity: number
}

interface Lab {
  id: string
  name: string
  capacity: number
  isActive: boolean
  activeTeacher: string | null
  lights: Light[]
}

export default function LabsScreen() {
  const { colors } = useTheme()
  const { labs, updateLab, updateLight, toggleAllLights, applyGlobalSettings } = useLab()
  const [showModal, setShowModal] = useState(false)
  const [showControlModal, setShowControlModal] = useState(false)
  const [selectedLabForControl, setSelectedLabForControl] = useState<Lab | null>(null)
  const [editingLab, setEditingLab] = useState<Lab | null>(null)
  const [formData, setFormData] = useState<Partial<Lab>>({})
  const [lights, setLights] = useState<Light[]>([])
  const [selectedColor, setSelectedColor] = useState("#FFFFFF")
  const [globalIntensity, setGlobalIntensity] = useState(100)
  const [showLightColorPicker, setShowLightColorPicker] = useState<string | null>(null)

  React.useEffect(() => {}, [])

  const openModal = (lab?: Lab) => {
    if (lab) {
      setEditingLab(lab)
      setFormData(lab)
      setLights([...lab.lights])
    } else {
      setEditingLab(null)
      setFormData({
        name: "",
        capacity: 20,
      })
      setLights([])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    // Limpiar estados después de un pequeño delay para evitar pantalla en blanco
    setTimeout(() => {
      setEditingLab(null)
      setFormData({})
      setLights([])
    }, 100)
  }

  const openControlModal = (lab: Lab) => {
    setSelectedLabForControl(lab)
    setShowControlModal(true)
  }

  const closeControlModal = () => {
    setShowControlModal(false)
    // Limpiar estados después de un pequeño delay para evitar pantalla en blanco
    setTimeout(() => {
      setSelectedLabForControl(null)
      setShowLightColorPicker(null)
      setSelectedColor("#FFFFFF")
      setGlobalIntensity(100)
    }, 100)
  }

  const addLight = () => {
    const newLight: Light = {
      id: `light_${Date.now()}`,
      name: `Foco ${lights.length + 1}`,
      position: { x: 1, y: 1 },
      isOn: false,
      color: "#FFFFFF",
      intensity: 100,
    }
    setLights([...lights, newLight])
  }

  const removeLight = (lightId: string) => {
    setLights(lights.filter((l) => l.id !== lightId))
  }

  const updateLightData = (lightId: string, updates: Partial<Light>) => {
    setLights(lights.map((l) => (l.id === lightId ? { ...l, ...updates } : l)))
  }

  const handleSave = () => {
    if (!formData.name) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }

    const labData: Lab = {
      id: editingLab?.id || `lab_${Date.now()}`,
      name: formData.name!,
      capacity: formData.capacity || 20,
      isActive: editingLab?.isActive || false,
      activeTeacher: editingLab?.activeTeacher || null,
      lights: lights,
    }

    if (editingLab) {
      updateLab(editingLab.id, labData)
    }

    closeModal()
    Alert.alert("Éxito", `Laboratorio ${editingLab ? "actualizado" : "creado"} correctamente`)
  }

  const handleDelete = (labId: string) => {
    Alert.alert("Confirmar eliminación", "¿Estás seguro de que deseas eliminar este laboratorio?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          Alert.alert("Éxito", "Laboratorio eliminado correctamente")
        },
      },
    ])
  }

  // Funciones de control para el modal de control
  const handleToggleAllLights = () => {
    if (!selectedLabForControl) return

    // Obtener el laboratorio actualizado
    const currentLab = labs.find((l) => l.id === selectedLabForControl.id)
    if (!currentLab) return

    const allOn = currentLab.lights.every((light) => light.isOn)
    const someOn = currentLab.lights.some((light) => light.isOn)

    // Si todos están encendidos, apagar todos
    // Si algunos están encendidos o todos apagados, encender todos
    const newState = !allOn

    toggleAllLights(selectedLabForControl.id, newState)

    Alert.alert("Éxito", `Todos los focos ${newState ? "encendidos" : "apagados"}`)
  }

  const handleGlobalColorChange = (color: string, hsv: HSVColor) => {
    setSelectedColor(color)
    console.log("Admin Global Color HSV:", hsv)
  }

  const handleGlobalIntensityChange = (intensity: number, hsv: HSVColor) => {
    setGlobalIntensity(intensity)
    console.log("Admin Global Intensity HSV:", hsv)
  }

  const handleApplyGlobalSettings = () => {
    if (!selectedLabForControl) return
    applyGlobalSettings(selectedLabForControl.id, selectedColor, globalIntensity)
    Alert.alert("Éxito", "Configuración global aplicada a todos los focos activos")
  }

  const handleLightToggle = (lightId: string) => {
    if (!selectedLabForControl) return

    // Obtener el laboratorio actualizado
    const currentLab = labs.find((l) => l.id === selectedLabForControl.id)
    if (!currentLab) return

    const light = currentLab.lights.find((l) => l.id === lightId)
    if (light) {
      const newState = !light.isOn
      updateLight(selectedLabForControl.id, lightId, { isOn: newState })
      Alert.alert("Éxito", `Foco ${light.name} ${newState ? "encendido" : "apagado"}`)
    }
  }

  const handleLightColorChange = (lightId: string, color: string, hsv: HSVColor) => {
    if (!selectedLabForControl) return
    updateLight(selectedLabForControl.id, lightId, { color })
    console.log(`Admin Light ${lightId} Color HSV:`, hsv)
  }

  const handleLightIntensityChange = (lightId: string, intensity: number, hsv: HSVColor) => {
    if (!selectedLabForControl) return
    updateLight(selectedLabForControl.id, lightId, { intensity })
    console.log(`Admin Light ${lightId} Intensity HSV:`, hsv)
  }

  // Obtener el laboratorio actualizado para el modal de control
  const currentControlLab = selectedLabForControl ? labs.find((l) => l.id === selectedLabForControl.id) : null

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Gestión de Laboratorios</Text>
            <Text style={styles.headerSubtitle}>
              {labs.length} laboratorio{labs.length !== 1 ? "s" : ""} registrado{labs.length !== 1 ? "s" : ""}
            </Text>
          </View>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        </View>
      </View>

      {/* Labs List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {labs.map((lab) => (
          <View
            key={lab.id}
            style={[styles.labCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.small]}
          >
            <TouchableOpacity onPress={() => openControlModal(lab)} style={styles.labCardTouchable}>
              <View style={styles.labHeader}>
                <View style={styles.labInfo}>
                  <Text style={[styles.labName, { color: colors.text }]}>{lab.name}</Text>
                  <Text style={[styles.labDescription, { color: colors.textSecondary }]}>{lab.description}</Text>
                  <Text style={[styles.labLocation, { color: colors.textSecondary }]}>
                    {lab.building} - {lab.room}
                  </Text>
                </View>
                <View style={styles.labActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.info }]}
                    onPress={(e) => {
                      e.stopPropagation()
                      openModal(lab)
                    }}
                  >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error }]}
                    onPress={(e) => {
                      e.stopPropagation()
                      handleDelete(lab.id)
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.labDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    Capacidad: {lab.capacity} estudiantes
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {lab.lights.length} focos RGB configurados
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons
                    name={lab.isActive ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={lab.isActive ? colors.success : colors.textSecondary}
                  />
                  <Text style={[styles.detailText, { color: lab.isActive ? colors.success : colors.textSecondary }]}>
                    {lab.isActive ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>

              {lab.lights.length > 0 && (
                <View style={styles.lightsSection}>
                  <Text style={[styles.lightsTitle, { color: colors.text }]}>Focos configurados:</Text>
                  <View style={styles.lightsList}>
                    {lab.lights.slice(0, 3).map((light) => (
                      <View key={light.id} style={[styles.lightChip, { backgroundColor: colors.primary }]}>
                        <Text style={styles.lightChipText}>{light.name}</Text>
                      </View>
                    ))}
                    {lab.lights.length > 3 && (
                      <View style={[styles.lightChip, { backgroundColor: colors.textTertiary }]}>
                        <Text style={styles.lightChipText}>+{lab.lights.length - 3} más</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {labs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay laboratorios registrados</Text>
            <AnimatedButton
              title="Crear primer laboratorio"
              onPress={() => openModal()}
              style={{ marginTop: SIZES.lg }}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Edición/Creación */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        statusBarTranslucent={false}
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingLab ? "Editar Laboratorio" : "Nuevo Laboratorio"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Basic Info */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Básica</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.name}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                  placeholder="Ej: Laboratorio de Física I"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Capacidad</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.capacity?.toString()}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, capacity: Number.parseInt(text) || 20 }))}
                  placeholder="20"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Lights Configuration */}
            <View style={styles.formSection}>
              <View style={styles.lightsHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuración de Focos</Text>
                <TouchableOpacity
                  style={[styles.addLightButton, { backgroundColor: colors.secondary }]}
                  onPress={addLight}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addLightText}>Agregar Foco</Text>
                </TouchableOpacity>
              </View>

              {lights.map((light, index) => (
                <View
                  key={light.id}
                  style={[styles.lightConfig, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.lightConfigHeader}>
                    <Text style={[styles.lightConfigTitle, { color: colors.text }]}>Foco {index + 1}</Text>
                    <TouchableOpacity
                      style={[styles.removeLightButton, { backgroundColor: colors.error }]}
                      onPress={() => removeLight(light.id)}
                    >
                      <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.lightConfigRow}>
                    <View style={[styles.lightConfigInput, { flex: 2 }]}>
                      <Text style={[styles.lightConfigLabel, { color: colors.textSecondary }]}>Nombre</Text>
                      <TextInput
                        style={[
                          styles.lightInput,
                          { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                        ]}
                        value={light.name}
                        onChangeText={(text) => updateLightData(light.id, { name: text })}
                        placeholder="Nombre del foco"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>

                    <View style={[styles.lightConfigInput, { flex: 1 }]}>
                      <Text style={[styles.lightConfigLabel, { color: colors.textSecondary }]}>IP</Text>
                      <TextInput
                        style={[
                          styles.lightInput,
                          { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                        ]}
                        value={light.id}
                        onChangeText={(text) => updateLightData(light.id, { id: text })}
                        placeholder="jcdjojciwj38832"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  </View>

                  <View style={styles.lightConfigRow}>
                    <View style={styles.lightConfigInput}>
                      <Text style={[styles.lightConfigLabel, { color: colors.textSecondary }]}>Posición X</Text>
                      <TextInput
                        style={[
                          styles.lightInput,
                          { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                        ]}
                        value={light.position.x.toString()}
                        onChangeText={(text) =>
                          updateLightData(light.id, {
                            position: { ...light.position, x: Number.parseFloat(text) || 1 },
                          })
                        }
                        placeholder="1"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.lightConfigInput}>
                      <Text style={[styles.lightConfigLabel, { color: colors.textSecondary }]}>Posición Y</Text>
                      <TextInput
                        style={[
                          styles.lightInput,
                          { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                        ]}
                        value={light.position.y.toString()}
                        onChangeText={(text) =>
                          updateLightData(light.id, {
                            position: { ...light.position, y: Number.parseFloat(text) || 1 },
                          })
                        }
                        placeholder="1"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              ))}

              {lights.length === 0 && (
                <View style={styles.noLightsState}>
                  <Ionicons name="bulb-outline" size={32} color={colors.textTertiary} />
                  <Text style={[styles.noLightsText, { color: colors.textSecondary }]}>No hay focos configurados</Text>
                  <Text style={[styles.noLightsSubtext, { color: colors.textTertiary }]}>
                    Agrega focos para controlar la iluminación
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <AnimatedButton
              title="Cancelar"
              onPress={closeModal}
              variant="outline"
              style={{ flex: 1, marginRight: SIZES.sm }}
            />
            <AnimatedButton
              title={editingLab ? "Actualizar" : "Crear"}
              onPress={handleSave}
              style={{ flex: 1, marginLeft: SIZES.sm }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Control del Laboratorio */}
      <Modal
        visible={showControlModal}
        animationType="slide"
        presentationStyle="formSheet"
        statusBarTranslucent={false}
        onRequestClose={closeControlModal}
      >
        <View style={[styles.controlModalContainer, { backgroundColor: colors.background }]}>
          {/* Header del Modal de Control */}
          <View style={[styles.controlModalHeader, { backgroundColor: colors.primary }]}>
            <View style={styles.controlHeaderContent}>
              <View style={styles.controlHeaderText}>
                <Text style={styles.controlHeaderTitle}>{selectedLabForControl?.name}</Text>
              </View>
              <TouchableOpacity style={styles.closeControlButton} onPress={closeControlModal}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.controlContent} showsVerticalScrollIndicator={false}>
            {/* Control General */}
            <View style={[styles.globalControls, { backgroundColor: colors.card }, SHADOWS.medium]}>
              <View style={styles.controlHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Control General</Text>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                    {currentControlLab?.lights.filter((l) => l.isOn).length}/{currentControlLab?.lights.length} activos
                  </Text>
                </View>
              </View>

              {/* Selector de Color Global Grande */}
              <View style={styles.globalColorSection}>
                <ColorWheelPicker
                  selectedColor={selectedColor}
                  intensity={globalIntensity}
                  onColorChange={handleGlobalColorChange}
                  onIntensityChange={handleGlobalIntensityChange}
                  size={Math.min(width * 0.6, 220)}
                  showHSVValues={true}
                />
              </View>

              {/* Botones de Control */}
              <View style={styles.controlRow}>
                <AnimatedButton
                  title={currentControlLab?.lights.every((l) => l.isOn) ? "Apagar Todo" : "Encender Todo"}
                  onPress={handleToggleAllLights}
                  variant="secondary"
                  size="small"
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
            </View>

            {/* Focos Individuales */}
            <View style={styles.lightsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Focos Individuales</Text>

              <View style={styles.lightsGrid}>
                {currentControlLab?.lights.map((light) => (
                  <View
                    key={light.id}
                    style={[
                      styles.lightCard,
                      { backgroundColor: colors.card, borderColor: light.isOn ? colors.primary : colors.border },
                      light.isOn ? SHADOWS.glow : SHADOWS.small,
                    ]}
                  >
                    {/* Light Header */}
                    <View style={styles.lightHeader}>
                      <View style={styles.lightInfo}>
                        <Text style={[styles.lightName, { color: colors.text }]}>{light.name}</Text>
                        <Text style={[styles.lightID, { color: colors.textSecondary }]}>ID: {light.id}</Text>
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

                        {/* Individual Intensity Control */}
                        <View style={styles.lightIntensityControl}>
                          <Text style={[styles.intensityLabel, { color: colors.textSecondary }]}>
                            Intensidad: {light.intensity}%
                          </Text>
                          <View style={styles.miniSliderContainer}>
                            <TouchableOpacity
                              style={[styles.miniSliderButton, { backgroundColor: colors.cardElevated }]}
                              onPress={() => {
                                const newIntensity = Math.max(0, light.intensity - 10)
                                handleLightIntensityChange(light.id, newIntensity, {
                                  hue: 0,
                                  saturation: 0,
                                  value: newIntensity,
                                })
                              }}
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
                              onPress={() => {
                                const newIntensity = Math.min(100, light.intensity + 10)
                                handleLightIntensityChange(light.id, newIntensity, {
                                  hue: 0,
                                  saturation: 0,
                                  value: newIntensity,
                                })
                              }}
                            >
                              <Ionicons name="add" size={12} color={colors.textSecondary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Modal para selector de color individual */}
          <Modal
            visible={!!showLightColorPicker}
            animationType="slide"
            presentationStyle="pageSheet"
            statusBarTranslucent={false}
            onRequestClose={() => setShowLightColorPicker(null)}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowLightColorPicker(null)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {showLightColorPicker && currentControlLab?.lights.find((l) => l.id === showLightColorPicker)?.name}
                </Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
                {showLightColorPicker && (
                  <ColorWheelPicker
                    selectedColor={
                      currentControlLab?.lights.find((l) => l.id === showLightColorPicker)?.color || "#FFFFFF"
                    }
                    intensity={currentControlLab?.lights.find((l) => l.id === showLightColorPicker)?.intensity || 100}
                    onColorChange={(color, hsv) => handleLightColorChange(showLightColorPicker, color, hsv)}
                    onIntensityChange={(intensity, hsv) =>
                      handleLightIntensityChange(showLightColorPicker, intensity, hsv)
                    }
                    size={Math.min(width * 0.8, 280)}
                    showHSVValues={true}
                  />
                )}
              </ScrollView>
            </View>
          </Modal>
        </View>
      </Modal>
    </View>
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
    marginBottom: SIZES.md,
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  labCard: {
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    marginBottom: SIZES.md,
  },
  labCardTouchable: {
    padding: SIZES.lg,
  },
  labHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: SIZES.md,
  },
  labInfo: {
    flex: 1,
  },
  labName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: 4,
  },
  labDescription: {
    fontSize: FONTS.size.sm,
    marginBottom: 4,
  },
  labLocation: {
    fontSize: FONTS.size.sm,
  },
  labActions: {
    flexDirection: "row" as const,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginLeft: SIZES.xs,
  },
  labDetails: {
    marginBottom: SIZES.md,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.xs,
  },
  detailText: {
    fontSize: FONTS.size.sm,
    marginLeft: SIZES.sm,
  },
  lightsSection: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: SIZES.md,
    padding: SIZES.lg,
  },
  lightsTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.sm,
  },
  lightsList: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  lightChip: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadiusSmall,
    marginRight: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  lightChipText: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium as any,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: SIZES.xxxl * 2,
  },
  emptyText: {
    fontSize: FONTS.size.lg,
    textAlign: "center" as const,
    marginTop: SIZES.lg,
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
    padding: SIZES.lg,
  },
  modalContentContainer: {
    padding: SIZES.lg,
    alignItems: "center" as const,
  },
  formSection: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.lg,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
  },
  inputLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: FONTS.size.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top" as const,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    paddingVertical: SIZES.sm,
  },
  pickerOption: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.borderRadiusSmall,
    marginHorizontal: SIZES.xs,
  },
  pickerOptionText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
  },
  lightsHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.lg,
  },
  addLightButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.borderRadius,
  },
  addLightText: {
    color: "#FFFFFF",
    marginLeft: SIZES.xs,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
  },
  lightConfig: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  lightConfigHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.md,
  },
  lightConfigTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold as any,
  },
  removeLightButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  lightConfigRow: {
    flexDirection: "row" as const,
    marginBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  lightConfigInput: {
    flex: 1,
  },
  lightConfigLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.xs,
  },
  lightInput: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadiusSmall,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.sm,
    fontSize: FONTS.size.sm,
  },
  noLightsState: {
    alignItems: "center" as const,
    paddingVertical: SIZES.xl,
  },
  noLightsText: {
    fontSize: FONTS.size.md,
    marginTop: SIZES.sm,
    textAlign: "center" as const,
  },
  noLightsSubtext: {
    fontSize: FONTS.size.sm,
    marginTop: SIZES.xs,
    textAlign: "center" as const,
  },
  modalFooter: {
    flexDirection: "row" as const,
    padding: SIZES.lg,
    borderTopWidth: 1,
  },
  // Estilos para el Modal de Control
  controlModalContainer: {
    flex: 1,
  },
  controlModalHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SIZES.lg,
  },
  controlHeaderContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  controlHeaderText: {
    flex: 1,
  },
  controlHeaderTitle: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
  },
  controlHeaderSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: FONTS.size.sm,
    marginTop: 2,
  },
  closeControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  controlContent: {
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
  lightID: {
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
  lightIntensityControl: {
    marginTop: SIZES.sm,
  },
  intensityLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.xs,
  },
  miniSliderContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
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
