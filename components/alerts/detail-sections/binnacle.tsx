import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BinnacleTable } from "../binnacle/table";
import { AddActionModal } from "../binnacle/add-modal";
import { AlertPagev1 } from "@/services/alerts-service";

interface PropTypes {
    alertData: AlertPagev1;
}

export function AlertBinnacleSection({ alertData }: PropTypes) {

    const [refresh, setRefresh] = useState(false);

    return (
        <Card className="mb-6">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Bitácora de acciones</CardTitle>
                <AddActionModal
                    alertData={alertData}
                    setRefresh={() => setRefresh((prev) => !prev)}
                />
            </CardHeader>
            <CardContent>
                <BinnacleTable
                    alertId={alertData.alumno_alerta_id}
                    refresh={refresh}
                />
            </CardContent>
        </Card>
    )
}