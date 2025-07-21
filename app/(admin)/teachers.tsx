"use client"

import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useLab } from "../../context/LabContext"
import { MOCK_USERS } from "../../constants/Data"
import { SIZES, FONTS, SHADOWS } from "../../constants/Colors"
import { AnimatedButton } from "../../components/AnimatedButton"

interface Teacher {
  id: string
  firstName: string
  lastName: string
  secondLastName: string
  email: string
  password: string
  assignedLabs: string[]
  photo: string
}

export default function TeachersScreen() {
  const { colors } = useTheme()
  const { labs } = useLab()
  const [teachers, setTeachers] = useState<Teacher[]>(
    MOCK_USERS.filter((u) => u.role === "teacher").map((u) => ({
      id: u.id,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      secondLastName: u.secondLastName || "",
      email: u.email,
      password: u.password,
      assignedLabs: u.assignedLabs || [],
      photo: u.photo || "",
    })),
  )

  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [formData, setFormData] = useState<Partial<Teacher>>({})
  const [selectedLabs, setSelectedLabs] = useState<string[]>([])

  const fadeAnim = new Animated.Value(0)
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const openModal = (teacher?: Teacher)=> {
    if (teacher) {
      setEditingTeacher(teacher)
      setFormData(teacher)
      setSelectedLabs(teacher.assignedLabs)
    } else {
      setEditingTeacher(null)
      setFormData({
        firstName: "",
        lastName: "",
        secondLastName: "",
        email: "",
        password: "",
        photo: "",
      })
      setSelectedLabs([])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    // Limpiar estados después de un pequeño delay para evitar pantalla en blanco
    setTimeout(() => {
      setEditingTeacher(null)
      setFormData({})
      setSelectedLabs([])
    }, 100)
  }

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }

    const teacherData: Teacher = {
      id: editingTeacher?.id || `teacher_${Date.now()}`,
      firstName: formData.firstName!,
      lastName: formData.lastName!,
      secondLastName: formData.secondLastName || "",
      email: formData.email!,
      password: formData.password || "123456",
      assignedLabs: selectedLabs,
      photo: formData.photo || "", 
    }

    if (editingTeacher) {
      setTeachers((prev) => prev.map((t) => (t.id === editingTeacher.id ? teacherData : t)))
    } else {
      setTeachers((prev) => [...prev, teacherData])
    }

    closeModal()
    Alert.alert("Éxito", `Docente ${editingTeacher ? "actualizado" : "creado"} correctamente`)
  }

  const handleDelete = (teacherId: string) => {
    Alert.alert("Confirmar eliminación", "¿Estás seguro de que deseas eliminar este docente?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setTeachers((prev) => prev.filter((t) => t.id !== teacherId))
          Alert.alert("Éxito", "Docente eliminado correctamente")
        },
      },
    ])
  }

  const toggleLabAssignment = (labId: string) => {
    setSelectedLabs((prev) => (prev.includes(labId) ? prev.filter((id) => id !== labId) : [...prev, labId]))
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Gestión de Docentes</Text>
            <Text style={styles.headerSubtitle}>
              {teachers.length} docente{teachers.length !== 1 ? "s" : ""} registrado{teachers.length !== 1 ? "s" : ""}
            </Text>
          </View>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        </View>
      </View>

      {/* Teachers List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {teachers.map((teacher, index) => (
          <View
            key={teacher.id}
            style={[styles.teacherCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.small]}
          >
            <View style={styles.teacherHeader}>
              <Image source={teacher.photo} style={styles.teacherPhoto} />
              <View style={styles.teacherInfo}>
                <Text style={[styles.teacherName, { color: colors.text }]}>
                  {teacher.firstName} {teacher.lastName} {teacher.secondLastName}
                </Text>
                <Text style={[styles.teacherEmail, { color: colors.textSecondary }]}>{teacher.email}</Text>
              </View>
              <View style={styles.teacherActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.info }]}
                  onPress={() => openModal(teacher)}
                >
                  <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                  onPress={() => handleDelete(teacher.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.teacherDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {teacher.assignedLabs.length} laboratorio{teacher.assignedLabs.length !== 1 ? "s" : ""} asignado
                  {teacher.assignedLabs.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            {teacher.assignedLabs.length > 0 && (
              <View style={styles.assignedLabs}>
                <Text style={[styles.labsTitle, { color: colors.text }]}>Laboratorios asignados:</Text>
                <View style={styles.labsList}>
                  {teacher.assignedLabs.map((labId) => {
                    const lab = labs.find((l) => l.id === labId)
                    return lab ? (
                      <View key={labId} style={[styles.labChip, { backgroundColor: colors.primary }]}>
                        <Text style={styles.labChipText}>{lab.name}</Text>
                      </View>
                    ) : null
                  })}
                </View>
              </View>
            )}
          </View>
        ))}

        {teachers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay docentes registrados</Text>
            <AnimatedButton
              title="Agregar primer docente"
              onPress={() => openModal()}
              style={{ marginTop: SIZES.lg }}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
        statusBarTranslucent={false}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingTeacher ? "Editar Docente" : "Nuevo Docente"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Photo */}
            <View style={styles.photoSection}>
              <Image
                source={formData.photo}
                style={styles.modalPhoto}
              />
              <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.photoButtonText}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Personal</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, firstName: text }))}
                  placeholder="Ingresa el nombre"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Apellido Paterno *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, lastName: text }))}
                  placeholder="Ingresa el apellido paterno"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Apellido Materno</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.secondLastName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, secondLastName: text }))}
                  placeholder="Ingresa el apellido materno"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Correo Electrónico *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.email}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                  placeholder="correo@uniguajira.edu.co"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Contraseña</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.password}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
                  placeholder="Contraseña temporal"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Lab Assignment */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Laboratorios Asignados</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Selecciona los laboratorios que puede gestionar este docente
              </Text>

              <View style={styles.labsGrid}>
                {labs.map((lab) => (
                  <TouchableOpacity
                    key={lab.id}
                    style={[
                      styles.labOption,
                      {
                        backgroundColor: selectedLabs.includes(lab.id) ? colors.primary : colors.surface,
                        borderColor: selectedLabs.includes(lab.id) ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleLabAssignment(lab.id)}
                  >
                    <Ionicons
                      name={selectedLabs.includes(lab.id) ? "checkmark-circle" : "ellipse-outline"}
                      size={20}
                      color={selectedLabs.includes(lab.id) ? "#FFFFFF" : colors.textSecondary}
                    />
                    <View style={styles.labOptionInfo}>
                      <Text
                        style={[
                          styles.labOptionName,
                          { color: selectedLabs.includes(lab.id) ? "#FFFFFF" : colors.text },
                        ]}
                      >
                        {lab.name}
                      </Text>
                      <Text
                        style={[
                          styles.labOptionLocation,
                          { color: selectedLabs.includes(lab.id) ? "rgba(255,255,255,0.8)" : colors.textSecondary },
                        ]}
                      >
                        {lab.building} - {lab.room}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
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
            <AnimatedButton
              title={editingTeacher ? "Actualizar" : "Crear"}
              onPress={handleSave}
              style={{ flex: 1, marginLeft: SIZES.sm }}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = {
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
  teacherCard: {
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  teacherHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.md,
  },
  teacherPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SIZES.md,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: 2,
  },
  teacherEmail: {
    fontSize: FONTS.size.sm,
    marginBottom: 2,
  },
  teacherDepartment: {
    fontSize: FONTS.size.xs,
  },
  teacherActions: {
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
  teacherDetails: {
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
  assignedLabs: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: SIZES.md,
  },
  labsTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.sm,
  },
  labsList: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  labChip: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadiusSmall,
    marginRight: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  labChipText: {
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
  photoSection: {
    alignItems: "center" as const,
    marginBottom: SIZES.xl,
  },
  modalPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SIZES.md,
  },
  photoButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.borderRadius,
  },
  photoButtonText: {
    color: "#FFFFFF",
    marginLeft: SIZES.sm,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
  },
  formSection: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.sm,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.sm,
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
  labsGrid: {
    gap: SIZES.sm,
  },
  labOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    marginBottom: SIZES.sm,
  },
  labOptionInfo: {
    marginLeft: SIZES.md,
    flex: 1,
  },
  labOptionName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium as any,
  },
  labOptionLocation: {
    fontSize: FONTS.size.sm,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: "row" as const,
    padding: SIZES.lg,
    borderTopWidth: 1,
  },
}
