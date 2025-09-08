import { Checkbox } from "@/components/ui/checkbox";
import { useAxios } from "@/hooks/use-axios";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useMemo } from "react";
import { useUser } from "@/middleware/user-context";

interface PropTypes {
    alumno_id: number;
    emocion_marcada: number | null;
    opcion_valor: number;
    preguntaId: number;
    cursoId: number;
    fecha: string;
    handleCheck: (alumnoId: number, opcion: number | null) => void;
}

export function AssitedEvTableCheckbox({
    alumno_id,
    emocion_marcada,
    opcion_valor,
    preguntaId,
    cursoId,
    fecha,
    handleCheck
}: Readonly<PropTypes>) {

    const { userData } = useUser();
    const axios = useAxios();
    const { toast } = useToast();

    const isChecked = useMemo(() => opcion_valor === emocion_marcada, [emocion_marcada]);

    const handleClick = useCallback(() => {
        (async function () {
            try {
                const newEmocionMarcada = isChecked ? null : opcion_valor;
                handleCheck(alumno_id, newEmocionMarcada);
                if (!newEmocionMarcada) {
                    toast({
                        title: "¡Atención!",
                        description: 'Se ha desmarcado una respuesta',
                        variant: "destructive",
                    });
                }
                await axios.execute(() => window.axios.post(`/evaluacion-asistida/guardarRespuesta`, {
                    alumno_id,
                    evento_id: preguntaId,
                    curso_id: cursoId,
                    fecha: fecha,
                    evento_respuesta_posible_id: newEmocionMarcada,
                    persona_id: userData?.persona.persona_id,
                    observacion: null,
                    hora: null
                }));
            } catch (error) {
                toast({
                    title: "Error al guardar la respuesta",
                    description: "Ha ocurrido un error al guardar la respuesta.",
                    variant: "destructive",
                });
                handleCheck(alumno_id, emocion_marcada);
            }
        })()
    }, [userData?.persona.persona_id, isChecked, emocion_marcada]);

    return (
        <div className="flex justify-center">
            <div className="print:hidden">
                <Checkbox
                    value={opcion_valor}
                    checked={isChecked}
                    onClick={handleClick}
                />
            </div>

            <div className="hidden print:block text-lg">
                {isChecked ? "✔" : "□"}
            </div>
        </div>
    )
}