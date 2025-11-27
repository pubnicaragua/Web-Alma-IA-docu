import { useEffect, useMemo, useState } from "react";
import { X, Clipboard, Search } from "lucide-react";
import { Label } from "recharts";
import { useAxios } from "@/hooks/use-axios";
import { useDebounce } from "@/hooks/use-debounce";
import { useModal } from "@/lib/modal-utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";

export function SurveyModalResponses({ survey }: any) {

    const [searchFilter, setSearchFilter] = useState<string>('');
    const [destinataryId, setDestinataryId] = useState(0);

    const { isOpen, onOpen, onClose } = useModal();

    const debounceFilter = useDebounce(searchFilter, 500);
    const axios = useAxios<any>();

    useEffect(() => {
        if (!isOpen || !survey.encuesta_id) return;
        axios.execute(() =>
            window.axios.get(`/encuestas/obtener-respuestas`, {
                params: {
                    encuesta_id: survey.encuesta_id,
                },
            })
        );
    }, [isOpen, survey.encuesta_id]);

    useEffect(() => {
        if (!isOpen) return;
        setSearchFilter('');
        setDestinataryId(0);
    }, [isOpen]);

    const destinataries = useMemo(() => {
        if (!axios.data) return [];
        const { destinatarios } = axios?.data?.encuesta_detalle;
        if (!destinatarios || !debounceFilter) return [];
        const filtered = destinatarios.filter((destinatario: any) =>
            destinatario.nombre.toLowerCase().includes(debounceFilter.toLowerCase())
        );
        return filtered?.map((destinatario: any) => ({
            id: destinatario.destinatario_id,
            name: destinatario.nombre
        }));
    }, [axios.data?.encuesta_detalle, debounceFilter]);

    const destinatary = useMemo(() => {
        if (!axios.data) return null;
        if (!destinataryId) return null;
        const { destinatarios } = axios?.data?.encuesta_detalle;
        if (!destinatarios) return null;
        return destinatarios.find((destinatario: any) => destinatario.destinatario_id === destinataryId);
    }, [destinataryId]);

    const handleSelecDestinatary = (destinataryId: number) => {
        setDestinataryId(destinataryId);
        setSearchFilter('');
    }

    return (
        <>
            <Button size={"sm"} variant={"link"} onClick={onOpen}>
                <Clipboard />
            </Button>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] min-h-[300px] overflow-y-auto block">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                Respuestas de la Encuesta
                            </DialogTitle>
                            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Cerrar</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                    <div className="form-group lg:my-5">
                        <Label className="text-sm text-gray-500">Buscador de Destinatarios</Label>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Escriba el nombre del encuestado"
                                className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2"
                            />
                            {debounceFilter && (
                                <div className="absolute mt-1 w-full bg-white border rounded-xl shadow-lg z-20">
                                    <ul className="max-h-60 overflow-y-auto">
                                        {destinataries.map((item: any) => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelecDestinatary(item.id)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                >
                                                    {item.name}
                                                </button>
                                            </li>
                                        ))}
                                        {destinataries.length === 0 && (
                                            <li className="px-4 py-2 text-gray-400 select-none">
                                                No hay resultados
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    {destinatary ? (
                        <article className="max-h-64 overflow-y-auto">
                            <h4 className="mb-1">{destinatary?.nombre}</h4>
                            <h4>{formatDate(destinatary.respuestas[0]?.fecha_respuesta) || 'Sin fecha'}</h4>
                            <hr className="my-3" />
                            {destinatary?.respuestas?.map((respuesta: any, index: number) => (
                                <div key={respuesta?.encuesta_respuesta_id}>
                                    {respuesta?.preguntas?.map((pregunta: any, index: number) => (
                                        <article key={pregunta?.pregunta_id} className="mb-3">
                                            <h5 className="font-semibold">
                                                <span className="mr-3">#{index + 1}</span>
                                                {pregunta?.pregunta_texto}
                                            </h5>
                                            <hr className="my-2" />
                                            <p className="font-medium mb-1">Respuesta</p>
                                            {pregunta.tipo_pregunta_id == 4 && (
                                                <p className="text-red-700">Revisar Sociograma</p>
                                            )}
                                            {Boolean(pregunta?.alternativas_marcadas.length) && (
                                                <ul className="list-disc ml-4">
                                                    {pregunta?.alternativas_marcadas?.map((alternativa: any, index: number) => (
                                                        <li key={alternativa.alternativa_id}>
                                                            {alternativa?.alternativa_texto}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {pregunta?.respuesta_texto && (
                                                <p>
                                                    {pregunta.respuesta_texto}
                                                </p>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            ))}
                        </article>
                    ) : (
                        <Alert variant={'default'} className="mt-5">
                            Seleccione primero un encuestado
                        </Alert>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
