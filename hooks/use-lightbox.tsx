import { useState } from "react";
import Image from "next/image";

export function useLightbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const open = (url: string) => {
        setImageUrl(url);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setImageUrl(null);
    };

    const Lightbox = () =>
        isOpen && imageUrl ? (
            <div
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                onClick={close}
            >
                <div className="relative w-[90%] h-[90%] max-w-5xl max-h-[90%]">
                    <Image
                        src={imageUrl}
                        alt="Lightbox"
                        className="object-contain rounded-lg shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                        priority
                        fill
                    />
                </div>
            </div>
        ) : null;

    return { open, close, Lightbox };
}
