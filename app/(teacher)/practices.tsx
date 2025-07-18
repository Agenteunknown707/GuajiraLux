"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  StyleSheet,
  Switch,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLab } from "../../context/LabContext"
import { useTheme } from "../../context/ThemeContext"
import { useAuth } from "../../context/AuthContext"
import { RGB_COLORS } from "../../constants/Data"
import { SIZES, FONTS, SHADOWS } from "../../constants/Colors"
import { AnimatedButton } from "../../components/AnimatedButton"

interface PracticeLight {
  lightId: string
  lightName: string
  isOn: boolean
  color: string
  intensity: number
}

export default function PracticesScreen() {
  const { practices, addPractice, updatePractice, deletePractice, applyPractice, labs } = useLab()
  const { colors } = useTheme()
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editingPractice, setEditingPractice] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    labId: "",
  })
  const [practiceLights, setPracticeLights] = useState<PracticeLight[]>([])

  const fadeAnim = React.useRef(new Animated.Value(0))

  React.useEffect(() => {
    Animated.timing(fadeAnim.current, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  // Obtener laboratorios asignados al usuario
  const userLabs = labs.filter((lab) => user?.assignedLabs?.includes(lab.id))
  const userPractices = practices.filter((p) => user?.assignedLabs?.includes(p.labId))

  // Obtener el laboratorio activo (donde el usuario inició sesión)
  const activeLab = labs.find((lab) => lab.isActive && lab.activeTeacher === user?.id)

  const openModal = (practiceToEdit?: any) => {
    if (!activeLab && !practiceToEdit) {
      Alert.alert("Error", "Debes iniciar sesión en un laboratorio para crear prácticas")
      return
    }

    if (practiceToEdit) {
      // Modo edición
      setEditingPractice(practiceToEdit.id)
      setFormData({
        name: practiceToEdit.name,
        description: practiceToEdit.description,
        labId: practiceToEdit.labId,
      })

      const lab = labs.find((l) => l.id === practiceToEdit.labId)
      if (lab) {
        const lights: PracticeLight[] = lab.lights.map((light) => {
          const practiceLight = practiceToEdit.lights.find((pl: any) => pl.lightId === light.id)
          return {
            lightId: light.id,
            lightName: light.name,
            isOn: practiceLight?.isOn || false,
            color: practiceLight?.color || "#FFFFFF",
            intensity: practiceLight?.intensity || 100,
          }
        })
        setPracticeLights(lights)
      }
    } else {
      // Modo creación
      setEditingPractice(null)
      const lights: PracticeLight[] = activeLab!.lights.map((light) => ({
        lightId: light.id,
        lightName: light.name,
        isOn: false,
        color: "#FFFFFF",
        intensity: 100,
      }))

      setFormData({
        name: "",
        description: "",
        labId: activeLab!.id,
      })
      setPracticeLights(lights)
    }

    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPractice(null)
    setFormData({
      name: "",
      description: "",
      labId: "",
    })
    setPracticeLights([])
  }

  const updatePracticeLight = (lightId: string, updates: Partial<PracticeLight>) => {
    setPracticeLights((prev) => prev.map((light) => (light.lightId === lightId ? { ...light, ...updates } : light)))
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "El nombre de la práctica es obligatorio")
      return
    }

    if (!formData.labId) {
      Alert.alert("Error", "No se pudo identificar el laboratorio")
      return
    }

    const practiceData = {
      name: formData.name,
      description: formData.description,
      labId: formData.labId,
      lights: practiceLights.map((light) => ({
        lightId: light.lightId,
        isOn: light.isOn,
        color: light.color,
        intensity: light.intensity,
      })),
      isCustom: true,
      createdBy: user?.id,
    }

    if (editingPractice) {
      updatePractice(editingPractice, practiceData)
      Alert.alert("Éxito", "Práctica actualizada correctamente")
    } else {
      addPractice(practiceData)
      Alert.alert("Éxito", "Práctica creada correctamente")
    }

    closeModal()
  }

  const handleApplyPractice = (practiceId: string, practiceName: string) => {
    if (!activeLab) {
      Alert.alert("Error", "Debes tener un laboratorio activo para aplicar prácticas")
      return
    }

    Alert.alert("Aplicar Práctica", `¿Deseas aplicar la práctica "${practiceName}" al laboratorio ${activeLab.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aplicar",
        onPress: () => {
          applyPractice(practiceId, activeLab.id)
          Alert.alert("Éxito", `Práctica "${practiceName}" aplicada correctamente`)
        },
      },
    ])
  }

  const handleDelete = (practiceId: string, practiceName: string) => {
    Alert.alert("Eliminar Práctica", `¿Estás seguro de que deseas eliminar "${practiceName}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          deletePractice(practiceId)
          Alert.alert("Éxito", "Práctica eliminada correctamente")
        },
      },
    ])
  }

  const predefinedPractices = userPractices.filter((p) => !p.isCustom)
  const customPractices = userPractices.filter((p) => p.isCustom)

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim.current }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primaryDark }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Prácticas de Laboratorio</Text>
          <Text style={styles.headerSubtitle}>
            {activeLab ? `Laboratorio: ${activeLab.name}` : "Configuraciones predefinidas para experimentos"}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Lab Info */}
        {activeLab && (
          <Animated.View
            style={[
              styles.activeLabSection,
              { backgroundColor: colors.surface },
              SHADOWS.small,
              {
                transform: [
                  {
                    translateY: fadeAnim.current.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.activeLabHeader}>
              <Ionicons name="business" size={24} color={colors.primary} />
              <Text style={[styles.activeLabTitle, { color: colors.text }]}>Laboratorio Activo</Text>
            </View>
            <Text style={[styles.activeLabName, { color: colors.text }]}>{activeLab.name}</Text>
            <Text style={[styles.activeLabLocation, { color: colors.textSecondary }]}>
              {activeLab.building} - {activeLab.room}
            </Text>
            <View style={styles.activeLabStats}>
              <View style={styles.statItem}>
                <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  {activeLab.lights.length} focos disponibles
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Predefined Practices */}
        <Animated.View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
            SHADOWS.small,
            {
              transform: [
                {
                  translateY: fadeAnim.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Prácticas Predefinidas</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Configuraciones estándar para experimentos comunes
          </Text>

          {predefinedPractices.map((practice) => {
            const lab = labs.find((l) => l.id === practice.labId)
            const isApplicable = activeLab && practice.labId === activeLab.id

            return (
              <View
                key={practice.id}
                style={[styles.practiceCard, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <View style={styles.practiceHeader}>
                  <View style={styles.practiceInfo}>
                    <Text style={[styles.practiceName, { color: colors.text }]}>{practice.name}</Text>
                    <Text style={[styles.practiceDescription, { color: colors.textSecondary }]}>
                      {practice.description}
                    </Text>
                    <Text style={[styles.practiceLabName, { color: colors.primary }]}>{lab?.name}</Text>
                  </View>
                  <View style={styles.practiceSettings}>
                    <View style={styles.lightPreview}>
                      {practice.lights.slice(0, 3).map((light, index) => (
                        <View
                          key={`${light.lightId}-${index}`}
                          style={[
                            styles.lightDot,
                            {
                              backgroundColor: light.isOn ? light.color : colors.textTertiary,
                              opacity: light.isOn ? light.intensity / 100 : 0.3,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.practiceActions}>
                  <AnimatedButton
                    title="Aplicar Práctica"
                    onPress={() => handleApplyPractice(practice.id, practice.name)}
                    disabled={!isApplicable}
                    size="small"
                    style={{ ...styles.actionButton, opacity: isApplicable ? 1 : 0.5 }}
                  />
                </View>

                <View style={styles.practiceFooter}>
                  <View style={styles.practiceStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {practice.lights.filter((l) => l.isOn).length}/{practice.lights.length} focos activos
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.predefinedBadge, { backgroundColor: colors.info }]}>
                    <Text style={styles.badgeText}>Predefinida</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </Animated.View>

        {/* Custom Practices */}
        <Animated.View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
            SHADOWS.small,
            {
              transform: [
                {
                  translateY: fadeAnim.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mis Prácticas Personalizadas</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Configuraciones creadas por ti para experimentos específicos
          </Text>

          {customPractices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flask-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No tienes prácticas personalizadas
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                {activeLab
                  ? "Crea tu primera práctica personalizada"
                  : "Inicia sesión en un laboratorio para crear prácticas"}
              </Text>
              {activeLab && (
                <AnimatedButton title="Crear Práctica" onPress={() => openModal()} style={{ marginTop: SIZES.lg }} />
              )}
            </View>
          ) : (
            customPractices.map((practice) => {
              const lab = labs.find((l) => l.id === practice.labId)
              const isApplicable = activeLab && practice.labId === activeLab.id

              return (
                <View
                  key={practice.id}
                  style={[styles.practiceCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <View style={styles.practiceHeader}>
                    <View style={styles.practiceInfo}>
                      <Text style={[styles.practiceName, { color: colors.text }]}>{practice.name}</Text>
                      <Text style={[styles.practiceDescription, { color: colors.textSecondary }]}>
                        {practice.description}
                      </Text>
                      <Text style={[styles.practiceLabName, { color: colors.primary }]}>{lab?.name}</Text>
                    </View>
                    <View style={styles.practiceActionsHeader}>
                      <View style={styles.practiceSettings}>
                        <View style={styles.lightPreview}>
                          {practice.lights.slice(0, 3).map((light, index) => (
                            <View
                              key={`${light.lightId}-${index}`}
                              style={[
                                styles.lightDot,
                                {
                                  backgroundColor: light.isOn ? light.color : colors.textTertiary,
                                  opacity: light.isOn ? light.intensity / 100 : 0.3,
                                },
                              ]}
                            />
                          ))}
                        </View>
                      </View>
                      <View style={styles.headerActions}>
                        <TouchableOpacity
                          style={[styles.editButton, { backgroundColor: colors.info }]}
                          onPress={() => openModal(practice)}
                        >
                          <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.deleteButton, { backgroundColor: colors.error }]}
                          onPress={() => handleDelete(practice.id, practice.name)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.practiceActions}>
                    <AnimatedButton
                      title="Aplicar Práctica"
                      onPress={() => handleApplyPractice(practice.id, practice.name)}
                      disabled={!isApplicable}
                      size="small"
                      style={{ ...styles.actionButton, opacity: isApplicable ? 1 : 0.5 }}
                    />
                  </View>

                  <View style={styles.practiceFooter}>
                    <View style={styles.practiceStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>
                          {practice.lights.filter((l) => l.isOn).length}/{practice.lights.length} focos activos
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.customBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={styles.badgeText}>Personalizada</Text>
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </Animated.View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingPractice ? "Editar Práctica" : "Nueva Práctica"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <View style={styles.formSection}>
              <Text style={[styles.formSectionTitle, { color: colors.text }]}>Información Básica</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre de la Práctica *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.name}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                  placeholder="Ej: Análisis de Espectros Avanzado"
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
                  placeholder="Describe el propósito y procedimiento de esta práctica..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {formData.labId && (
                <View style={[styles.labInfoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="business" size={20} color={colors.primary} />
                  <View style={styles.labInfoText}>
                    <Text style={[styles.labInfoName, { color: colors.text }]}>
                      {labs.find((l) => l.id === formData.labId)?.name}
                    </Text>
                    <Text style={[styles.labInfoLocation, { color: colors.textSecondary }]}>
                      {labs.find((l) => l.id === formData.labId)?.building} -{" "}
                      {labs.find((l) => l.id === formData.labId)?.room}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Individual Light Configuration */}
            {practiceLights.length > 0 && (
              <View style={styles.formSection}>
                <Text style={[styles.formSectionTitle, { color: colors.text }]}>Configuración Individual de Focos</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Configura cada foco del laboratorio para esta práctica
                </Text>

                {practiceLights.map((light) => (
                  <View
                    key={light.lightId}
                    style={[
                      styles.lightConfig,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      SHADOWS.small,
                    ]}
                  >
                    <View style={styles.lightConfigHeader}>
                      <View style={styles.lightConfigInfo}>
                        <Text style={[styles.lightConfigTitle, { color: colors.text }]}>{light.lightName}</Text>
                        <Text style={[styles.lightConfigId, { color: colors.textSecondary }]}>ID: {light.lightId}</Text>
                      </View>
                      <Switch
                        value={light.isOn}
                        onValueChange={(value) => updatePracticeLight(light.lightId, { isOn: value })}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={light.isOn ? "#FFFFFF" : colors.textTertiary}
                      />
                    </View>

                    {light.isOn && (
                      <>
                        {/* Color Selection */}
                        <View style={styles.lightConfigSection}>
                          <Text style={[styles.lightConfigLabel, { color: colors.textSecondary }]}>Color</Text>
                          <View style={styles.colorGrid}>
                            {RGB_COLORS.slice(0, 8).map((color) => (
                              <TouchableOpacity
                                key={color.value}
                                style={[
                                  styles.colorOptionSmall,
                                  { backgroundColor: color.value },
                                  light.color === color.value && [styles.selectedColorSmall, SHADOWS.small],
                                ]}
                                onPress={() => updatePracticeLight(light.lightId, { color: color.value })}
                              >
                                {light.color === color.value && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                              </TouchableOpacity>
                            ))}
                          </View>
                          <Text style={[styles.selectedColorText, { color: colors.textSecondary }]}>
                            Seleccionado: {RGB_COLORS.find((c) => c.value === light.color)?.name || "Personalizado"}
                          </Text>
                        </View>

                        {/* Intensity Selection */}
                        <View style={styles.lightConfigSection}>
                          <Text style={[styles.lightConfigLabel, { color: colors.textSecondary }]}>
                            Intensidad: {light.intensity}%
                          </Text>
                          <View style={styles.intensitySelector}>
                            {[25, 50, 75, 100].map((intensity) => (
                              <TouchableOpacity
                                key={intensity}
                                style={[
                                  styles.intensityOption,
                                  { backgroundColor: colors.background, borderColor: colors.border },
                                  light.intensity === intensity && {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                  },
                                ]}
                                onPress={() => updatePracticeLight(light.lightId, { intensity })}
                              >
                                <Text
                                  style={[
                                    styles.intensityOptionText,
                                    { color: light.intensity === intensity ? "#FFFFFF" : colors.text },
                                  ]}
                                >
                                  {intensity}%
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        {/* Light Preview */}
                        <View style={styles.lightPreviewSection}>
                          <View
                            style={[
                              styles.lightPreviewCircle,
                              { backgroundColor: light.color, opacity: light.intensity / 100 },
                            ]}
                          >
                            <Ionicons name="bulb" size={20} color="#FFFFFF" />
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Practice Summary */}
            {practiceLights.some((light) => light.isOn) && (
              <View style={styles.formSection}>
                <Text style={[styles.formSectionTitle, { color: colors.text }]}>Resumen de la Práctica</Text>
                <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={styles.summaryHeader}>
                    <Text style={[styles.summaryTitle, { color: colors.text }]}>
                      {formData.name || (editingPractice ? "Práctica Editada" : "Nueva Práctica")}
                    </Text>
                    <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>
                      {labs.find((l) => l.id === formData.labId)?.name}
                    </Text>
                  </View>
                  <View style={styles.summaryStats}>
                    <View style={styles.summaryStatItem}>
                      <Ionicons name="bulb" size={16} color={colors.primary} />
                      <Text style={[styles.summaryStatText, { color: colors.text }]}>
                        {practiceLights.filter((l) => l.isOn).length} focos activos
                      </Text>
                    </View>
                    <View style={styles.summaryStatItem}>
                      <Ionicons name="color-palette" size={16} color={colors.secondary} />
                      <Text style={[styles.summaryStatText, { color: colors.text }]}>
                        {new Set(practiceLights.filter((l) => l.isOn).map((l) => l.color)).size} colores únicos
                      </Text>
                    </View>
                  </View>
                  <View style={styles.summaryLights}>
                    {practiceLights
                      .filter((light) => light.isOn)
                      .map((light) => (
                        <View
                          key={light.lightId}
                          style={[
                            styles.summaryLightDot,
                            { backgroundColor: light.color, opacity: light.intensity / 100 },
                          ]}
                        />
                      ))}
                  </View>
                </View>
              </View>
            )}
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
              title={editingPractice ? "Actualizar Práctica" : "Crear Práctica"}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: SIZES.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    marginRight: SIZES.md,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: FONTS.size.sm,
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
  activeLabSection: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  activeLabHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  activeLabTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold as any,
    marginLeft: SIZES.sm,
  },
  activeLabName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold as any,
    marginBottom: SIZES.xs,
  },
  activeLabLocation: {
    fontSize: FONTS.size.sm,
    marginBottom: SIZES.md,
  },
  activeLabStats: {
    flexDirection: "row",
  },
  section: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.sm,
    marginBottom: SIZES.lg,
  },
  practiceCard: {
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  practiceHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: SIZES.md,
  },
  practiceInfo: {
    flex: 1,
    marginRight: SIZES.md,
  },
  practiceName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.xs,
  },
  practiceDescription: {
    fontSize: FONTS.size.sm,
    lineHeight: 18,
    marginBottom: SIZES.xs,
  },
  practiceLabName: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
  },
  practiceSettings: {
    alignItems: "center" as const,
  },
  practiceActionsHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  headerActions: {
    flexDirection: "row" as const,
    marginLeft: SIZES.md,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: SIZES.xs,
  },
  lightPreview: {
    flexDirection: "row" as const,
    marginBottom: SIZES.xs,
  },
  lightDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.xs,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  practiceActions: {
    marginBottom: SIZES.md,
  },
  actionButton: {
    alignSelf: "flex-start",
  },
  practiceFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: SIZES.md,
  },
  practiceStats: {
    flex: 1,
  },
  statItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  statText: {
    fontSize: FONTS.size.sm,
    marginLeft: SIZES.xs,
  },
  predefinedBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadiusSmall,
  },
  customBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadiusSmall,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold as any,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: SIZES.xxxl,
  },
  emptyText: {
    fontSize: FONTS.size.lg,
    textAlign: "center" as const,
    marginTop: SIZES.lg,
    marginBottom: SIZES.xs,
  },
  emptySubtext: {
    fontSize: FONTS.size.sm,
    textAlign: "center" as const,
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
  formSectionTitle: {
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
    height: 100,
    textAlignVertical: "top" as const,
  },
  labInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
  },
  labInfoText: {
    marginLeft: SIZES.md,
  },
  labInfoName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold as any,
  },
  labInfoLocation: {
    fontSize: FONTS.size.sm,
  },
  lightConfig: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  lightConfigHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  lightConfigInfo: {
    flex: 1,
  },
  lightConfigTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold as any,
  },
  lightConfigId: {
    fontSize: FONTS.size.xs,
    marginTop: 2,
  },
  lightConfigSection: {
    marginBottom: SIZES.md,
  },
  lightConfigLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.sm,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  colorOptionSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorSmall: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
  selectedColorText: {
    fontSize: FONTS.size.xs,
  },
  intensitySelector: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: SIZES.sm,
  },
  intensityOption: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.borderRadius,
    alignItems: "center" as const,
    borderWidth: 1,
  },
  intensityOptionText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold as any,
  },
  lightPreviewSection: {
    alignItems: "center",
    marginTop: SIZES.sm,
  },
  lightPreviewCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    padding: SIZES.lg,
  },
  summaryHeader: {
    marginBottom: SIZES.md,
  },
  summaryTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.xs,
  },
  summarySubtitle: {
    fontSize: FONTS.size.sm,
  },
  summaryStats: {
    marginBottom: SIZES.md,
  },
  summaryStatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.xs,
  },
  summaryStatText: {
    fontSize: FONTS.size.sm,
    marginLeft: SIZES.sm,
  },
  summaryLights: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.xs,
  },
  summaryLightDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  modalFooter: {
    flexDirection: "row" as const,
    padding: SIZES.lg,
    borderTopWidth: 1,
  },
})
