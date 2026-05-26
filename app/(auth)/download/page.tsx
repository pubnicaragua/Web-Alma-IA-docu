"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  CloudArrowDownIcon,
  DevicePhoneMobileIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";

const APP_INFO = {
  name: "AlmaIA",
  version: "v1.0.0",
  description: (
    <>
      <p>
        <strong>AlmaIA</strong> es la <strong>aplicación inteligente</strong>{" "}
        diseñada para que colegios y familias puedan <strong>monitorear</strong>{" "}
        el <strong>estado emocional</strong> y la asistencia de los estudiantes
        en <strong>tiempo real</strong>.
      </p>
      <br />
      <p>
        Con un <strong>enfoque amigable</strong> y <strong>seguro</strong>,{" "}
        <strong>AlmaIA</strong> ayuda a <strong>detectar</strong> a tiempo
        cambios emocionales, generar <strong>alertas</strong> y entregar{" "}
        información útil a profesores, especialistas y apoderados.
      </p>
    </>
  ),
  Url: "https://almaia.cl/app-android-almaia-v1.0.apk",
  updatedAt: "2025-08-07",
  size: "72.3 MB",
  downloads: "12k",
  minAndroidVersion: "6.0",
  rating: 3.5,
  reviewsCount: 892,
};

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <StarIcon
        key={i}
        className={`w-5 h-5 ${i <= Math.floor(rating)
          ? "text-yellow-400"
          : i - rating <= 0.5
            ? "text-yellow-300"
            : "text-gray-300"
          }`}
      />
    );
  }
  return stars;
}

