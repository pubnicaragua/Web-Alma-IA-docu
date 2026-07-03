
// Validar el captcha
export async function validateRecaptch(captcha: string) {

    // En desarrollo, saltar la validacion del servidor de Google.
    if (process.env.NODE_ENV === "development") {
        console.log("[reCAPTCHA] Validacion omitida en modo desarrollo");
        return;
    }

    if (!captcha) {
        throw new Error('Por favor, marca la casilla "No soy un robot".');
    }

    const secret = process.env.RECAPTCHA_SECRET;

    if (!secret) {
        console.error("[reCAPTCHA] RECAPTCHA_SECRET is not configured");
        throw new Error("reCAPTCHA no est\u00e1 configurado en el servidor.");
    }

    const captchaRequest = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            secret,
            response: captcha
        }),
    });

    const captchaData = await captchaRequest.json();

    if (!captchaData.success) {
        const errorCodes = Array.isArray(captchaData["error-codes"])
            ? captchaData["error-codes"]
            : [];

        console.error("[reCAPTCHA] Validation failed:", JSON.stringify({
            errorCodes,
            hostname: captchaData.hostname,
        }));

        throw new Error(
            `reCAPTCHA rechazado: ${errorCodes.join(", ") || "error desconocido"}`
        );
    }
}
