import React, { forwardRef } from "react";
import { cn } from "../lib/utils";
import { MapPin, Phone } from "lucide-react";

export interface ProfileData {
  name: string;
  phone: string;
  address: string;
  logo: string | null;
  logoBorder: "seal" | "gold" | "shadow";
  customText: string;
}

interface PosterProps {
  imageUrl: string | null;
  greetingText: string;
  profile: ProfileData;
  isGenerating: boolean;
  textLayout: "vertical" | "horizontal";
  date: Date;
  themeName: string;
}

export const Poster = forwardRef<HTMLDivElement, PosterProps>(
  ({ imageUrl, greetingText, profile, isGenerating, textLayout, date, themeName }, ref) => {
    const hasCardInfo = profile.name || profile.phone || profile.address;
    const displayText = profile.customText || greetingText;
    const isVertical = textLayout === "vertical";

    const monthDay = `${date.getMonth() + 1}月${date.getDate()}日`;
    const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const dayOfWeek = days[date.getDay()];
    
    // Check if it's a daily theme
    const isDailyTheme = ["商务日常", "温柔治愈", "简约随性", "积极向上", "文艺清新", "烟火生活"].includes(themeName);
    const displayTheme = isDailyTheme ? dayOfWeek : themeName;

    // Format horizontal text: split by punctuation into short phrases, but preserve punctuation
    const formattedText = isVertical
      ? displayText
      : displayText
          .replace(/([，。！？；、,.\!?;~～]+)/g, '\n')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .join('\n');

    // Helper to check if a hex color is dark
    const isColorDark = (hex: string): boolean => {
      const color = hex.replace('#', '');
      const r = parseInt(color.substring(0, 2), 16);
      const g = parseInt(color.substring(2, 4), 16);
      const b = parseInt(color.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    };

    const redColors = ["#AC243A", "#E2BDC4"];
    const isRedBackground = imageUrl && redColors.includes(imageUrl);
    const isHexColor = imageUrl && imageUrl.startsWith("#");
    const isDarkBackground = (isHexColor && isColorDark(imageUrl!)) || (imageUrl && ["#AC243A", "#7097DE"].includes(imageUrl));
    
    const accentColorClass = isRedBackground ? "border-white" : "border-[#C91F37]";
    const textColorClass = isRedBackground ? "text-white" : "text-[#C91F37]";
    const dateColorClass = isRedBackground ? "text-white" : "text-stone-900";
    
    const greetingTextColorClass = isDarkBackground ? "text-white" : "text-stone-900";
    const greetingTextShadow = isDarkBackground ? "0 2px 4px rgba(0,0,0,0.5)" : "0 2px 10px rgba(255,255,255,0.8)";

    return (
      <div
        ref={ref}
        className="relative w-full max-w-[400px] aspect-[9/16] bg-stone-100 mx-auto overflow-hidden shadow-2xl"
        style={{ fontFamily: "'Noto Serif SC', serif" }}
      >
        {/* Background Image */}
        {imageUrl ? (
          imageUrl.startsWith("linear-gradient") || imageUrl.startsWith("#") || imageUrl.startsWith("rgb") ? (
            <div
              className="absolute inset-0 w-full h-full"
              style={{ background: imageUrl }}
            />
          ) : (
            <img
              src={imageUrl}
              alt="Poster Background"
              className="absolute inset-0 w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-200 text-stone-400">
            {isGenerating ? "正在生成意境海报..." : "暂无海报背景"}
          </div>
        )}

        {/* Date and Theme Area (Top Left) */}
        <div className={cn("absolute top-6 left-6 z-10 flex flex-col items-start border-l-2 pl-2", accentColorClass)}>
          <div className={cn("font-bold text-xl drop-shadow-md tracking-wider", dateColorClass)}>{monthDay}</div>
          <div className={cn("font-medium text-sm drop-shadow-md mt-0.5", textColorClass)}>{displayTheme}</div>
        </div>

        {/* Greeting Text (Center) */}
        <div className={cn(
          "absolute z-10 flex left-1/2 -translate-x-1/2",
          isVertical 
            ? "top-[15%] h-[60%] items-center justify-center" 
            : "top-[15%] bottom-[20%] w-[85%] flex-col items-center justify-center text-center"
        )}>
          <p
            className={cn(
              "font-bold drop-shadow-md",
              greetingTextColorClass,
              isVertical 
                ? "text-3xl md:text-4xl h-full" 
                : formattedText.length > 20 
                  ? "text-xl md:text-2xl leading-relaxed" 
                  : "text-2xl md:text-3xl leading-relaxed"
            )}
            style={{
              textShadow: greetingTextShadow,
              writingMode: isVertical ? "vertical-rl" : "horizontal-tb",
              textOrientation: isVertical ? "upright" : "mixed",
              letterSpacing: isVertical ? "0.3em" : "0.15em",
              lineHeight: isVertical ? "2" : "2.2",
              whiteSpace: "pre-wrap",
              textAlign: "center",
            }}
          >
            {formattedText}
          </p>
        </div>

        {/* Business Card Area (Bottom 1/6) */}
        {(hasCardInfo || profile.logo) && (
          <div 
            className="absolute bottom-0 left-0 w-full h-[20%] border-t p-3 flex items-center gap-4 z-10"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(255, 255, 255, 0.5)"
            }}
          >
            {hasCardInfo && (
              <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
                {profile.name && (
                  <h3 className="text-lg font-bold text-stone-800 mb-1 font-sans leading-normal pb-0.5">
                    {profile.name}
                  </h3>
                )}
                <div className="flex flex-col gap-1 text-xs text-stone-600 font-sans leading-normal pb-0.5">
                  {profile.phone && (
                    <div className="flex items-center gap-1.5 leading-none">
                      <Phone className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span className="break-words leading-normal">{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-start gap-1.5 leading-none">
                      <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className="whitespace-pre-wrap break-words leading-normal">{profile.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile.logo && (
              <div className="h-[70%] aspect-square shrink-0">
                <div
                  className={cn(
                    "w-full h-full overflow-hidden bg-white flex items-center justify-center",
                    {
                      "border-2 border-[#C91F37]": profile.logoBorder === "seal",
                      "border-[1px] border-[#D4AF37] shadow-[0_2px_4px_rgba(212,175,55,0.3)]":
                        profile.logoBorder === "gold",
                      "shadow-lg": profile.logoBorder === "shadow",
                    }
                  )}
                >
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Watermark removed */}
      </div>
    );
  }
);

Poster.displayName = "Poster";
