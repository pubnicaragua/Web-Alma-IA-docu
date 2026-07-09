import { forwardRef, useImperativeHandle } from "react";

type ReCaptchaInputProps = {
  onChange?: (token: string | null) => void;
  [key: string]: any;
};

export type ReCaptchaInputRef = {
  reset: () => void;
};

// Componente dummy para reCAPTCHA deshabilitado temporalmente
export const ReCaptchaInput = forwardRef<ReCaptchaInputRef, ReCaptchaInputProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    reset: () => undefined,
  }), []);

  return (
    <div className="p-3 border border-gray-300 rounded bg-gray-50 text-sm text-gray-600">
      reCAPTCHA deshabilitado temporalmente
    </div>
  );
});

ReCaptchaInput.displayName = "ReCaptchaInput";
