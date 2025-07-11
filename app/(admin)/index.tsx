"use client"

import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "../../context/AuthContext"
import { useLab } from "../../context/LabContext"
import { useTheme } from "../../context/ThemeContext"
import { MOCK_USERS } from "../../constants/Data"
import { SIZES } from "../../constants/Colors"

export default function AdminHomeScreen() {
  const { user, logout } = useAuth()
  const { labs, getEnergyConsumption } = useLab()
  const { colors } = useTheme()
  const router = useRouter()

  const totalLabs = labs.length
  const activeLabs = labs.filter((lab) => lab.isActive).length
  const totalTeachers = MOCK_USERS.filter((u) => u.role === "teacher").length
  const totalConsumption = getEnergyConsumption()

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        onPress: () => {
          logout()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Panel de Administración</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Resumen general */}
        <View style={[styles.summarySection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumen General</Text>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="business" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>{totalLabs}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Laboratorios</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>{activeLabs}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Activos</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="people" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>{totalTeachers}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Docentes</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.accent }]}>
                <Ionicons name="flash" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>{totalConsumption.toFixed(0)}W</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Consumo</Text>
            </View>
          </View>
        </View>

        

              
        
      </ScrollView>
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
    paddingHorizontal: SIZES.padding,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  summarySection: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",

  },
  summaryCard: {
    width: "50%",
    alignItems: "center",
    marginBottom: 26,
  },
  summaryIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  actionsSection: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  labsSection: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
  },
  labStatusCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: SIZES.borderRadius,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  labStatusInfo: {
    flex: 1,
  },
  labStatusName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  labStatusLocation: {
    fontSize: 12,
    marginBottom: 8,
  },
  labStatusDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labStatusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  labStatusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  labStatusBadge: {
    alignItems: "center",
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  activeTeacher: {
    fontSize: 10,
  },
})
