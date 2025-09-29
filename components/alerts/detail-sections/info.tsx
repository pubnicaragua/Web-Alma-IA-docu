
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLightbox } from "@/hooks/use-lightbox";
import { AlertPagev1 } from "@/services/alerts-service";
import { FileImage, Lock } from "lucide-react";
import Image from "next/image";


interface PropTypes {
    alert: AlertPagev1;
}

export function AlertInfoSection({ alert }: Readonly<PropTypes>) {

    const lightbox = useLightbox();
    const { Lightbox } = lightbox;

    return (
        <Card className="mb-6">
            <CardHeader className="flex justify-end w-full space-y-0 pb-2"></CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
                        Responsable Actual:
                        <span className="ml-4 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                            Estado: {alert.estado || "PDN"}
                        </span>
                    </h3>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 py-2 pl-4 w-1/2">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                            {alert.responsable.imagen?.trim() && (
                                <Image
                                    src={alert.responsable.imagen?.trim()}
                                    alt={alert.responsable.nombre?.trim() || "Responsable"}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                    }}
                                />
                            )}
                        </div>
                        <span className="text-gray-700">
                            {alert.responsable.nombre?.trim() || "No disponible"}
                        </span>
                    </div>
                    {!alert.anonimo ? (
                        <div className="flex items-center mt-2 text-gray-600">
                            <Lock className="h-4 w-4 mr-1" />
                            <span className="text-sm">No es anónimo</span>
                        </div>
                    ) : (
                        <div className="flex items-center mt-2 text-gray-600">
                            <Lock className="h-4 w-4 mr-1" />
                            <span className="text-sm">Es anónimo</span>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Descripción de la alerta
                    </h3>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="md:col-span-1">

                            <div className="bg-gray-50 rounded-lg border border-gray-100 py-2 px-4">
                                <p className="text-sm text-gray-500 mb-1">Imagen</p>
                                {alert.url_image ? (
                                    <div>
                                        <Button
                                            className="bg-blue-500 hover:bg-blue-600"
                                            onClick={() => lightbox.open(alert.url_image || '')}
                                            aria-label="Visualizar Imagen Alerta"
                                        >
                                            <FileImage />
                                            <span>Visualizar Imagen</span>
                                        </Button>
                                        <Lightbox />
                                    </div>
                                ) : (
                                    <p className="text-base font-medium text-gray-800">
                                        Imagen No Disponible
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <div className="bg-gray-50 rounded-lg border border-gray-100 py-2 px-4">
                                <p className="text-sm text-gray-500 mb-1">Audio</p>
                                {alert.url_audio ? (
                                    <audio src={alert.url_audio} className="w-full" controls>
                                    </audio>
                                ) : (
                                    <p className="text-base font-medium text-gray-800">
                                        Audio No Disponible
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-lg border border-gray-100 py-2 pl-4">
                            <p className="text-sm text-gray-500">Origen</p>
                            <p className="text-base font-medium text-gray-800">
                                {alert.origen}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-100 py-2 pl-4">
                            <p className="text-sm text-gray-500">Tipo</p>
                            <p className="text-base font-medium text-gray-800">
                                {alert.tipo}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-100 py-2 pl-4">
                            <p className="text-sm text-gray-500">Prioridad</p>
                            <p className="text-base font-medium ">
                                {alert.prioridad}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-100 py-2 pl-4">
                            <p className="text-sm text-gray-500">Severidad</p>
                            <p className="text-base font-medium ">
                                {alert.severidad}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-gray- mt-4">Mensaje</p>

                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {alert.descripcion}
                    </p>
                </div>
            </CardContent>
        </Card>

    )
}