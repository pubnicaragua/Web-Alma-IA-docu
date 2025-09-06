"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { EnvelopeIcon, InboxIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupportFormSchema } from "@/zod/support";
import type { SupportFormSchemaType } from "@/types/support";
import { ReCaptchaInput } from "@/components/ui/recaptcha";
import ReCAPTCHA from "react-google-recaptcha";
import { ActionSendSupport } from "@/actions/support";
import { FormError } from "@/components/form/form-error";

export default function SupportContact() {

  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const captchRef = useRef<ReCAPTCHA>(null);

  const { register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(SupportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      captcha: "",
    },
  });

  const onSubmit = async (data: SupportFormSchemaType) => {
    try {
      await ActionSendSupport(data);
      reset();
      setSent(true);
    } catch (err) {
      toast({
        title: "¡Atención!",
        description: (err as Error)?.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-4 p-10 bg-white rounded-3xl shadow-2xl relative">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          Contacta con Soporte
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tu nombre completo"
            />
            <FormError message={errors?.name?.message} />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="tu@mail.com"
            />
            <FormError message={errors?.email?.message} />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Asunto
            </label>
            <input
              id="subject"
              type="text"
              {...register("subject")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Asunto del mensaje"
            />
            <FormError message={errors?.subject?.message} />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Mensaje
            </label>
            <textarea
              id="message"
              {...register("message")}
              rows={5}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Escribe aquí tu mensaje de soporte..."
            />
            <FormError message={errors?.message?.message} />
          </div>

          <ReCaptchaInput
            ref={captchRef}
            onChange={(token: string | null) => setValue("captcha", token ?? "")}
          />

          {sent && (
            <p className="text-green-600 text-sm">Mensaje enviado con éxito.</p>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05, backgroundColor: "#4f46e5" }}
            whileTap={{ scale: 0.95 }}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white rounded-full shadow-lg transition ${isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600"
              }`}
          >
            <InboxIcon className="w-5 h-5" />
            {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-blue-700 text-sm">
          <EnvelopeIcon className="inline w-5 h-5 mr-2" />
          Soporte@almaia.cl
        </div>
      </motion.div>
    </div>
  );
}
