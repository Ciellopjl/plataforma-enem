"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { User, Camera, Loader2 } from "lucide-react";
import { updateProfileImage } from "../actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProfileImageUploaderProps {
  currentImage?: string | null;
}

export function ProfileImageUploader({ currentImage }: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [image, setImage] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { update, data: session } = useSession();
  const router = useRouter();

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 250; // Avatar HD cravado 250x250

          // Lógica Sênior: Crop/Cover centralizado para não amassar fotos retangulares comuns
          const size = Math.min(img.width, img.height); // O menor lado determina o tamanho do quadrado
          const startX = (img.width - size) / 2; // Centraliza X
          const startY = (img.height - size) / 2; // Centraliza Y

          canvas.width = MAX_SIZE;
          canvas.height = MAX_SIZE;
          const ctx = canvas.getContext("2d");
          
          // Desenhando o pedaço quadrado certinho no canvas
          ctx?.drawImage(img, startX, startY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
          
          // Qualidade .9 para ficar nítido, webp nativo
          resolve(canvas.toDataURL("image/webp", 0.9));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Apenas imagens (PNG, JPG, WebP) são permitidas!");
      return;
    }

    try {
      setIsUploading(true);
      
      // Motor HTML5 de Compressão Canvas "Client-Side" rodando
      const compressedBase64 = await compressImage(file);
      
      const sessionData = await updateProfileImage(compressedBase64);
      
      if (sessionData.success) {
         // O banco de dados acaba de salvar os 50kbs. 
         // Ao invés de explodirmos o Cookie do NextAuth mandando 50kb na função update(),
         // Enganamos o NextAuth passando a URL da nossa API novinha geradora de Avatares!
         const userIdToFetch = (session?.user as any)?.id;
         const safeUrlProxy = `/api/avatar/${userIdToFetch}?t=${Date.now()}`;

         setImage(compressedBase64); // Mostramos local/imediato sem gastar rede
         await update({ user: { image: safeUrlProxy } }); // Navbar usa a URL Proxy levinha
         
         router.refresh();
      } else {
         alert("O Banco rejeitou: " + sessionData.error);
      }

    } catch (err: any) {
      console.error("DEBUG FATAL:", err);
      alert(`Debug do Aviao caiu: ${err.message || String(err)}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative group cursor-pointer w-32 h-32 rounded-full border-4 border-white/5 bg-zinc-900 shadow-xl shrink-0" onClick={() => fileInputRef.current?.click()}>
       
       <input 
         type="file" 
         accept="image/png, image/jpeg, image/webp"
         ref={fileInputRef}
         className="hidden"
         onChange={handleFileChange}
       />

       {/* Renderiza a Foto ou o Boneco Cinza */}
       <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-primary-500/10 text-primary-500 transition-all duration-500 group-hover:blur-sm overflow-hidden">
         {image ? (
            <Image 
              src={image} 
              alt="Seu Rosto de Herói" 
              fill 
              sizes="128px"
              className="object-cover" 
            />
         ) : (
           <User size={48} />
         )}
       </div>

       {/* O "Glass" Efeitover ao passar o Mouse */}
       <div className={cn(
         "absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300",
         isUploading && "opacity-100 bg-black/70"
       )}>
          {isUploading ? (
             <><Loader2 className="animate-spin text-white mb-1" size={24} /> <span className="text-[10px] font-black uppercase text-white">Salvando...</span></>
          ) : (
             <><Camera className="text-white mb-1 drop-shadow-lg" size={24} /> <span className="text-[10px] font-black uppercase text-white tracking-widest">Alterar</span></>
          )}
       </div>

    </div>
  );
}
