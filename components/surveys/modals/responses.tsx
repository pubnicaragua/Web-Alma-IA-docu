import { useEffect, useMemo, useState } from "react";
import { X, Clipboard, Search, LoaderCircle } from "lucide-react";
import { useAxios } from "@/hooks/use-axios";
import { useDebounce } from "@/hooks/use-debounce";
import { useModal } from "@/lib/modal-utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";

export function SurveyModalResponses({ survey }: any) {

    const [searchFilter, setSearchFilter] = useState<string>('');
    const [destinataryId, setDestinataryId] = useState<number | null>(null);

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
        setDestinataryId(null);
    }, [isOpen]);

    const allDestinataries = useMemo(() => {
        if (!axios.data) return [];
        const destinatarios = axios?.data?.encuesta_detalle?.destinatarios;
        if (!destinatarios) return [];
        return destinatarios.map((destinatario: any) => ({
            id: destinatario.destinatario_id,
            name: destinatario.nombre
        }));
    }, [axios.data?.encuesta_detalle]);

    const destinataries = useMemo(() => {
        if (!debounceFilter) return allDestinataries;
        return allDestinataries.filter((destinatario: any) =>
            destinatario.name.toLowerCase().includes(debounceFilter.toLowerCase())
        );
    }, [allDestinataries, debounceFilter]);

    const destinatary = useMemo(() => {
        if (!axios.data) return null;
        if (destinataryId === null) return null;
        const { destinatarios } = axios?.data?.encuesta_detalle ?? {};
        if (!destinatarios) return null;
        return destinatarios.find((destinatario: any) => destinatario.destinatario_id === destinataryId);
    }, [axios.data?.encuesta_detalle, destinataryId]);

    useEffect(() => {
        if (!isOpen) return;
        if (destinataries.length === 0) {
            setDestinataryId(null);
        } else if (destinataryId === null || !destinataries.some((d: any) => d.id === destinataryId)) {
            setDestinataryId(destinataries[0].id);
        }
    }, [destinataries, destinataryId, isOpen]);

    const handleSelecDestinatary = (destinataryId: number) => {
        setDestinataryId(destinataryId);
        setSearchFilter('');
    }

    return (
        <>
            <Button size={"sm"} variant={"link"} onClick={onOpen} title="Ver Respuestas por Encuestado">
                <Clipboard className="text-blue-600 hover:text-blue-800 h-5 w-5 transition-transform duration-200 hover:scale-125" />
            </Button>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] min-h-[300px] overflow-y-auto block">
                    <DialogHeader className="sticky -top-6 -mx-6 px-6 pt-6 bg-white z-20 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                Respuestas de la Encuesta
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Consulta las respuestas registradas por cada encuestado.
                            </DialogDescription>
                            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Cerrar</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                    <div className="form-group lg:my-5">
                        <label className="text-sm font-medium text-gray-700">
                            Buscar encuestado
                        </label>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Escriba el nombre del encuestado"
                                className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2"
                            />
                        </div>
                    </div>
                    {axios.loading ? (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Cargando respuestas...
                        </div>
                    ) : axios.error ? (
                        <Alert variant="destructive" className="mt-5">
                            <AlertDescription>{axios.error}</AlertDescription>
                        </Alert>
                    ) : allDestinataries.length === 0 ? (
                        <Alert variant="default" className="mt-5">
                            <AlertDescription>
                                Esta encuesta todavía no tiene respuestas registradas.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="mb-5">
                            <p className="mb-2 text-sm font-medium text-gray-700">
                                Encuestados
                            </p>
                            <div className="max-h-36 overflow-y-auto rounded-lg border bg-white">
                                {destinataries.length > 0 ? (
                                    destinataries.map((item: any) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => handleSelecDestinatary(item.id)}
                                            className={`block w-full border-b px-4 py-2 text-left text-sm last:border-b-0 ${item.id === destinataryId
                                                ? "bg-blue-50 font-medium text-blue-700"
                                                : "hover:bg-gray-50"
                                                }`}
                                        >
                                            {item.name}
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-4 py-3 text-sm text-gray-500">
                                        No hay encuestados que coincidan con la búsqueda.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    {destinatary ? (
                        <article className="max-h-64 overflow-y-auto">
                            <h4 className="mb-1">{destinatary?.nombre}</h4>
                            <h4>
                                {destinatary.respuestas?.[0]?.fecha_respuesta
                                    ? formatDate(destinatary.respuestas[0].fecha_respuesta)
                                    : "Sin fecha"}
                            </h4>
                            <hr className="my-3" />
                            {!destinatary?.respuestas?.length && (
                                <Alert variant="default">
                                    <AlertDescription>
                                        Este encuestado no tiene respuestas registradas.
                                    </AlertDescription>
                                </Alert>
                            )}
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
                                            {Boolean(pregunta?.alternativas_marcadas?.length) && (
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
                    ) : !axios.loading && allDestinataries.length > 0 ? (
                        <Alert variant={'default'} className="mt-5">
                            <AlertDescription>
                                Selecciona un encuestado de la lista para ver sus respuestas.
                            </AlertDescription>
                        </Alert>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
