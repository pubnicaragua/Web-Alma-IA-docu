import { useAxios } from "@/hooks/use-axios";
import { StatCardSkeleton } from "../stat-card-skeleton";
import { CardData } from "@/services/home-service";
import { useMemo } from "react";
import { StatCard } from "../stat-card";
import { useUser } from "@/middleware/user-context";
import { ALERTS_VIEW_PERMISSION } from "@/lib/alert-identity";


export function DashboardInfoCards() {
    const { getFuntions, selectedSchoolId } = useUser();
    const canOpenAlerts = getFuntions(ALERTS_VIEW_PERMISSION);
    const axios = useAxios<CardData>(() => window.axios.get("/home/cards/emociones", {
        params: {
            colegio_id: selectedSchoolId
        }
    }));
    const { data: cardData } = axios

    const cards = useMemo(() => {
        if (!cardData) return [];
        return [
            {
                title: "Alumnos",
                count: cardData.alumnos.activos,
                stats: [
                    { label: "Inactivos", value: cardData.alumnos.inactivos.toString() },
                    {
                        label: "Frecuentes",
                        value: cardData.alumnos.frecuentes.toString(),
                    },
                    { label: "Totales", value: cardData.alumnos.totales.toString() },
                ],
                className: "bg-gray-700", // Más intenso
                textColor: "text-white",
            },
            {
                title: "SOS Alma",
                search: { tipo: 1 },
                count: cardData.sos_alma.activos,
                stats: [
                    { label: "Vencidos", value: cardData.sos_alma.vencidos.toString() },
                    {
                        label: "Por vencer",
                        value: cardData.sos_alma.por_vencer.toString(),
                    },
                    { label: "Totales", value: cardData.sos_alma.totales.toString() },
                ],
                className: "bg-red-600", // Más intenso
                textColor: "text-white",
            },
            {
                title: "Denuncias",
                search: { tipo: 2 },
                count: cardData.denuncias.activos,
                stats: [
                    { label: "Vencidos", value: cardData.denuncias.vencidos.toString() },
                    {
                        label: "Por vencer",
                        value: cardData.denuncias.por_vencer.toString(),
                    },
                    { label: "Totales", value: cardData.denuncias.totales.toString() },
                ],
                className: "bg-purple-700", // Más intenso
                textColor: "text-white",
            },
            {
                title: "Alertas Alma",
                count: cardData.alertas_alma.activos,
                search: { motores: true },
                stats: [
                    {
                        label: "Vencidos",
                        value: cardData.alertas_alma.vencidos.toString(),
                    },
                    {
                        label: "Por vencer",
                        value: cardData.alertas_alma.por_vencer.toString(),
                    },
                    { label: "Totales", value: cardData.alertas_alma.totales.toString() },
                ],
                className: "bg-yellow-500", // Más intenso
                textColor: "text-white",
            },
        ];
    }, [cardData]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {axios.loading && (
                <>
                    {[1, 2, 3, 4].map((i) => (
                        <StatCardSkeleton key={i} />
                    ))}
                </>
            )}
            {!axios.loading && cards.length > 0 && (
                <>
                    {cards.map((card, index) => (
                        <StatCard
                            key={index}
                            index={index}
                            title={card.title}
                            count={card.count}
                            stats={card.stats}
                            search={card.search}
                            className={card.className}
                            textColor={card.textColor}
                            isPress={canOpenAlerts}
                        />
                    ))}
                </>
            )}
        </div>
    )

}
