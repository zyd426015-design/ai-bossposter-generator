import React, { ChangeEvent } from "react";
import { ProfileData } from "./Poster";
import { getBase64, cn } from "../lib/utils";
import { Upload, Image as ImageIcon, MapPin } from "lucide-react";

interface ProfileFormProps {
  profile: ProfileData;
  onChange: (profile: ProfileData) => void;
}

export function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const [greetingMode, setGreetingMode] = React.useState<'ai' | 'custom'>(
    profile.customText ? 'custom' : 'ai'
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...profile, [name]: value });
  };

  const handleModeChange = (mode: 'ai' | 'custom') => {
    setGreetingMode(mode);
    if (mode === 'ai') {
      onChange({ ...profile, customText: "" });
    }
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await getBase64(file);
      onChange({ ...profile, logo: base64 });
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("您的浏览器不支持定位功能");
      return;
    }
    onChange({ ...profile, address: "正在获取位置..." });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange({ ...profile, address: `定位坐标: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (建议手动补充详细地址)` });
      },
      (error) => {
        console.error(error);
        alert("无法获取位置，请检查权限");
        onChange({ ...profile, address: "" });
      }
    );
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-stone-100">
      <div>
        <h2 className="text-xl font-bold text-stone-800 mb-4 font-serif">商户档案</h2>
        <p className="text-sm text-stone-500 mb-6">完善信息，让海报更具商业价值。</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">商家名称 (选填)</label>
          <input
            type="text"
            name="name"
            maxLength={20}
            value={profile.name}
            onChange={handleChange}
            placeholder="例如：张记海鲜批发"
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C91F37] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">联系方式 (选填)</label>
          <input
            type="text"
            name="phone"
            maxLength={20}
            value={profile.phone}
            onChange={handleChange}
            placeholder="例如：138-xxxx-xxxx"
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C91F37] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-stone-700">地址 (选填)</label>
            <button
              type="button"
              onClick={handleLocate}
              className="flex items-center gap-1 text-xs text-[#C91F37] hover:text-[#A81A2E] font-medium"
            >
              <MapPin className="w-3 h-3" /> 自动定位
            </button>
          </div>
          <textarea
            name="address"
            value={profile.address}
            onChange={handleChange}
            placeholder="例如：广州市天河区xx路xx号"
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C91F37] focus:border-transparent outline-none transition-all resize-y h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">祝福语设置</label>
          <div className="flex gap-4 mb-3">
            <button
              type="button"
              onClick={() => handleModeChange('ai')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                greetingMode === 'ai'
                  ? "bg-[#C91F37] text-white border-[#C91F37]"
                  : "bg-stone-50 text-stone-600 border-stone-200 hover:border-[#C91F37]"
              )}
            >
              自动生成
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('custom')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                greetingMode === 'custom'
                  ? "bg-[#C91F37] text-white border-[#C91F37]"
                  : "bg-stone-50 text-stone-600 border-stone-200 hover:border-[#C91F37]"
              )}
            >
              自定义内容
            </button>
          </div>
          
          {greetingMode === 'custom' && (
            <textarea
              name="customText"
              maxLength={100}
              value={profile.customText}
              onChange={handleChange}
              placeholder="请输入祝福语，支持8字/16字短句，或一段完整长句。"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C91F37] focus:border-transparent outline-none transition-all resize-none h-24"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Logo 上传 (选填)</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-[#C91F37] transition-colors bg-stone-50">
              {profile.logo ? (
                <img src={profile.logo} alt="Logo preview" className="w-full h-full object-contain p-1" />
              ) : (
                <div className="flex flex-col items-center text-stone-400">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">点击上传</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            
            {profile.logo && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-700 mb-1">Logo 边框样式</label>
                <select
                  name="logoBorder"
                  value={profile.logoBorder}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C91F37] focus:border-transparent outline-none bg-white"
                >
                  <option value="seal">中式朱砂印章框 (适合传统节日)</option>
                  <option value="gold">圆润描金边框 (适配商务风格)</option>
                  <option value="shadow">悬浮微影 (适配现代简约)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
