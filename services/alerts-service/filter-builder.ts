import { Alert, ApiAlert, mapApiAlertsToAlerts, parseAlertDateTime } from ".";

export class AlertFilterBuilder {

    protected filtered: ApiAlert[] = [];

    constructor(source: ApiAlert[]) {
        this.filtered = source
    }

    public getByStatus(status: string): AlertFilterBuilder {
        if (!status || status.toLowerCase() === 'todos') return this;
        this.filtered = this.filtered.filter(alert => alert.estado.toLowerCase() === status.toLowerCase())
        return this;
    }

    public getByPriority(priority: string): AlertFilterBuilder {
        if (!priority || priority.toLowerCase() === 'todos') return this;
        this.filtered = this.filtered.filter(alert => alert.alertas_prioridades.nombre.toLowerCase() === priority.toLowerCase())
        return this;
    }

    public getByType(type: string): AlertFilterBuilder {
        if (!type || type.toLowerCase() === 'todos') return this;
        if (type.toLowerCase() === 'sos') {
            type = 'Sos Alma'
        }
        this.filtered = this.filtered.filter(alert => alert.alertas_tipos.nombre.toString().toLowerCase() === type.toLowerCase())
        return this;
    }

    public getByDate(date: string, selectedDate: string | Date): AlertFilterBuilder {
        if (!date || date.toLowerCase() === 'todos') return this;

        this.filtered = this.filtered.filter(alert => {
            const alertDate = alert.fecha_generada ? new Date(alert.fecha_generada) : null;
            if (!alertDate) return false;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            switch (date) {
                case "Hoy":
                    const todayStart = new Date(today);
                    const todayEnd = new Date(today);
                    todayEnd.setHours(23, 59, 59, 999);
                    return alertDate >= todayStart && alertDate <= todayEnd;
                case "Hasta...":
                    if (!selectedDate) return false;
                    const untilDate = new Date(selectedDate);
                    untilDate.setHours(23, 59, 59, 999);
                    return alertDate.getTime() <= untilDate.getTime();
                default:
                    return true;
            }
        });

        return this;
    }

    public build(): Alert[] {
        return mapApiAlertsToAlerts(this.filtered).sort((a, b) => {
            const dateTimeA = parseAlertDateTime(a.date || "", a.time || "") || new Date(0);
            const dateTimeB = parseAlertDateTime(b.date || "", b.time || "") || new Date(0);
            return dateTimeB.getTime() - dateTimeA.getTime();
        });
    }
}
