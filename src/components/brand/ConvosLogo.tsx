import * as React from "react";
import { cn } from "@/lib/utils";

export function ConvosLogo({
  className,
  variant = "lockup",
  height = 45, // Logo yüksekliği
  blue = "#2563EB", // Brand Blue
  red = "#EF4444",  // Brand Red
  textColor, // Opsiyonel: Eğer özel bir renk verilmezse otomatik ayarlanır
}: {
  className?: string;
  variant?: "mark" | "lockup";
  height?: number;
  blue?: string;
  red?: string;
  textColor?: string;
}) {
  // Yeni logonun en-boy oranı daha dengeli (yaklaşık 3.8 katı genişlik)
  const width = variant === "lockup" ? Math.round(height * 3.8) : height;

  return (
    <svg
      // Yeni viewBox: Yazı ve ikon için daha geniş alan
      viewBox={variant === "lockup" ? "0 0 175 45" : "0 0 45 45"}
      width={width}
      height={height}
      role="img"
      aria-label="Convos"
      className={cn("inline-block align-middle select-none", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* MARK (İKON) - İÇ İÇE GEÇEN MODERN BALONLAR */}
      <g transform="translate(2, 2)">
        {/* Kırmızı Balon (Arka/Yanıt) */}
        <path
          d="M28.5 4C35.4 4 41 9.6 41 16.5C41 23.4 35.4 29 28.5 29C26.5 29 24.6 28.5 22.9 27.6L18 31L19.8 25.8C17.4 23.4 16 20.1 16 16.5C16 9.6 21.6 4 28.5 4Z"
          fill={red}
        />

        {/* Mavi Balon (Ön/Ana Mesaj) 
            Stroke (Çizgi) ekleyerek kırmızı balonla arasına 'beyaz' bir boşluk koyuyoruz.
            Bu 'negatif alan' efekti logonun profesyonel durmasını sağlar.
        */}
        <path
          d="M16.5 10C9.6 10 4 15.6 4 22.5C4 26.1 5.4 29.4 7.8 31.8L6 37L10.9 33.6C12.6 34.5 14.5 35 16.5 35C23.4 35 29 29.4 29 22.5C29 15.6 23.4 10 16.5 10Z"
          fill={blue}
          stroke="white" 
          strokeWidth="3"
          paintOrder="stroke"
          // Eğer dark modda arka plan siyahsa, bu stroke'un da siyah olması daha iyi durabilir.
          // Ancak genelde logolarda beyaz stroke (kesme payı) standarttır.
        />
        
        {/* İkonun içine minik detay (Opsiyonel) */}
        <circle cx="12" cy="22" r="1.5" fill="white" opacity="0.9"/>
        <circle cx="16.5" cy="22" r="1.5" fill="white" opacity="0.9"/>
        <circle cx="21" cy="22" r="1.5" fill="white" opacity="0.9"/>
      </g>

      {/* WORDMARK (YAZI) */}
      {variant === "lockup" && (
        <text
          x="52"
          y="30"
          // DARK MODE ÇÖZÜMÜ:
          // 1. Eğer 'textColor' prop'u gelirse onu kullanır.
          // 2. Gelmezse varsayılan olarak 'fill-slate-900' (koyu gri) olur.
          // 3. 'dark:fill-white' sayesinde karanlık modda otomatik BEYAZ olur.
          className={cn(
            "font-bold tracking-tight", 
            !textColor && "fill-slate-900 dark:fill-white" 
          )}
          fill={textColor || "currentColor"}
          fontSize="24"
          fontWeight="800"
          style={{
            fontFamily:
              "'Outfit', 'Inter', var(--font-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: "-0.03em", // Modern sıkı harf aralığı
          }}
        >
          Convos
        </text>
      )}
    </svg>
  );
}