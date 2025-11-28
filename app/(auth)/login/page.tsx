"use client";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import ReCAPTCHA from "react-google-recaptcha";
import { removeAuthToken, setAuthToken } from "@/lib/api-config";
import { fetchUserProfile } from "@/services/profile-service";
import { ReCaptchaInput } from "@/components/ui/recaptcha";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLoginSchema } from "@/zod/auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthActionResponse, AuthLoginSchemaType } from "@/types/auth";
import { ActionMakeLogin } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AuthLoginSchemaType>({
    resolver: zodResolver(AuthLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      captcha: "",
      rememberMe: false
    },
  })

  // Estados
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const captchRef = useRef<HTMLDivElement>(null);

  const onSubmit = useCallback(async (values: AuthLoginSchemaType) => {
    console.log('[LOGIN] Enviando credenciales:', { email: values.email, password: '***' });

    const response = await ActionMakeLogin(values);
    console.log('[LOGIN] Respuesta del servidor:', response);

    if (response.status === 'error') {
      form.resetField('password');
      form.resetField('captcha');
      setError(response.message);
      toast({
        title: response.title || "Error de inicio de sesión",
        description: response.message || "Error desconocido al iniciar sesión",
        variant: "destructive",
      });
      return;
    }

    const { data } = response as unknown as AuthActionResponse;
    setAuthToken(data?.token);
    localStorage.setItem("isAuthenticated", "true");

    try {
      await fetchUserProfile();
    } catch (error) {
      removeAuthToken();
      localStorage.setItem("isAuthenticated", "false");
      return;
    }

    // Mostrar notificación de éxito
    toast({
      title: "Inicio de sesión exitoso",
      description: "Has iniciado sesión correctamente. Redirigiendo...",
    });

    // Redirección a la página de selección de colegio
    router.push("/select-school");
  }, []);

  return (
    <div className="bg-white rounded-lg p-8 shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Inicia sesión</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4 text-sm">
          <p className="font-medium mb-1">No se pudo iniciar sesión</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Correo electrónico o usuario"
            {...form.register("email", { required: true })}
          />
        </div>

        <div className="space-y-2 ">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              {...form.register("password", { required: true })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <ReCaptchaInput
          ref={captchRef}
          onChange={(token: string | null) => form.setValue("captcha", token ?? "")}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              {...form.register("rememberMe")}
              checked={form.watch("rememberMe")}
              onCheckedChange={(checked) => {
                form.setValue("rememberMe", checked as boolean);
              }}
            />
            <Label htmlFor="remember" className="text-sm">
              Recuérdame
            </Label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Iniciando sesión..." : "Ingresar"}
        </Button>
        {/* Nuevo bloque pregunta y botón */}
        {/* <div className="flex items-center justify-between mb-6 px-2">
          <p className="text-gray-700 text-base font-medium">
            ¿Quieres llegar a nosotros?
          </p>
          <Button onClick={handleContactClick} variant="outline">
            Contáctanos
          </Button>
        </div> */}
      </form>
    </div>
  );
}
