"use client"

import { useState } from "react"
import { Check, User } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"

interface StudentHeaderProps {
  student: {
    name: string
    age?: number
    course: string
    status: string
    image: string
  }
}

export function StudentHeader({ student }: StudentHeaderProps) {
  const [showOptions, setShowOptions] = useState(false)
  const isMobile = useIsMobile()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Bien":
        return "bg-green-500 hover:bg-green-600"
      case "Normal":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "Mal":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-green-500 hover:bg-green-600"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-100 bg-gray-100 flex items-center justify-center">
            {student.image && student.image !== "" && !student.image.includes("placeholder.svg") ? (
              <Image
                src={student.image}
                alt={student.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
            <div className="flex gap-2 items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                {student.course}
              </span>
              {student.age && (
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {student.age} años
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            className={`${getStatusColor(student.status)} text-white font-medium rounded-md w-10 h-10 flex items-center justify-center transition-colors`}
            onClick={() => setShowOptions(!showOptions)}
            aria-label="Estado del estudiante"
          >
            <Check className="w-5 h-5" />
          </button>

          {showOptions && (
            <div className="absolute mt-2 right-0 bg-white rounded-md shadow-sm z-10 border border-gray-200">
              <div className="py-1">
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Bien
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Normal
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Mal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
