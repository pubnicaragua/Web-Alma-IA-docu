import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertPagev1 } from "@/services/alerts-service";
import { useState } from "react";
import { updateAlert } from "@/services/alerts-service";

interface EditAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertPagev1 | null;
  onSave?: (data: any) => Promise<void>;
}

export function EditAlertModal({
  isOpen,
  onClose,
  alert,
  onSave,
}: EditAlertModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    prioridad_id: alert?.prioridad_id.toString() || "1",
    severidad_id: alert?.severidad_id.toString() || "1",
    tipo_id: alert?.tipo.toString() || "1",
    accion_tomada: alert?.descripcion || "",
    fecha_resolucion: "",
  });

  if (!alert) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updateData = {
        ...alert,
        prioridad_id: parseInt(formData.prioridad_id) || 1,
        severidad_id: parseInt(formData.severidad_id) || 1,
        responsable_actual_id: "1",
        accion_tomada: { action: formData.accion_tomada || null },
      };

      const updatedAlert = await updateAlert(updateData as any);

      if (onSave) {
        await onSave(updatedAlert);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Alerta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Generada</Label>
              <Input
                type="datetime-local"
                name="fecha_generada"
                defaultValue={alert.fecha_generada}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Resolución</Label>
              <Input
                type="datetime-local"
                name="fecha_resolucion"
                value={formData.fecha_resolucion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                name="prioridad_id"
                value={formData.prioridad_id}
                onValueChange={(value) =>
                  handleSelectChange("prioridad_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Baja</SelectItem>
                  <SelectItem value="2">Media</SelectItem>
                  <SelectItem value="3">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severidad</Label>
              <Select
                name="severidad_id"
                value={formData.severidad_id}
                onValueChange={(value) =>
                  handleSelectChange("severidad_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Baja</SelectItem>
                  <SelectItem value="2">Media</SelectItem>
                  <SelectItem value="3">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                name="tipo_id"
                value={formData.tipo_id}
                onValueChange={(value) => handleSelectChange("tipo_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOS Alma">SOS Alma</SelectItem>
                  <SelectItem value="Denuncias">Denuncia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Acción tomada</Label>
            <Textarea
              name="accion_tomada"
              value={formData.accion_tomada}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2 h-40">
            <Label>Descripción de la alerta</Label>
            <Textarea
              className="flex h-full"
              name="regla_descripcion"
              defaultValue={alert.descripcion || ""}
              disabled
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
