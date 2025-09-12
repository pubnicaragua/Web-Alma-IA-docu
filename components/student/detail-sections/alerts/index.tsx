"use client";
import { StudentAlert } from "@/types/student";
import { StudentDetailAlertsTable } from "./table";
import { StudentDetailAddAlertModal } from "./add-modal";

interface StudentAlertsProps {
    alerts: StudentAlert[];
    setRefresh: () => void;
}

export function StudentDetailAlerts({ alerts, setRefresh }: Readonly<StudentAlertsProps>) {

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    Alertas del alumno
                </h3>
                <StudentDetailAddAlertModal onRefresh={setRefresh} />
            </div>
            <StudentDetailAlertsTable alerts={alerts} />
        </div>
    );
}
