import { Plus, X } from "lucide-react";
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

interface NoticeModalNewProps {
    onCreated?: () => void;
}

export function NoticeModalNew({ onCreated }: Readonly<NoticeModalNewProps>) {
    const { isOpen, onOpen, onClose } = useModal();

    const handleCreated = () => {
        onClose();
        onCreated?.();
    };

    return (
        <>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={onOpen}>
                <Plus />
                <span>Agregar nueva aviso</span>
            </Button>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                Agregar nuevo aviso
                            </DialogTitle>
                            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Cerrar</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                    <NoticeForm onSuccess={handleCreated} />
                </DialogContent>
            </Dialog>
        </>
    )
}


