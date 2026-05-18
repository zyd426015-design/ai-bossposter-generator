import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { Download, RefreshCw, User, Image as ImageIcon, AlignLeft, AlignCenter } from "lucide-react";
import { Poster, ProfileData } from "./components/Poster";
import { ProfileForm } from "./components/ProfileForm";
import { CalendarSelector } from "./components/CalendarSelector";
import { getHolidayOrTheme, isHolidayOrSolarTerm, DAILY_THEMES } from "./lib/holidays";
import { generateGreeting, generateBackgroundImage } from "./lib/ai";
import { cn } from "./lib/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState<"poster" | "profile">("poster");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [textLayout, setTextLayout] = useState<"vertical" | "horizontal">("vertical");
  const [dailyTheme, setDailyTheme] = useState<string>("商务日常");
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem("merchantProfile");
    return saved
      ? JSON.parse(saved)
      : {
          name: "",
          phone: "",
          address: "",
          logo: null,
          logoBorder: "seal",
          customText: "",
        };
  });

  const [posterData, setPosterData] = useState<{
    imageUrl: string | null;
    greetingText: string;
  }>({
    imageUrl: null,
    greetingText: "生意兴隆，财源广进",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  // Save profile to local storage
  useEffect(() => {
    localStorage.setItem("merchantProfile", JSON.stringify(profile));
  }, [profile]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const theme = getHolidayOrTheme(selectedDate, dailyTheme);
      
      // Generate text and image in parallel
      const [greeting, bgImage] = await Promise.all([
        generateGreeting(selectedDate, theme),
        generateBackgroundImage(theme),
      ]);

      setPosterData({
        imageUrl: bgImage,
        greetingText: greeting,
      });
    } catch (error: any) {
      console.error("Generation failed:", error);
      alert("生成失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial generation on mount if no image exists
  useEffect(() => {
    if (!posterData.imageUrl) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate when date changes
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Regenerate when daily theme changes (and it's not a holiday)
  useEffect(() => {
    if (!isHolidayOrSolarTerm(selectedDate)) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyTheme]);

  // Auto-switch layout based on text length when new greeting is generated
  useEffect(() => {
    // If it's a long sentence (more than 20 chars), default to horizontal
    // Otherwise default to vertical for 8/16 char phrases
    if (posterData.greetingText.length > 20) {
      setTextLayout("horizontal");
    } else {
      setTextLayout("vertical");
    }
  }, [posterData.greetingText]);

  const handleExport = async () => {
    if (!posterRef.current) return;
    
    setIsExporting(true);
    // Add a small delay to allow the UI to update to "正在保存..."
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Target 1080px width for export
      const targetWidth = 1080;
      const currentWidth = posterRef.current.offsetWidth;
      const scale = targetWidth / currentWidth;

      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: scale,
        backgroundColor: "#F5F5F4",
      });
      
      const url = canvas.toDataURL("image/png");
      
      // Check if we are in a WeChat environment (Mini Program or WeChat Browser)
      const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
      
      if (isWeChat) {
        // In WeChat, direct download often fails. We show the image in a modal or alert the user to long press.
        // For simplicity, we'll create a temporary full-screen image overlay that the user can long-press.
        const img = new Image();
        img.src = url;
        img.style.position = 'fixed';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100vw';
        img.style.height = '100vh';
        img.style.objectFit = 'contain';
        img.style.backgroundColor = 'rgba(0,0,0,0.9)';
        img.style.zIndex = '9999';
        
        // Add a close button
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '点击关闭 ×<br><span style="font-size: 14px; color: #ccc;">请长按图片保存或发送给朋友</span>';
        closeBtn.style.position = 'fixed';
        closeBtn.style.top = '20px';
        closeBtn.style.left = '0';
        closeBtn.style.width = '100%';
        closeBtn.style.textAlign = 'center';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '18px';
        closeBtn.style.zIndex = '10000';
        closeBtn.style.padding = '10px';
        closeBtn.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
        
        const container = document.createElement('div');
        container.appendChild(img);
        container.appendChild(closeBtn);
        
        container.onclick = () => {
          document.body.removeChild(container);
        };
        
        document.body.appendChild(container);
      } else {
        // Standard browser download
        const link = document.createElement("a");
        link.download = `poster-${selectedDate.getTime()}.png`;
        link.href = url;
        link.click();
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("导出失败，请重试。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C91F37] rounded-md flex items-center justify-center text-white font-serif font-bold text-lg">
              商
            </div>
            <h1 className="text-xl font-bold font-serif tracking-wide">老板节日海报</h1>
          </div>
          
          {/* Desktop Tabs */}
          <div className="hidden md:flex bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("poster")}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                activeTab === "poster" ? "bg-white shadow-sm text-[#C91F37]" : "text-stone-500 hover:text-stone-700"
              )}
            >
              海报生成
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                activeTab === "profile" ? "bg-white shadow-sm text-[#C91F37]" : "text-stone-500 hover:text-stone-700"
              )}
            >
              商户档案
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-2 md:p-4 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
        {/* Mobile View: Conditional Rendering based on activeTab */}
        <div className={cn("md:col-span-12 lg:col-span-8 space-y-2", activeTab !== "poster" && "hidden md:block")}>
          <CalendarSelector selectedDate={selectedDate} onChange={setSelectedDate} />
          
          <div className="bg-white p-3 md:p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center">
            <div className="w-full flex flex-wrap justify-between items-start gap-2 mb-3">
              <div className="min-w-0 flex-1 flex flex-col justify-center min-h-[76px]">
                <div className="flex items-center gap-2">
                  {!isThemeExpanded && (
                    <h2 className="text-lg md:text-xl font-bold font-serif text-stone-800 truncate">
                      {getHolidayOrTheme(selectedDate, dailyTheme).name}
                    </h2>
                  )}
                  {!isHolidayOrSolarTerm(selectedDate) && !isThemeExpanded && (
                    <button
                      onClick={() => setIsThemeExpanded(true)}
                      className="text-xs px-2 py-1 bg-stone-100 rounded-full text-stone-600 flex items-center gap-1 hover:bg-stone-200 transition-colors"
                    >
                      ▾
                    </button>
                  )}
                </div>
                {!isThemeExpanded && (
                  <p className="text-xs md:text-sm text-stone-500 mt-0.5 truncate">
                    主题：{getHolidayOrTheme(selectedDate, dailyTheme).theme}
                  </p>
                )}
                {isThemeExpanded && !isHolidayOrSolarTerm(selectedDate) && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {DAILY_THEMES.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => {
                          setDailyTheme(theme.name);
                          setIsThemeExpanded(false);
                        }}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                          dailyTheme === theme.name
                            ? "bg-[#C91F37] text-white border-[#C91F37]"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:border-[#C91F37] hover:text-[#C91F37]"
                        )}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors disabled:opacity-50 text-xs md:text-sm font-medium w-24"
                  >
                    <RefreshCw className={cn("w-3 h-3 md:w-4 md:h-4", isGenerating && "animate-spin")} />
                    换一换
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={isGenerating || !posterData.imageUrl || isExporting}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#C91F37] hover:bg-[#A81A2E] text-white rounded-lg transition-colors shadow-md shadow-red-900/20 disabled:opacity-50 text-xs md:text-sm font-medium w-24"
                  >
                    <Download className={cn("w-3 h-3 md:w-4 md:h-4", isExporting && "animate-bounce")} />
                    {isExporting ? "保存中" : "保存"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setTextLayout("vertical")}
                    className={cn(
                      "flex items-center justify-center px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all w-24",
                      textLayout === "vertical" ? "bg-stone-200 text-stone-800" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    )}
                    title="竖排排版"
                  >
                    竖排
                  </button>
                  <button
                    onClick={() => setTextLayout("horizontal")}
                    className={cn(
                      "flex items-center justify-center px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all w-24",
                      textLayout === "horizontal" ? "bg-stone-200 text-stone-800" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    )}
                    title="横排排版"
                  >
                    横排
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center bg-stone-50 p-2 md:p-8 rounded-xl border border-stone-100">
              <Poster
                ref={posterRef}
                imageUrl={posterData.imageUrl}
                greetingText={posterData.greetingText}
                profile={profile}
                isGenerating={isGenerating}
                textLayout={textLayout}
                date={selectedDate}
                themeName={getHolidayOrTheme(selectedDate).name}
              />
            </div>
          </div>
        </div>

        <div className={cn("md:col-span-12 lg:col-span-4", activeTab !== "profile" && "hidden md:block")}>
          <ProfileForm profile={profile} onChange={setProfile} />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around p-2 z-50 pb-safe">
        <button
          onClick={() => setActiveTab("poster")}
          className={cn(
            "flex flex-col items-center p-2 w-20 rounded-lg transition-colors",
            activeTab === "poster" ? "text-[#C91F37]" : "text-stone-500"
          )}
        >
          <ImageIcon className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">海报</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex flex-col items-center p-2 w-20 rounded-lg transition-colors",
            activeTab === "profile" ? "text-[#C91F37]" : "text-stone-500"
          )}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">档案</span>
        </button>
      </div>
    </div>
  );
}
