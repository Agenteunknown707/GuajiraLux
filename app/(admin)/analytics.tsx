"use client"

import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useLab } from "../../context/LabContext"
import { SIZES, FONTS, SHADOWS } from "../../constants/Colors"

const { width } = Dimensions.get("window")

export default function AnalyticsScreen() {
  const { colors } = useTheme()
  const { labs, getEnergyConsumption } = useLab()
  const [selectedPeriod, setSelectedPeriod] = useState("today")

  const fadeAnim = new Animated.Value(0)

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const periods = [
    { key: "today", label: "Hoy" },
    { key: "week", label: "Semana" },
    { key: "month", label: "Mes" },
    { key: "year", label: "Año" },
  ]

  const totalConsumption = getEnergyConsumption()
  const activeLabs = labs.filter((lab) => lab.isActive)
  const totalLights = labs.reduce((sum, lab) => sum + lab.lights.length, 0)
  const activeLights = labs.reduce((sum, lab) => sum + lab.lights.filter((l) => l.isOn).length, 0)

  // Simular datos históricos
  const generateHistoricalData = () => {
    const data = []
    const points =
      selectedPeriod === "today" ? 24 : selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 12

    for (let i = 0; i < points; i++) {
      data.push({
        period:
          selectedPeriod === "today"
            ? `${i}:00`
            : selectedPeriod === "week"
              ? `Día ${i + 1}`
              : selectedPeriod === "month"
                ? `${i + 1}`
                : `Mes ${i + 1}`,
        consumption: Math.random() * 500 + 100,
        efficiency: Math.random() * 30 + 70,
      })
    }
    return data
  }

  const historicalData = generateHistoricalData()
  const maxConsumption = Math.max(...historicalData.map((d) => d.consumption))

  // Datos de consumo por laboratorio
  const labConsumptionData = labs
    .map((lab) => ({
      id: lab.id,
      name: lab.name,
      consumption: getEnergyConsumption(lab.id),
      efficiency: Math.random() * 100,
      activeLights: lab.lights.filter((l) => l.isOn).length,
      totalLights: lab.lights.length,
      building: lab.building,
    }))
    .sort((a, b) => b.consumption - a.consumption)

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Analíticas de Consumo</Text>
        <Text style={styles.headerSubtitle}>Monitoreo energético en tiempo real</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={[styles.periodSelector, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.selectorTitle, { color: colors.text }]}>Período de análisis</Text>
          <View style={styles.periodButtons}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor: selectedPeriod === period.key ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text
                  style={[styles.periodButtonText, { color: selectedPeriod === period.key ? "#FFFFFF" : colors.text }]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumen General</Text>

          <View style={styles.summaryGrid}>
            <Animated.View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.surface, borderColor: colors.primary },
                SHADOWS.small,
              ]}
            >
              <View style={[styles.summaryIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="flash" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>{totalConsumption.toFixed(1)}W</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Consumo Total</Text>
              <Text style={[styles.summaryChange, { color: colors.success }]}>↑ 12% vs ayer</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.surface, borderColor: colors.success },
                SHADOWS.small,
              ]}
            >
              <View style={[styles.summaryIcon, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>{activeLabs.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Labs Activos</Text>
              <Text style={[styles.summaryChange, { color: colors.info }]}>de {labs.length} total</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.surface, borderColor: colors.secondary },
                SHADOWS.small,
              ]}
            >
              <View style={[styles.summaryIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="bulb" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>
                {activeLights}/{totalLights}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Focos Activos</Text>
              <Text style={[styles.summaryChange, { color: colors.warning }]}>
                {((activeLights / totalLights) * 100).toFixed(0)}% uso
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.surface, borderColor: colors.accent },
                SHADOWS.small,
              ]}
            >
              <View style={[styles.summaryIcon, { backgroundColor: colors.accent }]}>
                <Ionicons name="trending-up" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>
                {(historicalData.reduce((sum, d) => sum + d.efficiency, 0) / historicalData.length).toFixed(0)}%
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Eficiencia</Text>
              <Text style={[styles.summaryChange, { color: colors.success }]}>↑ 5% vs promedio</Text>
            </Animated.View>
          </View>
        </View>

        {/* Historical Chart */}
        <View style={[styles.chartSection, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Consumo Histórico</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Tendencia de consumo energético por{" "}
            {selectedPeriod === "today"
              ? "hora"
              : selectedPeriod === "week"
                ? "día"
                : selectedPeriod === "month"
                  ? "día del mes"
                  : "mes"}
          </Text>

          <View style={styles.chart}>
            <View style={styles.chartContainer}>
              {historicalData.map((item, index) => (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (item.consumption / maxConsumption) * 120,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                    {selectedPeriod === "today"
                      ? item.period.split(":")[0]
                      : selectedPeriod === "week"
                        ? item.period.split(" ")[1]
                        : selectedPeriod === "month"
                          ? item.period
                          : item.period.split(" ")[1]}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Consumo (W)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lab Consumption Ranking */}
        <View style={[styles.rankingSection, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ranking de Consumo por Laboratorio</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Laboratorios ordenados por consumo energético
          </Text>

          {labConsumptionData.map((lab, index) => (
            <Animated.View
              key={lab.id}
              style={[
                styles.rankingCard,
                { backgroundColor: colors.background, borderColor: colors.border },
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.rankingHeader}>
                <View style={styles.rankingPosition}>
                  <Text style={[styles.positionNumber, { color: colors.primary }]}>#{index + 1}</Text>
                </View>
                <View style={styles.rankingInfo}>
                  <Text style={[styles.rankingName, { color: colors.text }]}>{lab.name}</Text>
                  <Text style={[styles.rankingBuilding, { color: colors.textSecondary }]}>{lab.building}</Text>
                </View>
                <View style={styles.rankingStats}>
                  <Text style={[styles.consumptionValue, { color: colors.primary }]}>
                    {lab.consumption.toFixed(1)}W
                  </Text>
                  <Text style={[styles.efficiencyValue, { color: colors.success }]}>
                    {lab.efficiency.toFixed(0)}% eficiencia
                  </Text>
                </View>
              </View>

              <View style={styles.rankingDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {lab.activeLights}/{lab.totalLights} focos activos
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="speedometer-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {((lab.activeLights / lab.totalLights) * 100).toFixed(0)}% utilización
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((lab.consumption / Math.max(...labConsumptionData.map((l) => l.consumption))) * 100, 100)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={[styles.recommendationsSection, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recomendaciones de Optimización</Text>

          <View
            style={[styles.recommendationCard, { backgroundColor: colors.background, borderColor: colors.success }]}
          >
            <View style={[styles.recommendationIcon, { backgroundColor: colors.success }]}>
              <Ionicons name="leaf-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={[styles.recommendationTitle, { color: colors.text }]}>Ahorro Energético</Text>
              <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                Reducir la intensidad promedio en un 15% podría ahorrar hasta {(totalConsumption * 0.15).toFixed(1)}W
                por hora.
              </Text>
            </View>
          </View>

          <View
            style={[styles.recommendationCard, { backgroundColor: colors.background, borderColor: colors.warning }]}
          >
            <View style={[styles.recommendationIcon, { backgroundColor: colors.warning }]}>
              <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={[styles.recommendationTitle, { color: colors.text }]}>Horarios Óptimos</Text>
              <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                El pico de consumo es entre 10:00-14:00. Considera programar mantenimientos fuera de este horario.
              </Text>
            </View>
          </View>

          <View style={[styles.recommendationCard, { backgroundColor: colors.background, borderColor: colors.info }]}>
            <View style={[styles.recommendationIcon, { backgroundColor: colors.info }]}>
              <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={[styles.recommendationTitle, { color: colors.text }]}>Monitoreo Automático</Text>
              <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                Implementar sensores de presencia podría reducir el consumo en laboratorios vacíos hasta un 25%.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
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
    alignItems: "center" as const,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: FONTS.size.sm,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  periodSelector: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  selectorTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.md,
  },
  periodButtons: {
    flexDirection: "row" as const,
    gap: SIZES.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.borderRadiusSmall,
    alignItems: "center" as const,
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
  },
  summarySection: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.md,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.sm,
    marginBottom: SIZES.lg,
  },
  summaryGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: SIZES.md,
  },
  summaryCard: {
    width: (width - SIZES.lg * 2 - SIZES.md) / 2,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    alignItems: "center" as const,
    borderWidth: 1,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.md,
  },
  summaryNumber: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
    marginBottom: SIZES.xs,
  },
  summaryLabel: {
    fontSize: FONTS.size.sm,
    textAlign: "center" as const,
    marginBottom: SIZES.xs,
  },
  summaryChange: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium as any,
  },
  chartSection: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  chart: {
    height: 180,
  },
  chartContainer: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: SIZES.sm,
  },
  chartBar: {
    alignItems: "center" as const,
    flex: 1,
  },
  bar: {
    width: 16,
    marginBottom: SIZES.sm,
    borderRadius: 2,
  },
  barLabel: {
    fontSize: FONTS.size.xs,
    textAlign: "center" as const,
  },
  chartLegend: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    marginTop: SIZES.md,
  },
  legendItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: SIZES.xs,
  },
  legendText: {
    fontSize: FONTS.size.sm,
  },
  rankingSection: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  rankingCard: {
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  rankingHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.md,
  },
  rankingPosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 191, 216, 0.1)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: SIZES.md,
  },
  positionNumber: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold as any,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: 2,
  },
  rankingBuilding: {
    fontSize: FONTS.size.sm,
  },
  rankingStats: {
    alignItems: "flex-end" as const,
  },
  consumptionValue: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold as any,
    marginBottom: 2,
  },
  efficiencyValue: {
    fontSize: FONTS.size.xs,
  },
  rankingDetails: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: SIZES.md,
  },
  detailItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  detailText: {
    fontSize: FONTS.size.sm,
    marginLeft: SIZES.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden" as const,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  recommendationsSection: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  recommendationCard: {
    flexDirection: "row" as const,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: SIZES.md,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.xs,
  },
  recommendationText: {
    fontSize: FONTS.size.sm,
    lineHeight: 18,
  },
}
