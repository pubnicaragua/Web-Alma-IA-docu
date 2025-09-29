import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BinnacleTable } from "../binnacle/table";
import { AddActionModal } from "../binnacle/add-modal";
import { AlertPagev1 } from "@/services/alerts-service";

interface PropTypes {
    alertData: AlertPagev1;
    setRefresh: () => void;
    refresh: boolean;
}

export function AlertBinnacleSection({ alertData, setRefresh, refresh }: PropTypes) {
    return (
        <Card className="mb-6">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Bitácora de acciones</CardTitle>
                <AddActionModal
                    alertData={alertData}
                    setRefresh={setRefresh}
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