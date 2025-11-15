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

export function SurveyModalDelete({ survey }: any) {
    const { isOpen, onOpen, onClose } = useModal();

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
                        <Button variant={'default'}>
                            Guardar
                        </Button>

                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}


