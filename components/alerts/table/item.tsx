'use client';
import { Alert, parseAlertDateTime } from "@/services/alerts-service";
import { AlertBadge } from "@/components/alerts/alert-badge";
import { StudentCell } from "@/components/alerts/student-cell";
import { useRouter } from "next/navigation";

export function AlertTableItem(alert: Alert, column: { key: string; title: string }) {

    const router = useRouter();


    const handleAlertClick = (alert: Alert) => {
        router.push(`/alertas/${alert.id}`);
    };

    switch (column.key) {
        case "student":
            return (
                <StudentCell alert={alert} onClick={() => handleAlertClick(alert)} />
            );
        case "type":
            return (
                <div className="flex justify-start w-full">
                    <AlertBadge
                        type="type"
                        value={
                            typeof alert.type === "string"
                                ? alert.type
                                : (alert.type as any)?.name ?? ""
                        }
                    />
                </div>
            );
        case "priority":
            return (
                <div className="flex justify-start w-full">
                    <AlertBadge type="priority" value={alert.priority} />
                </div>
            );
        case "status":
            return (
                <div className="flex justify-start w-full">
                    <AlertBadge type="status" value={alert.status} />
                </div>
            );
        case "date": {
            const localDate = parseAlertDateTime(alert.date || "", alert.time);
            return (
                <div className="text-left">
                    {localDate ? localDate.toLocaleDateString() : "N/A"}
                </div>
            );
        }
        case "time": {
            const localDate = parseAlertDateTime(alert.date || "", alert.time);
            return (
                <div className="text-left">
                    {localDate
                        ? localDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "N/A"}
                </div>
            );
        }
        default:
            return (
                <div className="text-left">
                    {String(alert[column.key as keyof Alert]) || "N/A"}
                </div>
            );
    }
}