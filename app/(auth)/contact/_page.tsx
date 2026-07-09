"use client";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form/form-error";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactUsSchema } from "@/zod/contact";
import { ContactUsSchemaType } from "@/types/contact";
import { ActionSendContact } from "@/actions/contact";
import { ReCaptchaInput, type ReCaptchaInputRef } from "@/components/ui/recaptcha";

export default function ContactForm() {

  const { toast } = useToast();
  const captchRef = useRef<ReCaptchaInputRef>(null);

  const form = useForm<ContactUsSchemaType>({
    resolver: zodResolver(ContactUsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      captcha: "",
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = form;

  const onSubmit = async (data: ContactUsSchemaType) => {
    try {
      const response = await ActionSendContact(data);
      toast({
        title: "Mensaje enviado",
        description: response.message || "Gracias por contactarnos. Te responderemos a la brevedad.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error)?.message || "Ha ocurrido un error al enviar el mensaje.",
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
        <ReCaptchaInput
          ref={captchRef}
          onChange={(token: string | null) => setValue("captcha", token ?? "")}
        />

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
