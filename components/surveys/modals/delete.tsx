import { useCallback } from "react";
import { Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/lib/modal-utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAxios } from "@/hooks/use-axios";
import { useRefresh } from "@/hooks/use-refresh";
import { AxiosError } from "axios";

export function SurveyModalDelete({ survey }: any) {

    const { toggleRefresh } = useRefresh();
    const { toast } = useToast();
    const { isOpen, onOpen, onClose } = useModal();
    const axios = useAxios();

    const handleDeleteClick = useCallback(async () => {
        try {
            const encuestaId = survey.encuesta_id;
            const response = await axios.execute<{ mensaje: string }>(() =>
                window.axios.delete(`/encuestas/eliminar-encuesta/${encuestaId}`)
            );

            toast({
                title: "¡Atención",
                description: response?.data.mensaje
            });

            onClose();
            setTimeout(() => {
                toggleRefresh();
            }, 350);
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: "¡Atención",
                    description: error.response?.data.mensaje ?? 'Error de Servidor',
                    variant: 'destructive'
                });
            }
        }
    }, [survey.encuesta_id]);

    return (
        <>
            <Button size={'sm'} variant={'link'} onClick={onOpen}>
                <Trash />
            </Button>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-1xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                Eliminación de Encuesta
                            </DialogTitle>
                            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Cerrar</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                    <Alert variant={'destructive'} className="text-center">
                        ¿Esta seguro que desea eliminar esta encuesta?
                    </Alert>
                    <div className="flex justify-between">
                        <Button variant={'destructive'} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button variant={'default'} onClick={handleDeleteClick}>
                            Guardar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}


