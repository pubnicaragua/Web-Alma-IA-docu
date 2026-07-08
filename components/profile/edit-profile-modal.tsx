"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Check,
  ChevronDown,
  Loader2,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ProfileData } from "@/services/profile-service";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  getPhoneCountryByCode,
  PHONE_COUNTRIES,
  type PhoneCountry,
} from "@/lib/phone-countries";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

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
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement | null>(null);
  const countrySearchInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(
    getPhoneCountryByCode(DEFAULT_PHONE_COUNTRY_CODE)
  );
  const [phoneNationalNumber, setPhoneNationalNumber] = useState("");

  // Close country dropdown when clicking outside
  useEffect(() => {
    if (!countryOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setCountryOpen(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [countryOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (countryOpen && countrySearchInputRef.current) {
      setTimeout(() => countrySearchInputRef.current?.focus(), 50);
    }
  }, [countryOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData(profileData);
      setFotoPerfilBase64(null);
      setPreviewImg(profileData.url_foto_perfil || null);
      const rawPhone = String(profileData.telefono_contacto ?? "").trim();
      if (rawPhone) {
        try {
          const parsed = parsePhoneNumberFromString(rawPhone);
          if (parsed?.country && parsed.nationalNumber) {
            const country = getPhoneCountryByCode(
              parsed.country as CountryCode
            );
            setSelectedCountry(country);
            setPhoneNationalNumber(parsed.nationalNumber);
          } else {
            // Could not parse (too short, no country prefix, etc.)
            // Keep raw digits as the national number
            setSelectedCountry(
              getPhoneCountryByCode(DEFAULT_PHONE_COUNTRY_CODE)
            );
            setPhoneNationalNumber(rawPhone.replace(/\D/g, ""));
          }
        } catch {
          // Parsing failed entirely – fallback to raw digits
          setSelectedCountry(
            getPhoneCountryByCode(DEFAULT_PHONE_COUNTRY_CODE)
          );
          setPhoneNationalNumber(rawPhone.replace(/\D/g, ""));
        }
      } else {
        setSelectedCountry(getPhoneCountryByCode(DEFAULT_PHONE_COUNTRY_CODE));
        setPhoneNationalNumber("");
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setErrors({});
    }
  }, [isOpen, profileData]);

  const validateField = (name: string, value: string) => {
    let error = "";
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
    }
    return error;
  };

  const buildPhoneValue = useCallback(
    (digits: string, country: PhoneCountry) => {
      if (!digits) return "";
      return `+${country.dialCode}${digits}`;
    },
    []
  );

  const validatePhone = useCallback(
    (digits: string, country: PhoneCountry) => {
      if (!digits.trim()) {
        return "El teléfono es requerido";
      }
      if (!/^\d+$/.test(digits)) {
        return "Solo se permiten números";
      }
      const parsed = parsePhoneNumberFromString(digits, country.code);
      if (!parsed || !parsed.isPossible()) {
        return `Número inválido para ${country.name}`;
      }
      return "";
    },
    []
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setPhoneNationalNumber(digits);
    const nextValue = buildPhoneValue(digits, selectedCountry);
    const error = validatePhone(digits, selectedCountry);
    setErrors((prev) => ({
      ...prev,
      telefono_contacto: error || undefined,
    }));
    setFormData((prev) => ({
      ...prev,
      telefono_contacto: nextValue,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const value = e.target.value;
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

  const handleCountrySelect = (country: PhoneCountry) => {
    setSelectedCountry(country);
    setCountryOpen(false);
    setCountrySearch("");
    const nextValue = buildPhoneValue(phoneNationalNumber, country);
    const error = phoneNationalNumber
      ? validatePhone(phoneNationalNumber, country)
      : "";
    setErrors((prev) => ({
      ...prev,
      telefono_contacto: error || undefined,
    }));
    setFormData((prev) => ({
      ...prev,
      telefono_contacto: nextValue,
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
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, String(formData[field] ?? ""));
      if (error) {
        newErrors[field as keyof FormErrors] = error;
        isValid = false;
      }
    });

    const phoneError = validatePhone(phoneNationalNumber, selectedCountry);
    if (phoneError) {
      newErrors.telefono_contacto = phoneError;
      isValid = false;
    }

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
        telefono_contacto: buildPhoneValue(
          phoneNationalNumber,
          selectedCountry
        ),
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
        className="sm:max-w-[600px] p-0"
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

            <div className="space-y-2 md:col-span-2">
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
                {/* Unified phone input: country selector + number */}
                <div className="relative" ref={countryDropdownRef}>
                  <div
                    className={cn(
                      "flex items-center rounded-md border bg-background transition-colors",
                      errors.telefono_contacto
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                    )}
                  >
                    {/* Country code trigger */}
                    <button
                      type="button"
                      onClick={() => setCountryOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 border-r px-3 py-2 text-sm hover:bg-muted/50 transition-colors rounded-l-md shrink-0"
                    >
                      <span className="font-medium text-foreground">
                        +{selectedCountry?.dialCode ?? ""}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-muted-foreground transition-transform",
                          countryOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {/* Phone number input */}
                    <input
                      id="telefono_contacto"
                      name="telefono_contacto"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Número de teléfono"
                      value={phoneNationalNumber}
                      onChange={handlePhoneChange}
                      onBlur={() => {
                        const error = validatePhone(
                          phoneNationalNumber,
                          selectedCountry
                        );
                        setErrors((prev) => ({
                          ...prev,
                          telefono_contacto: error || undefined,
                        }));
                      }}
                      className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Inline country dropdown (no Portal — stays inside Dialog) */}
                  {countryOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-full max-w-sm rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                      {/* Search */}
                      <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                          ref={countrySearchInputRef}
                          type="text"
                          placeholder="Buscar país..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        {countrySearch && (
                          <button
                            type="button"
                            onClick={() => setCountrySearch("")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {/* Country list */}
                      <div className="max-h-[200px] overflow-y-auto overscroll-contain py-1">
                        {(() => {
                          const searchLower = countrySearch.toLowerCase().trim();
                          const filtered = searchLower
                            ? PHONE_COUNTRIES.filter(
                                (c) =>
                                  c.name.toLowerCase().includes(searchLower) ||
                                  c.dialCode.includes(searchLower) ||
                                  c.code.toLowerCase().includes(searchLower)
                              )
                            : PHONE_COUNTRIES;

                          if (filtered.length === 0) {
                            return (
                              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                No se encontraron países.
                              </div>
                            );
                          }

                          return filtered.map((country) => (
                            <button
                              type="button"
                              key={country.code}
                              onClick={() => handleCountrySelect(country)}
                              className={cn(
                                "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                selectedCountry?.code === country.code &&
                                  "bg-accent/50 font-medium"
                              )}
                            >
                              <Check
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0",
                                  selectedCountry?.code === country.code
                                    ? "opacity-100 text-primary"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">{country.name}</span>
                              <span className="ml-auto text-xs text-muted-foreground shrink-0">
                                +{country.dialCode}
                              </span>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
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
