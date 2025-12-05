import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setSelectedLanguage(savedLanguage);
  }, []);

  // Update localStorage when language changes
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-[#FFD700]" />
        <select
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-[#1A1F3A]/80 text-white border border-[#FFD700]/30 rounded-lg py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 cursor-pointer text-sm backdrop-blur-sm hover:border-[#FFD700]/50 transition-colors"
        >
          <option value="en" className="bg-[#0A0E27]">English</option>
          <option value="hi" className="bg-[#0A0E27]">हिंदी</option>
          <option value="te" className="bg-[#0A0E27]">తెలుగు</option>
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default LanguageSelector;
