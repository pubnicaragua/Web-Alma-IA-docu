import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/lib/modal-utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { NoticeForm } from "../form";
import { useCallback } from "react";
import { useRefresh } from "@/hooks/use-refresh";

const formatForDatetimeLocal = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const isFutureDate = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date > new Date();
};

export function NoticeModalEdit({ notice }: any) {
    
    const { isOpen, onOpen, onClose } = useModal();
    const refresh = useRefresh();

    const postSubmit = useCallback(() => {
        onClose();
        refresh.toggleRefresh();
    }, []);

    return (
        <>
            <Button size={'sm'} variant={'link'} onClick={onOpen}>
                <Pencil />
            </Button>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                Edición de Aviso
                            </DialogTitle>
                            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Cerrar</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                    <NoticeForm
                        postSubmit={postSubmit}
                        avisoId={notice.aviso_id}
                        initialData={{
                            aviso: {
                                titulo: notice.aviso_titulo || "",
                                descripcion: notice.aviso_contenido || "",
                                palabras_clave: (notice.palabras_clave || []).join(", "),
                                archivo: notice.aviso_ruta_archivo || undefined,
                                fecha_programacion: formatForDatetimeLocal(notice.aviso_fecha_programacion),
                                tipo_programacion: isFutureDate(notice.aviso_fecha_programacion) ? 'Programar' : 'Ahora'
                            },
                            destinatarios: {
                                aviso_tipo_id: notice.aviso_tipo_id || 0,
                                aviso_destinatario_tipo: notice.destinatario_tipo || "",
                                destinatarios: notice.destinatarios_ids || [],
                            },
                        }}
                        meta={notice.meta}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
