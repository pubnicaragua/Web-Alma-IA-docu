"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form/form-error";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactUsSchema } from "@/app/zod/contact";
import { ContactResponse, ContactUsSchemaType } from "@/types/contact";
import { useAxios } from "@/hooks/use-axios";

export default function ContactForm() {

  const { toast } = useToast();

  const form = useForm<ContactUsSchemaType>({
    resolver: zodResolver(ContactUsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      captcha: false as any,
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = form;
  const axios = useAxios<ContactResponse>();

  const isCaptchaChecked = watch("captcha");

  // Funcion de submit 
  const onSubmit = async (data: ContactUsSchemaType) => {
    ///contacto/almaia
    try {
      await axios.execute(() => window.axios.post<ContactResponse>("/contacto/almaia", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        captcha: true,
      }));
      toast({
        title: "Mensaje enviado",
        description: axios.data?.message || "Gracias por contactarnos. Te responderemos a la brevedad.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: axios.error,
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
          <FormError message={errors.name?.message} />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Correo electrónico"
            {...register("email")}
            disabled={isSubmitting}
          />
          <FormError message={errors.email?.message} />
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Input
            type="tel"
            placeholder="Teléfono"
            {...register("phone")}
            disabled={isSubmitting}
          />
          <FormError message={errors.phone?.message} />
        </div>

        {/* Captcha */}
        <div className="border rounded-md p-3 flex items-center space-x-3">
          <Checkbox
            id="captcha"
            // de momento deje register(captcha) en lo que se obtengo el componente de recaptcha
            {...register("captcha")}
            disabled={isSubmitting}
          />
          <Label htmlFor="captcha">No soy un robot</Label>
        </div>
        <FormError message={errors.captcha?.message} />
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
