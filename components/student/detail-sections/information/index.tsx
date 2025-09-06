import type { StudentGeneral, StudentMedicalRecord, StudentRepresentative } from "@/types/student";
import { StudentDetailInfoGeneral } from "./general";
import { useUser } from "@/middleware/user-context";
import { StudentDetailInfoMedicalRecord } from "./medical-record";
import { StudentDetailInfoRepresentatives } from "./representatives";

interface PropTypes {
    alumno: StudentGeneral
    ficha: StudentMedicalRecord,
    apoderados: StudentRepresentative[]
}

export function StudentDetailInfo({
    alumno,
    ficha,
    apoderados
}: Readonly<PropTypes>) {
    const { getFuntions } = useUser();

    return (
        <>
            <StudentDetailInfoGeneral alumno={alumno} />
            {getFuntions("Ficha Alumno->Antecedentes Clinicos") && (
                <StudentDetailInfoMedicalRecord ficha={ficha} />
            )}
            {getFuntions("Ficha Alumno->Apoderados") && (
                <StudentDetailInfoRepresentatives apoderados={apoderados} />
            )}
        </>
    )
}