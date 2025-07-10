"use client"

import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Animated, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLab } from "../../context/LabContext"
import { useTheme } from "../../context/ThemeContext"
import { RGB_COLORS } from "../../constants/Data"
import { SIZES, FONTS, SHADOWS } from "../../constants/Colors"
import { AnimatedButton } from "../../components/AnimatedButton"

export default function PracticesScreen() {
  const { practices, addPractice, deletePractice } = useLab()
  const { colors } = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#FFFFFF",
    intensity: 100,
  })

  const fadeAnim = React.useRef(new Animated.Value(0))

  React.useEffect(() => {
    Animated.timing(fadeAnim.current, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const openModal = () => {
    setFormData({
      name: "",
      description: "",
      color: "#FFFFFF",
      intensity: 100,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({
      name: "",
      description: "",
      color: "#FFFFFF",
      intensity: 100,
    })
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "El nombre de la práctica es obligatorio")
      return
    }

    addPractice(formData)
    closeModal()
    Alert.alert("Éxito", "Práctica creada correctamente")
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

  const predefinedPractices = practices.filter((p) => !p.isCustom)
  const customPractices = practices.filter((p) => p.isCustom)

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim.current }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Prácticas de Laboratorio</Text>
          <Text style={styles.headerSubtitle}>Configuraciones predefinidas para experimentos</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

          {predefinedPractices.map((practice) => (
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
                </View>
                <View style={styles.practiceSettings}>
                  <View style={[styles.colorIndicator, { backgroundColor: practice.color }]} />
                  <Text style={[styles.intensityText, { color: colors.textSecondary }]}>{practice.intensity}%</Text>
                </View>
              </View>

              <View style={styles.practiceFooter}>
                <View style={styles.practiceStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>Configuración estándar</Text>
                  </View>
                </View>
                <View style={[styles.predefinedBadge, { backgroundColor: colors.info }]}>
                  <Text style={styles.badgeText}>Predefinida</Text>
                </View>
              </View>
            </View>
          ))}
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
                Crea tu primera práctica personalizada
              </Text>
              <AnimatedButton title="Crear Práctica" onPress={openModal} style={{ marginTop: SIZES.lg }} />
            </View>
          ) : (
            customPractices.map((practice) => (
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
                  </View>
                  <View style={styles.practiceActions}>
                    <View style={styles.practiceSettings}>
                      <View style={[styles.colorIndicator, { backgroundColor: practice.color }]} />
                      <Text style={[styles.intensityText, { color: colors.textSecondary }]}>{practice.intensity}%</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: colors.error }]}
                      onPress={() => handleDelete(practice.id, practice.name)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.practiceFooter}>
                  <View style={styles.practiceStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>Creada por ti</Text>
                    </View>
                  </View>
                  <View style={[styles.customBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.badgeText}>Personalizada</Text>
                  </View>
                </View>
              </View>
            ))
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Nueva Práctica</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
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
            </View>

            {/* Light Configuration */}
            <View style={styles.formSection}>
              <Text style={[styles.formSectionTitle, { color: colors.text }]}>Configuración de Iluminación</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Color Principal</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorSelector}>
                  {RGB_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color.value}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color.value },
                        formData.color === color.value && styles.selectedColor,
                      ]}
                      onPress={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                    >
                      {formData.color === color.value && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={[styles.colorName, { color: colors.textSecondary }]}>
                  Color seleccionado: {RGB_COLORS.find((c) => c.value === formData.color)?.name || "Personalizado"}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Intensidad: {formData.intensity}%
                </Text>
                <View style={styles.intensitySelector}>
                  {[25, 50, 75, 100].map((intensity) => (
                    <TouchableOpacity
                      key={intensity}
                      style={[
                        styles.intensityOption,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        formData.intensity === intensity && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => setFormData((prev) => ({ ...prev, intensity }))}
                    >
                      <Text
                        style={[
                          styles.intensityOptionText,
                          { color: formData.intensity === intensity ? "#FFFFFF" : colors.text },
                        ]}
                      >
                        {intensity}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preview */}
              <View style={styles.previewSection}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Vista Previa</Text>
                <View style={[styles.previewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View
                    style={[
                      styles.previewLight,
                      { backgroundColor: formData.color, opacity: formData.intensity / 100 },
                    ]}
                  >
                    <Ionicons name="bulb" size={32} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.previewText, { color: colors.text }]}>
                    {formData.name || "Nombre de la práctica"}
                  </Text>
                  <Text style={[styles.previewSubtext, { color: colors.textSecondary }]}>
                    {formData.intensity}% de intensidad
                  </Text>
                </View>
              </View>
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
            <AnimatedButton title="Crear Práctica" onPress={handleSave} style={{ flex: 1, marginLeft: SIZES.sm }} />
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
  },
  practiceSettings: {
    alignItems: "center" as const,
  },
  practiceActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: SIZES.xs,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  intensityText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium as any,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginLeft: SIZES.md,
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
  colorSelector: {
    flexDirection: "row" as const,
    marginBottom: SIZES.sm,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SIZES.md,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#000000",
    borderWidth: 3,
  },
  colorName: {
    fontSize: FONTS.size.sm,
  },
  intensitySelector: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: SIZES.sm,
  },
  intensityOption: {
    flex: 1,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.borderRadius,
    alignItems: "center" as const,
    borderWidth: 1,
  },
  intensityOptionText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold as any,
  },
  previewSection: {
    marginTop: SIZES.lg,
  },
  previewCard: {
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    padding: SIZES.xl,
    alignItems: "center" as const,
  },
  previewLight: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.lg,
  },
  previewText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    textAlign: "center" as const,
    marginBottom: SIZES.xs,
  },
  previewSubtext: {
    fontSize: FONTS.size.sm,
    textAlign: "center" as const,
  },
  modalFooter: {
    flexDirection: "row" as const,
    padding: SIZES.lg,
    borderTopWidth: 1,
  },
})
