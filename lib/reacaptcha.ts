
// Validar el captcha
export async function validateRecaptch(captcha: string) {

    // El frontend usa un componente dummy mientras reCAPTCHA esta deshabilitado.
    if (captcha === "recaptcha-disabled") {
        console.log("[reCAPTCHA] Validacion omitida: captcha deshabilitado");
        return;
    }

    // En desarrollo, saltar la validacion del servidor de Google.
    if (process.env.NODE_ENV === "development") {
        console.log("[reCAPTCHA] Validacion omitida en modo desarrollo");
        return;
    }

    if (!captcha) {
        throw new Error('Por favor, marca la casilla "No soy un robot".');
    }

    const captchaRequest = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            secret: process.env.NEXT_PUBLIC_RECAPTCHA_SECRET ?? "",
            response: captcha
        }),
    });

    const captchaData = await captchaRequest.json();

    if (!captchaData.success) {
        throw new Error("El ReCaptcha expiro, vuelva a intentarlo.");
    }
}
