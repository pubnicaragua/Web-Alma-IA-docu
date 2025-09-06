

export const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const formatDateMensual = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("es-ES", { month: "long" });
    const year = date.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
};

export const parseDateTime = (fecha: string, hora: string): Date => {
    const [day, month, year] = fecha.split("/").map(Number);
    const [hours, minutes] = hora.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
};