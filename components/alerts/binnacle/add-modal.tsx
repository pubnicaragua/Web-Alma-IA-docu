"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModal } from "@/lib/modal-utils";
import {
  ApiAlertPriority,
  ApiAlertSeverity,
  fetchPrority,
  fetchSeverity,
  fetchStates,
  fetchBitacoraUsers,
  updateAlertAndBitacora,
  PowerUser,
  AlertPagev1,
} from "@/services/alerts-service";
import { useToast } from "@/hooks/use-toast";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertAddBinnacleSchema } from "@/zod/alerts";
import { FormError } from "@/components/form/form-error";
import { AlertAddBinnacleSchemaType } from "@/types/alerts";
import { format, parseISO } from "date-fns";

interface AddActionModalProps {
  alertData: AlertPagev1;
  setRefresh: () => void;
}

interface AlertState {
  alerta_estado_id: number;
  nombre_alerta_estado: string;
  creado_por: number;
  fecha_creacion: string;
  actualizado_por: number;
  fecha_actualizacion: string;
  activo: boolean;
}

export function AddActionModal({ alertData, setRefresh }: AddActionModalProps) {

  const [prioridades, setPrioridades] = useState<ApiAlertPriority[]>([]);
  const [severidades, setSeveridades] = useState<ApiAlertSeverity[]>([]);
  const [alertStates, setAlertStates] = useState<AlertState[]>([]);
  const [powerUsers, setPowerUsers] = useState<PowerUser[]>([]);

  const { isOpen, onOpen, onClose } = useModal(false);

  const form = useForm<AlertAddBinnacleSchemaType>({
    resolver: zodResolver(AlertAddBinnacleSchema),
    defaultValues: {
      planAccion: "",
      fechaCompromiso: undefined,
      fechaRealizacion: undefined,
      archivo: undefined,
      responsableName: "",
      prioridad: "",
      severidad: "",
      selectedEstado: "",
    }
  })

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async function () {
      const [prioridadesData, severidadesData, bitacoraUsers, loadstates] =
        await Promise.all([
          fetchPrority(),
          fetchSeverity(),
          fetchBitacoraUsers(),
          fetchStates(),
        ]);

      if (bitacoraUsers.length > 0) {
        form.setValue("responsableName", bitacoraUsers[0].personas.persona_id.toString());
      }
      setPowerUsers(bitacoraUsers);
      setPrioridades(prioridadesData);
      setSeveridades(severidadesData);
      setAlertStates(loadstates);
    })();
  }, []);

  useEffect(() => {
    if (!alertData) return;
    form.setValue("selectedEstado", alertData.estado);
    form.setValue("prioridad", alertData.prioridad_id.toString());
    form.setValue("severidad", alertData.severidad_id.toString());
  }, [alertData]);


  // Convierte archivo a base64 con prefijo MIME
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject("Error leyendo archivo");
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        const prefix = `data:${file.type};base64,`;
        resolve(prefix + base64);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (values: AlertAddBinnacleSchemaType) => {
    setIsLoading(true);
    try {
      const bitacoraData = {
        alumno_alerta_id: alertData.alumno_alerta_id,
        alumno_id: alertData.alumno.alumno_id,
        plan_accion: values.planAccion,
        fecha_compromiso: format(values.fechaCompromiso, "yyyy-MM-dd"),
        fecha_realizacion: format(values.fechaRealizacion, "yyyy-MM-dd"),
        archivo: values.archivo ? await fileToBase64(values.archivo) : null,
      };

      const alertUpdateData = {
        ...alertData,
        alumno_alerta_id: alertData.alumno_alerta_id,
        prioridad_id: Number(values.prioridad),
        severidad_id: Number(values.severidad),
        responsable_actual_id: values.responsableName,
        estado_id: values.selectedEstado,
        estado: values.selectedEstado,
      };

      await updateAlertAndBitacora(alertUpdateData, bitacoraData);
      toast({
        title: "Éxito",
        description: "Acción agregada a la bitácora correctamente",
        variant: "default",
      });
      setRefresh();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al agregar la bitácora",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button className="bg-blue-500 hover:bg-blue-600" onClick={onOpen}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Agregar nueva acción</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex justify-between items-center w-full">
              <DialogTitle className="text-xl font-semibold">
                Bitácora
              </DialogTitle>
              <DialogClose className="h-6 w-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Cerrar</span>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium">Alerta</h3>
              <div className="grid grid-cols-3 gap-4 mt-2">

                <div>
                  <Label className="text-sm text-gray-500">Responsable</Label>
                  <Controller
                    name="responsableName"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {powerUsers.map((user) => (
                            <SelectItem
                              key={user.usuario_id}
                              value={user.personas.persona_id.toString()}
                            >
                              {user.personas.nombres} {user.personas.apellidos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormError message={form.formState.errors.responsableName?.message} />
                </div>

                <div>
                  <Label className="text-sm text-gray-500">Estado</Label>
                  <Controller
                    name="selectedEstado"
                    control={form.control}
                    render={({ field }) => (
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {alertStates.map((estado) => (
                            <SelectItem
                              key={estado.alerta_estado_id}
                              value={estado.nombre_alerta_estado}
                            >
                              {estado.nombre_alerta_estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>)}
                  />
                  <FormError message={form.formState.errors.selectedEstado?.message} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <Label className="text-sm text-gray-500">Origen</Label>
                  <Input value={alertData.origen} readOnly disabled />
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Tipo</Label>
                  <Input value={alertData.tipo} readOnly disabled />
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Prioridad</Label>
                  <Controller
                    name="prioridad"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {prioridades.map((item) => (
                            <SelectItem
                              key={item.alerta_prioridad_id}
                              value={item.alerta_prioridad_id.toString()}
                            >
                              {item.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormError message={form.formState.errors.prioridad?.message} />
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Severidad</Label>
                  <Controller
                    name="severidad"
                    control={form.control}
                    render={({ field }) => (
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {severidades.map((item) => (
                            <SelectItem
                              key={item.alerta_severidad_id}
                              value={item.alerta_severidad_id.toString()}
                            >
                              {item.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormError message={form.formState.errors.severidad?.message} />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-500">
                Descripción de la alerta
              </Label>
              <Textarea
                value={alertData.descripcion}
                placeholder="Descripción"
                className="min-h-[120px]"
                disabled
                readOnly
              />
            </div>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <h3 className="font-medium">Bitácora</h3>
                <div className="mt-2 space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">
                      Plan de acción (texto)
                    </Label>
                    <Controller
                      name="planAccion"
                      control={form.control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Describa el plan de acción"
                          className="min-h-[120px]"
                        />
                      )}
                    />
                    <FormError message={form.formState.errors.planAccion?.message} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">
                        Fecha compromiso
                      </Label>
                      <Controller
                        name="fechaCompromiso"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                              const val = e.target.value ? parseISO(e.target.value) : null;
                              field.onChange(val);
                            }}
                          />
                        )}
                      />
                      <FormError message={form.formState.errors.fechaCompromiso?.message} />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">
                        Fecha realización
                      </Label>
                      <Controller
                        name="fechaRealizacion"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                              const val = e.target.value ? parseISO(e.target.value) : null;
                              field.onChange(val);
                            }}
                          />
                        )}
                      />
                      <FormError message={form.formState.errors.fechaRealizacion?.message} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">
                      Subir archivo (opcional)
                    </Label>
                    <Controller
                      name="archivo"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,application/pdf"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            field.onChange(file);
                          }}
                        />
                      )}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Solo se permiten imágenes JPG, PNG, GIF y archivos PDF. El
                      archivo debe ser menor a 5MB.
                    </p>
                    <FormError message={form.formState.errors.archivo?.message} />
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
