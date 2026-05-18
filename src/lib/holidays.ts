import { format, isSameDay, parseISO } from "date-fns";

export interface Holiday {
  date: string; // MM-DD format
  name: string;
  theme: string;
  elements: string;
  color?: string;
}

export const HOLIDAYS: Holiday[] = [
  { date: "01-01", name: "元旦", theme: "新年新气象，万象皆更新", elements: "红灯笼、烟花、初升的太阳、金色元素", color: "#AC243A" },
  { date: "02-14", name: "情人节", theme: "浪漫温馨，爱意满满", elements: "玫瑰、爱心、暖色调、丝带", color: "#E2BDC4" },
  { date: "03-08", name: "妇女节", theme: "致敬女性力量，优雅自信", elements: "康乃馨、女性剪影、柔和粉色、春日花卉", color: "#F2E7E5" },
  { date: "04-04", name: "清明节", theme: "缅怀先人，春和景明", elements: "青草、细雨、柳枝、淡雅青色", color: "#CCD8D0" },
  { date: "05-01", name: "劳动节", theme: "致敬奋斗者，劳动最光荣", elements: "齿轮、麦穗、阳光、金色光芒", color: "#E6B653" },
  { date: "06-01", name: "儿童节", theme: "童心未泯，快乐相伴", elements: "气球、风车、明亮色彩、童趣玩具", color: "#7097DE" },
  { date: "10-01", name: "国庆节", theme: "盛世华诞，举国同庆", elements: "红旗、华表、长城、中国红", color: "#AC243A" },
  { date: "12-25", name: "圣诞节", theme: "平安喜乐，冬日温馨", elements: "圣诞树、雪花、礼物盒、红绿配色", color: "#AC243A" },
  // Lunar holidays (simplified to fixed dates for this demo, ideally use a lunar calendar library)
  { date: "02-10", name: "春节", theme: "辞旧迎新，阖家团圆", elements: "红灯笼、福字、爆竹、中国结、朱砂红", color: "#AC243A" },
  { date: "02-24", name: "元宵节", theme: "花好月圆，良宵美景", elements: "花灯、汤圆、满月、夜景", color: "#F7CE9B" },
  { date: "06-10", name: "端午节", theme: "粽叶飘香，龙舟竞渡", elements: "粽子、龙舟、艾草、雅青色", color: "#CCD8D0" },
  { date: "09-17", name: "中秋节", theme: "月圆人团圆，千里共婵娟", elements: "满月、桂花、月饼、玉兔、琥珀金", color: "#F0A72E" },
];

export const SOLAR_TERMS: Holiday[] = [
  { date: "02-04", name: "立春", theme: "春回大地，万物复苏", elements: "嫩芽、春风、淡绿色", color: "#CCD8D0" },
  { date: "03-20", name: "春分", theme: "昼夜平分，春色正中", elements: "燕子、桃花、春水", color: "#CCD8D0" },
  { date: "05-05", name: "立夏", theme: "万物繁茂，夏日初长", elements: "荷叶、初夏阳光、翠绿", color: "#CCD8D0" },
  { date: "06-21", name: "夏至", theme: "日长之至，盛夏光年", elements: "骄阳、绿荫、蝉鸣", color: "#E6B653" },
  { date: "08-07", name: "立秋", theme: "秋风送爽，丰收在望", elements: "落叶、金黄麦浪、秋高气爽", color: "#E68959" },
  { date: "09-22", name: "秋分", theme: "秋意渐浓，平分秋色", elements: "红叶、秋水、金桂", color: "#E68959" },
  { date: "11-07", name: "立冬", theme: "冬日初临，万物收藏", elements: "初雪、枯枝、暖阳", color: "#FAF3EA" },
  { date: "12-21", name: "冬至", theme: "冬候极寒，阳气始生", elements: "雪景、梅花、寒冬", color: "#FAF3EA" },
];

export const DAILY_THEMES = [
  { name: "商务日常", theme: "生意兴隆，财源广进", elements: "山水、松柏、茶具、高质感商务红金、稳重传统" },
  { name: "简约随性", theme: "平平淡淡也很好", elements: "留白、极简线条、咖啡杯、绿植、清新" },
  { name: "积极向上", theme: "保持热爱，奔赴山海", elements: "朝阳、山峰、奔跑、明亮色彩、充满希望" },
  { name: "烟火生活", theme: "三餐四季，温柔有趣", elements: "美食、街巷、暖黄灯光、生活气息、温馨" },
];

export function isHolidayOrSolarTerm(date: Date): boolean {
  const monthDay = format(date, "MM-dd");
  return HOLIDAYS.some((h) => h.date === monthDay) || SOLAR_TERMS.some((s) => s.date === monthDay);
}

export function getHolidayOrTheme(date: Date, dailyThemeName: string = "商务日常"): Holiday {
  const monthDay = format(date, "MM-dd");
  
  const holiday = HOLIDAYS.find((h) => h.date === monthDay);
  if (holiday) return holiday;

  const solarTerm = SOLAR_TERMS.find((s) => s.date === monthDay);
  if (solarTerm) return solarTerm;

  const daily = DAILY_THEMES.find(t => t.name === dailyThemeName) || DAILY_THEMES[0];

  return {
    date: monthDay,
    name: daily.name,
    theme: daily.theme,
    elements: daily.elements,
  };
}
