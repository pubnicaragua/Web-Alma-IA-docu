import type { StudentGeneral, StudentMedicalRecord, StudentRepresentative } from "@/types/student";
import { StudentDetailInfoGeneral } from "./general";
import { useUser } from "@/middleware/user-context";
import { StudentDetailInfoMedicalRecord } from "./medical-record";
import { StudentDetailInfoRepresentatives } from "./representatives";

interface PropTypes {
    alumno: StudentGeneral | null | undefined
    ficha: StudentMedicalRecord | null,
    apoderados: StudentRepresentative[] | null | undefined
}

export function StudentDetailInfo({
    alumno,
    ficha,
    apoderados
}: Readonly<PropTypes>) {
    const { getFuntions } = useUser();

    return (
        <>
            {alumno ? <StudentDetailInfoGeneral alumno={alumno} /> : null}
            {getFuntions("Ficha Alumno->Antecedentes Clinicos") && (
                <StudentDetailInfoMedicalRecord ficha={ficha} />
            )}
            {getFuntions("Ficha Alumno->Apoderados") && (
                <StudentDetailInfoRepresentatives apoderados={apoderados ?? []} />
            )}
        </>
    )
}
