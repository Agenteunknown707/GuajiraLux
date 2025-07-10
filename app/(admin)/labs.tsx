"use client"

import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert, Animated, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useLab } from "../../context/LabContext"
import { BUILDINGS } from "../../constants/Data"
import { SIZES, FONTS, SHADOWS } from "../../constants/Colors"
import { AnimatedButton } from "../../components/AnimatedButton"

interface Light {
  id: string
  name: string
  ip: string
  position: { x: number; y: number }
  isOn: boolean
  color: string
  intensity: number
}

interface Lab {
  id: string
  name: string
  description: string
  building: string
  room: string // Added 'room' property to the Lab interface
  capacity: number
  isActive: boolean
  activeTeacher: string | null
  lights: Light[]
}

export default function LabsScreen() {
  const { colors } = useTheme()
  const { labs, updateLab } = useLab()
  const [showModal, setShowModal] = useState(false)
  const [editingLab, setEditingLab] = useState<Lab | null>(null)
  const [formData, setFormData] = useState<Partial<Lab>>({})
  const [lights, setLights] = useState<Light[]>([])

  const fadeAnim = new Animated.Value(0)

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const openModal = (lab?: Lab) => {
    if (lab) {
      setEditingLab(lab)
      setFormData(lab)
      setLights([...lab.lights])
    } else {
      setEditingLab(null)
      setFormData({
        name: "",
        description: "",
        building: BUILDINGS[0].name,
        room: "",
        capacity: 20,
      })
      setLights([])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingLab(null)
    setFormData({})
    setLights([])
  }

  const addLight = () => {
    const newLight: Light = {
      id: `light_${Date.now()}`,
      name: `Foco ${lights.length + 1}`,
      ip: `192.168.1.${100 + lights.length + 1}`,
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
    if (!formData.name || !formData.building || !formData.room) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }

    const labData: Lab = {
      id: editingLab?.id || `lab_${Date.now()}`,
      name: formData.name!,
      description: formData.description || "",
      building: formData.building!,
      room: formData.room!,
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

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <Image source={{ uri: "/assets/images/uniguajira-logo.png" }} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Gestión de Laboratorios</Text>
            <Text style={styles.headerSubtitle}>
              {labs.length} laboratorio{labs.length !== 1 ? "s" : ""} registrado{labs.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Labs List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {labs.map((lab) => (
          <Animated.View
            key={lab.id}
            style={[styles.labCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.small]}
          >
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
                  onPress={() => openModal(lab)}
                >
                  <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                  onPress={() => handleDelete(lab.id)}
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
          </Animated.View>
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

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
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
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Descripción</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.description}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                  placeholder="Descripción del laboratorio..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bloque *</Text>
                <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {BUILDINGS.map((building) => (
                      <TouchableOpacity
                        key={building.id}
                        style={[
                          styles.pickerOption,
                          {
                            backgroundColor: formData.building === building.name ? colors.primary : "transparent",
                          },
                        ]}
                        onPress={() => setFormData((prev) => ({ ...prev, building: building.name }))}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            { color: formData.building === building.name ? "#FFFFFF" : colors.text },
                          ]}
                        >
                          {building.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Sala *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.room}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, room: text }))}
                  placeholder="Ej: A-201"
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
                        value={light.ip}
                        onChangeText={(text) => updateLightData(light.id, { ip: text })}
                        placeholder="192.168.1.100"
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
    padding: SIZES.lg,
    marginBottom: SIZES.md,
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
})
