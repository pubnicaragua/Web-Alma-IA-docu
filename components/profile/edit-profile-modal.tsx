"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Trash2, User, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ProfileData } from "@/services/profile-service";
import { cn } from "@/lib/utils";

interface FormErrors {
  nombre_social?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  fecha_nacimiento?: string;
  numero_documento?: string;
  telefono_contacto?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onSave: (
    data: ProfileData & { foto_perfil_base64?: string | null }
  ) => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profileData,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileData>(profileData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [fotoPerfilBase64, setFotoPerfilBase64] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(profileData);
      setFotoPerfilBase64(null);
      setPreviewImg(profileData.url_foto_perfil || null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setErrors({});
    }
  }, [isOpen, profileData]);

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "telefono_contacto") {
      if (!value.trim()) {
        return "El telefono es requerido";
      }
      if (!/^\d+$/.test(value)) {
        return "Solo se permiten numeros";
      }
      return error;
    }

    switch (name) {
      case "nombre_social":
      case "nombres":
      case "apellidos":
      case "numero_documento":
        if (!value.trim()) error = "Este campo es requerido";
        break;
      case "email":
        if (!value.trim()) {
          error = "El correo es requerido";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Correo electrónico inválido";
        }
        break;
      case "fecha_nacimiento":
        if (!value.trim()) error = "La fecha de nacimiento es requerida";
        break;
      case "telefono_contacto":
        if (!value.trim()) error = "El teléfono es requerido";
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const value =
      name === "telefono_contacto"
        ? e.target.value.replace(/\D/g, "")
        : e.target.value;
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error || undefined,
    }));
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFotoPerfilBase64(result);
        setPreviewImg(result);
      };
      reader.readAsDataURL(file);
    } else {
      setFotoPerfilBase64(null);
      setPreviewImg(formData.url_foto_perfil || null);
    }
  };

  const handleRemoveProfileImage = () => {
    setFotoPerfilBase64(null);
    setPreviewImg(null);
    setFormData((prev) => ({
      ...prev,
      url_foto_perfil: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Campos obligatorios
    const requiredFields: Array<keyof ProfileData> = [
      "nombre_social",
      "nombres",
      "apellidos",
      "email",
      "fecha_nacimiento",
      "numero_documento",
      "telefono_contacto",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, String(formData[field] ?? ""));
      if (error) {
        newErrors[field as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      let dataToSend: ProfileData & { foto_perfil_base64?: string | null } = {
        ...formData,
        nombre_social: String(formData.nombre_social ?? "").trim(),
        nombres: String(formData.nombres ?? "").trim(),
        apellidos: String(formData.apellidos ?? "").trim(),
        numero_documento: String(formData.numero_documento ?? "").trim(),
        telefono_contacto: String(formData.telefono_contacto ?? "").trim(),
      };

      if (fotoPerfilBase64 !== null) {
        dataToSend.url_foto_perfil = fotoPerfilBase64;
      } else if (formData.url_foto_perfil) {
        dataToSend.url_foto_perfil = formData.url_foto_perfil;
      }
      await onSave(dataToSend);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[600px] p-0 overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </button>
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-lg font-semibold">
              Editar perfil
            </DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="nombres">Nombres*</Label>
                  {errors.nombres && (
                    <span className="text-xs text-red-500">
                      {errors.nombres}
                    </span>
                  )}
                </div>
                <Input
                  id="nombres"
                  name="nombres"
                  value={formData.nombres || ""}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors((prev) => ({ ...prev, nombres: error }));
                  }}
                  className={cn(
                    errors.nombres &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="apellidos">Apellidos*</Label>
                  {errors.apellidos && (
                    <span className="text-xs text-red-500">
                      {errors.apellidos}
                    </span>
                  )}
                </div>
                <Input
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos || ""}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors((prev) => ({ ...prev, apellidos: error }));
                  }}
                  className={cn(
                    errors.apellidos &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="nombre_social">Nombre social*</Label>
                  {errors.nombre_social && (
                    <span className="text-xs text-red-500">
                      {errors.nombre_social}
                    </span>
                  )}
                </div>
                <Input
                  id="nombre_social"
                  name="nombre_social"
                  value={formData.nombre_social || ""}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors((prev) => ({ ...prev, nombre_social: error }));
                  }}
                  className={cn(
                    errors.nombre_social &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="email">Correo electrónico*</Label>
                  {errors.email && (
                    <span className="text-xs text-red-500">{errors.email}</span>
                  )}
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  disabled
                  aria-disabled="true"
                  className={cn(
                    "bg-gray-100 text-gray-600 cursor-not-allowed",
                    errors.email && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="numero_documento">Numero de documento*</Label>
                  {errors.numero_documento && (
                    <span className="text-xs text-red-500">
                      {errors.numero_documento}
                    </span>
                  )}
                </div>
                <Input
                  id="numero_documento"
                  name="numero_documento"
                  value={formData.numero_documento || ""}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      numero_documento: error,
                    }));
                  }}
                  className={cn(
                    errors.numero_documento &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="fecha_nacimiento">Fecha de nacimiento*</Label>
                  {errors.fecha_nacimiento && (
                    <span className="text-xs text-red-500">
                      {errors.fecha_nacimiento}
                    </span>
                  )}
                </div>
                <Input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento || ""}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      fecha_nacimiento: error,
                    }));
                  }}
                  className={cn(
                    errors.fecha_nacimiento &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="telefono_contacto">
                    Teléfono de contacto*
                  </Label>
                  {errors.telefono_contacto && (
                    <span className="text-xs text-red-500">
                      {errors.telefono_contacto}
                    </span>
                  )}
                </div>
                <Input
                  id="telefono_contacto"
                  name="telefono_contacto"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.telefono_contacto || ""}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      telefono_contacto: error,
                    }));
                  }}
                  className={cn(
                    errors.telefono_contacto &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Input
                ref={fileInputRef}
                id="foto_perfil_file"
                name="foto_perfil_file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
              <button
                type="button"
                aria-label="Cambiar foto de perfil"
                title="Cambiar foto de perfil"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-blue-200 bg-slate-100 shadow-sm transition hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-11 w-11 text-slate-400" />
                )}
                <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-blue-600 text-white shadow-sm">
                  <Camera className="h-4 w-4" />
                </span>
              </button>
              {previewImg && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Eliminar foto"
                  title="Eliminar foto"
                  onClick={handleRemoveProfileImage}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="border-t px-6 py-4">
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
