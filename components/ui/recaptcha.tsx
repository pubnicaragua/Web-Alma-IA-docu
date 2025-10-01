import ReCAPTCHA, { ReCAPTCHAProps } from "react-google-recaptcha";
import { forwardRef } from "react";

type ReCaptchaInputProps = Omit<ReCAPTCHAProps, "sitekey">;

export const ReCaptchaInput = forwardRef<ReCAPTCHA, ReCaptchaInputProps>((props, ref) => {
  return (
    <ReCAPTCHA
      ref={ref}
      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      {...props}
    />
  );
});

ReCaptchaInput.displayName = "ReCaptchaInput";
