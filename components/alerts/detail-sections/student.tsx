import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertPagev1 } from "@/services/alerts-service";
import { formatDate } from "../binnacle/table/item";

interface PropTypes{
    alert: AlertPagev1;
}

export function AlertStudentSection({ alert }: Readonly<PropTypes>) {
    return (
        <Card className="mb-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">
                    Información del Alumno
                </CardTitle>
            </CardHeader>
            <CardContent>
                {alert && (
                    <div className="flex items-center">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden mr-6 flex-shrink-0">
                            {alert.alumno.imagen && (
                                <Image
                                    src={alert.alumno.imagen}
                                    alt={alert.alumno.nombre || "Alumno"}
                                    width={96}
                                    height={96}
                                    className={`object-cover ${alert.anonimo ? "blur-xl" : ""}`}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "";
                                    }}
                                />
                            )}
                        </div>
                        <div>
                            <h1
                                className="text-2xl font-bold text-gray-800"
                                onClick={() => console.log(alert)}
                            >
                                {alert.anonimo ? "Anónimo" : alert.alumno.nombre}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Fecha de generación: {formatDate(alert.fecha_generada)}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )

}