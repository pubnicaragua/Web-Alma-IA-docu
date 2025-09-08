"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { setAuthToken } from "@/lib/api-config";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Efecto para manejar la redirección después de un registro exitoso
  useEffect(() => {
    if (registerSuccess) {
      // Pequeño retraso para asegurar que el toast se muestre antes de la redirección
      const redirectTimer = setTimeout(() => {
        router.push("/");
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [registerSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor, completa todos los campos");
      toast({
        title: "Error de registro",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      toast({
        title: "Error de registro",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      toast({
        title: "Error de registro",
        description: "Debes aceptar los términos y condiciones",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Realizar la petición de registro al servidor
      const response = await fetch("/api/proxy/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Extraer el mensaje de error del servidor
        const errorMessage =
          data.error || data.message || "Error al registrarse";
        throw new Error(errorMessage);
      }

      // Si el registro es exitoso y devuelve un token
      if (data.token) {
        // Guardar el token en localStorage
        setAuthToken(data.token);

        // Mostrar notificación de éxito
        toast({
          title: "Registro exitoso",
          description:
            "Tu cuenta ha sido creada correctamente. Redirigiendo...",
        });

        // Marcar el registro como exitoso para activar la redirección
        setRegisterSuccess(true);
      } else {
        // Si el registro es exitoso pero no devuelve un token, redirigir a login
        toast({
          title: "Registro exitoso",
          description:
            "Tu cuenta ha sido creada correctamente. Por favor, inicia sesión.",
        });

        // Redirigir a login después de un breve retraso
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido al registrarse";
      setError(errorMessage);

      // Mostrar notificación de error
      toast({
        title: "Error de registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Crear cuenta</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <div className="space-y-2 relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm">
            Acepto los{" "}
            <Link href="/terms" className="text-blue-500 hover:underline">
              términos y condiciones
            </Link>
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "Creando cuenta..." : "Registrarse"}
        </Button>

        <div className="text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
}
