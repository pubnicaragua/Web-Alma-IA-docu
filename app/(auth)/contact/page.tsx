"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactUsSchema } from "@/app/zod/contact";
import { ContactUsSchemaType } from "@/types/contact";

export default function ContactForm() {
  const { toast } = useToast();

  // useForm usando zod
  const form = useForm<ContactUsSchemaType>({
    resolver: zodResolver(ContactUsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      captcha: false,
    },
  });

  // Desestructuracion del form
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = form;

  const isCaptchaChecked = watch("captcha");

  // Funcion de submit 
  const onSubmit = async (data: ContactUsSchemaType) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contacto/almaia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.name,
          email: data.email,
          telefono: data.phone,
        }),
      });

      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos a la brevedad.",
      });

      reset(); // Limpiar formulario
    } catch (err) {
      toast({
        title: "Error",
        description: "Error enviando el mensaje. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-md max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Contáctanos</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Nombre */}
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Nombre"
            {...register("name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Correo electrónico"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Input
            type="tel"
            placeholder="Teléfono"
            {...register("phone")}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* Captcha */}
        <div className="border rounded-md p-3 flex items-center space-x-3">
          <Checkbox
            id="captcha"
            {...register("captcha")}
            disabled={isSubmitting}
          />
          <Label htmlFor="captcha">No soy un robot</Label>
        </div>
        {errors.captcha && (
          <p className="text-red-500 text-sm">{errors.captcha.message}</p>
        )}

        {/* Botón */}
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar mensaje"}
        </Button>
      </form>
    </div>
  );
}
