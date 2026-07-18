import React, { useState } from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import { 
  User, 
  Globe, 
  Languages, 
  Bell, 
  KeyRound, 
  Check, 
  Save, 
  Building2, 
  Sparkles,
  Link2,
  Wifi,
  WifiOff,
  RefreshCw,
  Server
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { profile, updateProfile, backendStatus, checkBackendHealth, businessId, setBusinessId } = useBusinessStore();

  const [name, setName] = useState(profile.name);
  const [industry, setIndustry] = useState(profile.industry);
  const [location, setLocation] = useState(profile.location);
  const [language, setLanguage] = useState('English');
  const [isSaving, setIsSaving] = useState(false);

  // Integration toggles
  const [gstAPI, setGstAPI] = useState(true);
  const [whatsappAPI, setWhatsappAPI] = useState(false);
  const [bankAPI, setBankAPI] = useState(true);

  const handleSave = () => {
    setIsSaving(true);
    toast.info('Saving settings to cloud...');
    
    setTimeout(() => {
      updateProfile({
        name,
        industry,
        location
      });
      setIsSaving(false);
      toast.success('Profile and regional settings synchronized successfully!');
    }, 1000);
  };

  const languagesList = [
    { code: 'en', name: 'English', localName: 'English' },
    { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', localName: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'Tamil', localName: 'தமிழ்' },
    { code: 'mr', name: 'Marathi', localName: 'मराठी' },
    { code: 'bn', name: 'Bengali', localName: 'বাংলা' },
  ];

  return (
    <div className="pt-24 px-6 md:px-10 max-w-4xl mx-auto space-y-10 pb-20">
      
      {/* Settings Header */}
      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-gray-400 text-sm">
          Manage your regional compliance profiles, language options, and backend API links.
        </p>
      </section>

      {/* Grid: Profile settings + Language Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Details Card */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2 border-b border-white/5 pb-3">
            <User className="w-5 h-5 text-[#adc6ff]" /> Owner Profile
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold block">Full Name</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C4DFF]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold block">MSME Industry Sector</label>
              <select 
                className="w-full bg-[#0d1226] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C4DFF] cursor-pointer"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="Food Processing">Food &amp; Beverage / Restaurant</option>
                <option value="Wooden Furniture">Handicrafts &amp; Woodcraft</option>
                <option value="Grocery Retail">Retail Stores &amp; Groceries</option>
                <option value="Garment Design">Apparel &amp; Textiles</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold block">Primary City / Region</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C4DFF]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Regional Language Card */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2 border-b border-white/5 pb-3">
            <Languages className="w-5 h-5 text-[#cdbdff]" /> Language of Operation
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {languagesList.map((lang) => {
              const isSel = language === lang.name;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.name);
                    toast.success(`AI translation set to ${lang.name}!`);
                  }}
                  className={`p-4 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                    isSel 
                      ? 'border-[#7C4DFF] bg-[#7C4DFF]/10' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="text-xs text-gray-400 font-semibold">{lang.name}</span>
                  <span className="text-lg font-black text-white mt-1">{lang.localName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Integration Options */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-2 border-b border-white/5 pb-3">
          <Link2 className="w-5 h-5 text-[#ffb780]" /> API &amp; Integrations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* GST portal */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between min-h-[140px]">
            <div>
              <h4 className="font-bold text-sm text-white">GST Portal</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Fetch GSTR filing status automatically.</p>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className={`text-[10px] font-black uppercase ${gstAPI ? 'text-green-400' : 'text-gray-500'}`}>
                {gstAPI ? 'Linked' : 'Offline'}
              </span>
              <button 
                onClick={() => setGstAPI(!gstAPI)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors ${gstAPI ? 'bg-[#4285F4]' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${gstAPI ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* WhatsApp API */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between min-h-[140px]">
            <div>
              <h4 className="font-bold text-sm text-white">WhatsApp API</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Auto-respond to vendor catalogs.</p>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className={`text-[10px] font-black uppercase ${whatsappAPI ? 'text-[#cdbdff]' : 'text-gray-500'}`}>
                {whatsappAPI ? 'Linked' : 'Offline'}
              </span>
              <button 
                onClick={() => {
                  setWhatsappAPI(!whatsappAPI);
                  if(!whatsappAPI) toast.success('Connecting WhatsApp Sandbox environment...');
                }}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors ${whatsappAPI ? 'bg-[#7C4DFF]' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${whatsappAPI ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Bank Account */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between min-h-[140px]">
            <div>
              <h4 className="font-bold text-sm text-white">MSME Bank Sync</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Direct digital ledger check for loans.</p>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className={`text-[10px] font-black uppercase ${bankAPI ? 'text-green-400' : 'text-gray-500'}`}>
                {bankAPI ? 'Linked' : 'Offline'}
              </span>
              <button 
                onClick={() => setBankAPI(!bankAPI)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors ${bankAPI ? 'bg-[#4285F4]' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${bankAPI ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Display & Theming */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-2 border-b border-gray-200 dark:border-white/5 pb-3">
          <Sparkles className="w-5 h-5 text-amber-500" /> Display & Theme
        </h3>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl">
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Dark Mode Theme</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Toggle the cyberpunk neon aesthetic or bright minimal view.</p>
          </div>
          <button 
            onClick={() => {
              useBusinessStore.getState().toggleTheme();
              toast.success('Theme preference updated.');
            }}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors ${useBusinessStore.getState().theme === 'dark' ? 'bg-[#7C4DFF]' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${useBusinessStore.getState().theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white rounded-xl font-bold flex items-center gap-2 text-xs transition-transform active:scale-95 shrink-0 shadow-lg cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>
    </div>
  );
}
