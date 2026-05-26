"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import { DevelopmentMode } from "./utils/app-mode";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <SplashScreen />}
      <div
        className={
          isLoading
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-300"
        }
      >
        {children}
        <DevelopmentMode />
      </div>
    </>
  );
}
