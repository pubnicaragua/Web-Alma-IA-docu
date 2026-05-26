import { forwardRef, useEffect } from "react";

type ReCaptchaInputProps = {
  onChange?: (token: string | null) => void;
  [key: string]: any;
};

// Componente dummy para reCAPTCHA deshabilitado temporalmente
export const ReCaptchaInput = forwardRef<HTMLDivElement, ReCaptchaInputProps>((props, ref) => {
  useEffect(() => {
    props.onChange?.("recaptcha-disabled");
  }, [props.onChange]);

  return (
    <div ref={ref} className="p-3 border border-gray-300 rounded bg-gray-50 text-sm text-gray-600">
      reCAPTCHA deshabilitado temporalmente
    </div>
  );
});

ReCaptchaInput.displayName = "ReCaptchaInput";
