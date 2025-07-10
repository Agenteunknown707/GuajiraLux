"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { MOCK_LABS, MOCK_PRACTICES } from "../constants/Data"

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
  floor: string
  room: string
  capacity: number
  isActive: boolean
  activeTeacher: string | null
  lights: Light[]
}

interface Practice {
  id: string
  name: string
  description: string
  color: string
  intensity: number
  isCustom: boolean
}

interface LabContextType {
  labs: Lab[]
  practices: Practice[]
  updateLab: (labId: string, updates: Partial<Lab>) => void
  updateLight: (labId: string, lightId: string, updates: Partial<Light>) => void
  activateLab: (labId: string, teacherId: string) => boolean
  deactivateLab: (labId: string) => void
  addPractice: (practice: Omit<Practice, "id">) => void
  deletePractice: (practiceId: string) => void
  getEnergyConsumption: (labId?: string) => number
}

const LabContext = createContext<LabContextType | undefined>(undefined)

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [labs, setLabs] = useState<Lab[]>(MOCK_LABS)
  const [practices, setPractices] = useState<Practice[]>(MOCK_PRACTICES)

  useEffect(() => {
    loadStoredData()
  }, [])

  const loadStoredData = async () => {
    try {
      const storedLabs = await AsyncStorage.getItem("labs")
      const storedPractices = await AsyncStorage.getItem("practices")

      if (storedLabs) {
        setLabs(JSON.parse(storedLabs))
      }
      if (storedPractices) {
        setPractices(JSON.parse(storedPractices))
      }
    } catch (error) {
      console.error("Error loading stored data:", error)
    }
  }

  const saveData = async (newLabs: Lab[], newPractices: Practice[]) => {
    try {
      await AsyncStorage.setItem("labs", JSON.stringify(newLabs))
      await AsyncStorage.setItem("practices", JSON.stringify(newPractices))
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  const updateLab = (labId: string, updates: Partial<Lab>) => {
    const newLabs = labs.map((lab) => (lab.id === labId ? { ...lab, ...updates } : lab))
    setLabs(newLabs)
    saveData(newLabs, practices)
  }

  const updateLight = (labId: string, lightId: string, updates: Partial<Light>) => {
    const newLabs = labs.map((lab) => {
      if (lab.id === labId) {
        const newLights = lab.lights.map((light) => (light.id === lightId ? { ...light, ...updates } : light))
        return { ...lab, lights: newLights }
      }
      return lab
    })
    setLabs(newLabs)
    saveData(newLabs, practices)
  }

  const activateLab = (labId: string, teacherId: string): boolean => {
    const lab = labs.find((l) => l.id === labId)
    if (lab && lab.isActive && lab.activeTeacher !== teacherId) {
      return false // Lab ya está activo por otro docente
    }

    const newLabs = labs.map((l) => (l.id === labId ? { ...l, isActive: true, activeTeacher: teacherId } : l))
    setLabs(newLabs)
    saveData(newLabs, practices)
    return true
  }

  const deactivateLab = (labId: string) => {
    const newLabs = labs.map((lab) => {
      if (lab.id === labId) {
        const newLights = lab.lights.map((light) => ({ ...light, isOn: false }))
        return { ...lab, isActive: false, activeTeacher: null, lights: newLights }
      }
      return lab
    })
    setLabs(newLabs)
    saveData(newLabs, practices)
  }

  const addPractice = (practice: Omit<Practice, "id">) => {
    const newPractice = {
      ...practice,
      id: `practice_${Date.now()}`,
      isCustom: true,
    }
    const newPractices = [...practices, newPractice]
    setPractices(newPractices)
    saveData(labs, newPractices)
  }

  const deletePractice = (practiceId: string) => {
    const newPractices = practices.filter((p) => p.id !== practiceId)
    setPractices(newPractices)
    saveData(labs, newPractices)
  }

  const getEnergyConsumption = (labId?: string): number => {
    const targetLabs = labId ? labs.filter((l) => l.id === labId) : labs

    return targetLabs.reduce((total, lab) => {
      return (
        total +
        lab.lights.reduce((labTotal, light) => {
          if (!light.isOn) return labTotal

          // Simular consumo basado en intensidad y color
          const baseConsumption = 10 // Watts base
          const intensityFactor = light.intensity / 100
          const colorFactor = light.color === "#FFFFFF" ? 1 : 1.2 // RGB consume más

          return labTotal + baseConsumption * intensityFactor * colorFactor
        }, 0)
      )
    }, 0)
  }

  return (
    <LabContext.Provider
      value={{
        labs,
        practices,
        updateLab,
        updateLight,
        activateLab,
        deactivateLab,
        addPractice,
        deletePractice,
        getEnergyConsumption,
      }}
    >
      {children}
    </LabContext.Provider>
  )
}

export const useLab = () => {
  const context = useContext(LabContext)
  if (context === undefined) {
    throw new Error("useLab must be used within a LabProvider")
  }
  return context
}
