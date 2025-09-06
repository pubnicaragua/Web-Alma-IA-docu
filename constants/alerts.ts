
export const ALERT_TYPES = {
    1: "SOS Alma",
    2: "Alerta amarilla",
    3: "Alerta Naranja",
    4: "Denuncia",
    5: "Alerta General",
}

export const ALERT_PRIORITIES = {
    1: "Baja",
    2: "Media",
    3: "Alta",
    4: "Critica",
}

export const ALERT_PRIORITIES_CLASS = {
    "alta": "border-red-500 text-red-500",
    "media": "border-yellow-500 text-yellow-500",
    "baja": "border-green-500 text-green-500",
    "crítica": "border-pink-600 text-pink-600",
    "critica": "border-pink-600 text-pink-600"
};

export const ALERT_SEVERITY_CLASS = {
    "pendiente": "border-red-500 text-red-500",
    "asignada": "border-yellow-500 text-yellow-500",
    "en proceso": "border-blue-500 text-blue-500",
    "resuelta": "border-green-500 text-green-500",
    "cerrada": "border-gray-500 text-gray-500",
    "anulada": "border-gray-400 text-gray-400",
}
