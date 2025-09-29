'use client';
import { useRouter } from "next/navigation";
import { FileAudio, FileImage, FileX } from "lucide-react";
import { Alert } from "@/services/alerts-service";
import { AlertBadge } from "@/components/alerts/alert-badge";
import { StudentCell } from "@/components/alerts/student-cell";

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
                <div className="flex justify-center w-full">
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
            return (
                <div className="text-left">
                    {alert.date || "N/A"}
                </div>
            );
        }
        case "time": {
            return (
                <div className="text-left">
                    {alert.time || "N/A"}
                </div>
            );
        }
        case "resource": {
            return (
                <div className="flex items-center w-full gap-3">
                    {alert.url_audio && (
                        <FileAudio className="text-green-500" />
                    )}
                    {alert.url_imagen && (
                        <FileImage className="text-blue-500" />
                    )}
                    {(!alert.url_imagen && !alert.url_audio) && (
                        <FileX className="text-red-500" />
                    )}
                </div>
            )
        }
        default:
            return (
                <div className="text-left">
                    {String(alert[column.key as keyof Alert]) || "N/A"}
                </div>
            );
    }
}