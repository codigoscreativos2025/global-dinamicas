import Image from "next/image";
import { RegisterForm } from "@/components/RegisterForm";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full px-6 py-12 relative z-10">
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logotipo.png"
            alt="Iglesia Global"
            width={180}
            height={60}
            className="mb-6 drop-shadow-md"
          />
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            ¡Bienvenido a los Juegos!
          </h1>
          <p className="text-gray-400 text-center text-sm mt-2">
            Ingresa tu cédula y correo para unirte a la dinámica de hoy.
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
}