export default function AndroidDownload() {
  const [showTechnical, setShowTechnical] = useState(false);

  const [showQRAndroidModal, setShowQRAndroidModal] = useState<boolean>(false)
  const [showQRModal, setShowQRModal] = useState<boolean>(false)

  return (
    <div className="max-w-md mx-auto mt-4 p-8 bg-white rounded-3xl shadow-2xl relative">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
        >
          <div className="flex items-center gap-4 mb-6">
            <img
              src="/app_icon.png"
              alt="App icon"
              className="w-14 h-14 rounded-lg shadow"
            />
            <div className="flex flex-col">
              <h2 className="font-bold text-xl">{APP_INFO.name}</h2>
              <span className="text-xs text-gray-400">{APP_INFO.version}</span>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <CalendarDaysIcon className="w-4 h-4" />
                <time dateTime={APP_INFO.updatedAt}>
                  Actualizado:{" "}
                  {new Date(APP_INFO.updatedAt).toLocaleDateString()}
                </time>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-5">{APP_INFO.description}</p>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 gap-4 mb-5 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <CloudArrowDownIcon className="w-5 h-5 text-green-500" />
              <span>Tamaño: {APP_INFO.size}</span>
            </div>
            <div className="flex items-center gap-2">
              <CloudArrowDownIcon className="w-5 h-5 text-green-500" />
              <span>Descargas: {APP_INFO.downloads}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <DevicePhoneMobileIcon className="w-5 h-5 text-green-500" />
              <div>
                <p>Requiere Android {APP_INFO.minAndroidVersion} o superior</p>
                <p>Requiere iOS 13 o superior</p>
              </div>
            </div>
          </div>

          {/* Reseña con estrellas */}
          <div className="flex items-center mb-6 gap-2 text-yellow-400">
            {renderStars(APP_INFO.rating)}
            <span className="text-gray-600 text-sm ml-2">
              {APP_INFO.rating} ({APP_INFO.reviewsCount} opiniones)
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col items-center gap-4 mb-5">
            <div className="flex flex-wrap justify-center gap-4">
              {/* Botón de descarga Android */}
              <motion.a
                onClick={() => setShowQRAndroidModal(true)}
                download={`${APP_INFO.name}.apk`}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-full font-semibold bg-green-500 transition-all shadow-lg hover:bg-green-600"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-label={`Descargar ${APP_INFO.name} para Android`}
              >
                <svg width={"32"} height={"32"} fill="currentColor" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.35 12.653l2.496-4.323c0.044-0.074 0.070-0.164 0.070-0.26 0-0.287-0.232-0.519-0.519-0.519-0.191 0-0.358 0.103-0.448 0.257l-0.001 0.002-2.527 4.377c-1.887-0.867-4.094-1.373-6.419-1.373s-4.532 0.506-6.517 1.413l0.098-0.040-2.527-4.378c-0.091-0.156-0.259-0.26-0.45-0.26-0.287 0-0.519 0.232-0.519 0.519 0 0.096 0.026 0.185 0.071 0.262l-0.001-0.002 2.496 4.323c-4.286 2.367-7.236 6.697-7.643 11.744l-0.003 0.052h29.991c-0.41-5.099-3.36-9.429-7.57-11.758l-0.076-0.038zM9.098 20.176c-0 0-0 0-0 0-0.69 0-1.249-0.559-1.249-1.249s0.559-1.249 1.249-1.249c0.69 0 1.249 0.559 1.249 1.249v0c-0.001 0.689-0.559 1.248-1.249 1.249h-0zM22.902 20.176c-0 0-0 0-0 0-0.69 0-1.249-0.559-1.249-1.249s0.559-1.249 1.249-1.249c0.69 0 1.249 0.559 1.249 1.249v0c-0.001 0.689-0.559 1.248-1.249 1.249h-0z" />
                </svg>
                Descargar Android
              </motion.a>

              {/* Botón de descarga iOS */}
              <motion.a
                onClick={() => setShowQRModal(true)}
                download={`${APP_INFO.name}.ipa`}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-full font-semibold bg-blue-500 transition-all shadow-lg hover:bg-blue-600"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-label={`Descargar ${APP_INFO.name} para iOS`}
              >
                <svg width={"32"} height={"32"} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                </svg>
                Descargar iOS
              </motion.a>
            </div>

            {/* Botón de información técnica */}
            <motion.button
              onClick={() => setShowTechnical((v) => !v)}
              whileHover={{ scale: 1.04, backgroundColor: "#e0e7ff" }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1 px-4 py-2 rounded-full font-semibold bg-indigo-100 text-indigo-700 shadow hover:shadow-md transition"
              aria-expanded={showTechnical}
              aria-controls="technical-info"
            >
              <InformationCircleIcon className="w-5 h-5" />
              Información
            </motion.button>
          </div>

          {/* Barra de progreso: eliminado por no usar axios para descarga */}

          {/* Info técnica expandible */}
          <AnimatePresence>
            {showTechnical && (
              <motion.div
                id="technical-info"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden text-gray-700 bg-gray-50 rounded-lg p-4 mt-4 text-sm shadow-inner"
              >
                <p>
                  <strong>Nombre APP:</strong> {APP_INFO.name}
                </p>
                <p>
                  <strong>Tamaño:</strong> {APP_INFO.size}
                </p>
                <p>
                  <strong>Versión:</strong> {APP_INFO.version}
                </p>
                <p>
                  <strong>Última actualización:</strong>{" "}
                  {new Date(APP_INFO.updatedAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Requisitos mínimos:</strong> Android{" "}
                  {APP_INFO.minAndroidVersion}
                  <p>Requiere iOS 13 o superior</p>
                </p>
                <p>
                  <strong>Descargas totales:</strong> {APP_INFO.downloads}
                </p>
                <p>APP Android/iOS firmada digitalmente y libre de virus.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Descargar AlmaIA para iOS
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4">
            <p className="text-sm text-gray-600 text-center">
              Escanea este código QR con tu dispositivo iOS para descargar la aplicación
            </p>
            <div className="bg-white p-4 rounded-lg shadow-inner border">
              <img
                src="/qr-ios.png"
                alt="Código QR para descargar AlmaIA iOS"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Compatible con iOS 13 o superior
            </p>
            <div> 
              <a
                target="_blank"
                href="https://expo.dev/artifacts/eas/83LyqUUVEtF58iUxsFyujf.ipa"
                className="flex items-center gap-2 px-6 py-3 text-white rounded-full font-semibold bg-blue-500 transition-all shadow-lg hover:bg-blue-600"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Descargar 
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showQRAndroidModal} onOpenChange={setShowQRAndroidModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Descargar AlmaIA para Android
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4">
            <p className="text-sm text-gray-600 text-center">
              Escanea este código QR con tu dispositivo android para descargar la aplicación
            </p>
            <div className="bg-white p-4 rounded-lg shadow-inner border">
              <img
                src="/qr-android.png"
                alt="Código QR para descargar AlmaIA iOS"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Compatible con android 6.0 o superior
            </p>
            <div>
              <a
                target="_blank"
                href="https://expo.dev/accounts/dxgabalt/projects/almaia/builds/bc03fd7a-3b1d-48e8-9fec-2b93fd9454e9"
                className="flex items-center gap-2 px-6 py-3 text-white rounded-full font-semibold bg-blue-500 transition-all shadow-lg hover:bg-blue-600"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Descargar
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
