import { GoogleGenAI } from "@google/genai";
import { Holiday } from "./holidays";

export async function generateGreeting(date: Date, theme: Holiday): Promise<string> {
  const fallbackGreeting = (() => {
    switch (theme.name) {
      case "温柔治愈": return "日子温柔，万事顺意";
      case "简约随性": return "平平淡淡也很好";
      case "积极向上": return "保持热爱，奔赴山海";
      case "文艺清新": return "风遇山止，心向光亮";
      case "烟火生活": return "三餐四季，温柔有趣";
      default: return theme.theme || "生意兴隆，财源广进";
    }
  })();

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
    
    let roleDescription = "你是一个专业的商务文案专家。请为一位40-60岁的个体经营者（档口老板、餐饮店主、贸易商）生成一条用于发朋友圈的节日/节气海报文案。";
    let toneRequirement = "稳重得体，适合商务社交，体现生意人的档次。";
    
    if (theme.name === "温柔治愈") {
      roleDescription = "你是一个温暖治愈的文案达人。请生成一条用于发朋友圈的日常早安/问候海报文案。";
      toneRequirement = "温柔治愈，像一阵春风，给人带来内心的平静与温暖。";
    } else if (theme.name === "简约随性") {
      roleDescription = "你是一个崇尚极简生活的文案达人。请生成一条用于发朋友圈的日常早安/问候海报文案。";
      toneRequirement = "简约随性，平平淡淡，不加修饰，透着一种松弛感。";
    } else if (theme.name === "积极向上") {
      roleDescription = "你是一个充满正能量的文案达人。请生成一条用于发朋友圈的日常早安/问候海报文案。";
      toneRequirement = "积极向上，充满元气和动力，鼓励人们热爱生活、全力以赴。";
    } else if (theme.name === "文艺清新") {
      roleDescription = "你是一个充满诗意的文艺青年。请生成一条用于发朋友圈的日常早安/问候海报文案。";
      toneRequirement = "文艺清新，有诗意，像一句现代诗，意境优美。";
    } else if (theme.name === "烟火生活") {
      roleDescription = "你是一个热爱生活、懂生活的人。请生成一条用于发朋友圈的日常早安/问候海报文案。";
      toneRequirement = "充满烟火气，贴近普通人的三餐四季，真实而有趣。";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `${roleDescription}
      
      当前日期/主题：${theme.name}
      主题词：${theme.theme}
      
      要求：
      1. ${toneRequirement}
      2. 格式要求（随机选择以下一种格式输出）：
         - 格式一：八字或十六字的对仗短句。如果是十六字，请在中间断句处换行（例如：\n“新春佳节，万象更新\n岁岁平安，财源广进”）。
         - 格式二：一句完整优美的长句（不需要换行，系统会自动排版）。
      3. 直接输出文案，不要任何解释或引号。`,
      config: {
        temperature: 0.8,
      },
    });

    return response.text?.trim() || fallbackGreeting;
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
    
    if (isRateLimit) {
      console.warn("API 额度已用完，将使用默认文案。您可以稍后再试或更换 API Key。");
    } else {
      console.error("Error generating greeting:", error);
    }
    
    return fallbackGreeting;
  }
}

export async function generateBackgroundImage(theme: Holiday): Promise<string | null> {
  try {
    // If a specific color is defined for this holiday/solar term, use it
    if (theme.color) {
      return theme.color;
    }

    // Specific traditional Chinese solid colors requested by the user
    const colors = [
      "#E9A182", "#E6B653", "#CCD8D0", "#AC243A", "#AC243A",
      "#D3A488", "#D3A488", "#F2E7E5", "#E68959",
      "#AC243A", "#F7CE9B", "#F0A72E", "#FAF3EA",
      "#7097DE", "#AC243A", "#E2BDC4"
    ];
    
    // Pick a random color every time so "换一张" (Regenerate) works
    const index = Math.floor(Math.random() * colors.length);
    
    return colors[index];
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
