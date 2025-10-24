import { MarcaCircular } from "@/services/beneficios";

export const BrandCircle = ({
  marca,
  onClick,
}: {
  marca: MarcaCircular;
  onClick?: () => void;
}) => {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-full
      "
      onClick={onClick}
    >
      <div
        className="
          relative
          w-16
          h-16
          bg-white
          rounded-full
          overflow-hidden
          shadow-md
        "
      >
        <img
          src={marca.logoUrl}
          alt={marca.nombre}
          className="absolute inset-0 object-cover"
          sizes="(max-width: 768px) 100vw, 160px"
        />
      </div>
      <div
         style={{
          fontSize:12,
          
          marginTop:10,
          textAlign:"justify",
          maxWidth:200,
          height:"auto",
         }}
      >
        <p>{marca.nombre}</p>
      </div>
    </div>
  );
};
