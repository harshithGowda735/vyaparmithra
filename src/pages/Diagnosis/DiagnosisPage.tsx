import React, { useState } from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import { 
  Mic, 
  CheckCircle2, 
  Utensils, 
  IndianRupee, 
  Users, 
  MapPin, 
  Info,
  Play,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DiagnosisPage() {
  const { 
    isRecording, 
    setRecording, 
    recordingText, 
    setRecordingText,
    triggerDeepInvestigation,
    profile
  } = useBusinessStore();

  const [inputVal, setInputVal] = useState('');
  const [customTyping, setCustomTyping] = useState(false);

  const predefinedSpeeches = [
    "I run a restaurant in Mysore with about a dozen staff members, doing around 1.8 Lakh in monthly sales...",
    "We operate a small wooden furniture workshop in Hubli with 5 artisans making roughly 90,000 monthly...",
    "I have a retail general grocery shop in Bangalore with 3 delivery boys, making 3.5 Lakh monthly sales..."
  ];

  const handleSpeechSelect = (speech: string) => {
    setRecordingText(speech);
  };

  const handleStartInvestigation = () => {
    triggerDeepInvestigation(recordingText);
  };

  return (
    <div className="pt-24 px-6 md:px-10 max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Step Status Tracker */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="font-mono text-xs text-blue-400 uppercase tracking-widest font-black block">Phase 1: Discovery</span>
            <h2 className="text-2xl font-black text-white">Business Interview</h2>
          </div>
          <span className="text-xs text-slate-400 font-bold">Step 1 of 4</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div className="h-full w-1/4 progress-shimmer rounded-full" />
        </div>
      </div>

      {/* Voice Recording Hub */}
      <div className="relative flex flex-col items-center py-10">
        
        {/* Pulsing Outer Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence>
            {isRecording && (
              <>
                <div className="absolute w-60 h-60 rounded-full border border-blue-500/10 animate-pulse-ring" />
                <div className="absolute w-72 h-72 rounded-full border border-blue-500/5 animate-pulse-ring" style={{ animationDelay: '1s' }} />
                <div className="absolute w-80 h-80 rounded-full border border-blue-500/3 animate-pulse-ring" style={{ animationDelay: '2s' }} />
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Central Recording Button */}
        <button 
          onClick={() => setRecording(!isRecording)}
          className={`relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 cursor-pointer ${
            isRecording ? 'scale-110 brightness-125 glow-blue' : 'hover:scale-105'
          }`}
          title="Toggle Voice Input"
        >
          <Mic className={`w-14 h-14 text-white ${isRecording ? 'animate-bounce' : ''}`} />
        </button>

        <h3 className={`mt-8 text-lg font-bold ${isRecording ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`}>
          {isRecording ? 'Listening...' : 'Tap to Speak'}
        </h3>

        {/* Speech Text Box */}
        <div className="mt-4 w-full max-w-xl text-center space-y-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl min-h-[70px] flex items-center justify-center text-sm text-slate-200 leading-relaxed italic">
            {recordingText}
          </div>

          {/* Quick presets or typing option */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Select a simulation scenario speech preset</p>
            <div className="flex flex-col gap-2">
              {predefinedSpeeches.map((speech, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSpeechSelect(speech)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-xs text-left text-slate-400 hover:text-white transition-all overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  &ldquo;{speech}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Bento Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs text-gray-400 uppercase tracking-widest font-black">Extracted Parameters (Local Real-time Parsing)</h4>
          <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Auto-sync enabled
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Industry */}
          <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 group transition-all">
            <div className="flex justify-between items-start">
              <Utensils className="w-6 h-6 text-blue-400 group-hover:scale-115 transition-transform" />
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Industry</p>
              <p className="text-lg font-black text-blue-400">{profile.industry}</p>
            </div>
          </div>

          {/* Card 2: Revenue */}
          <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 group transition-all">
            <div className="flex justify-between items-start">
              <IndianRupee className="w-6 h-6 text-amber-400 group-hover:scale-115 transition-transform" />
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Revenue</p>
              <p className="text-lg font-black text-amber-400">{profile.revenue}</p>
            </div>
          </div>

          {/* Card 3: Employees */}
          <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 group transition-all">
            <div className="flex justify-between items-start">
              <Users className="w-6 h-6 text-indigo-400 group-hover:scale-115 transition-transform" />
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Employees</p>
              <p className="text-lg font-black text-indigo-400">{profile.employees}</p>
            </div>
          </div>

          {/* Card 4: Location */}
          <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 group transition-all">
            <div className="flex justify-between items-start">
              <MapPin className="w-6 h-6 text-blue-400 group-hover:scale-115 transition-transform" />
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Location</p>
              <p className="text-lg font-black text-blue-400">{profile.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Warning Bar */}
      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          AI is listening for business operational details to customize your roadmap. Tap &lsquo;Investigate&rsquo; below to trigger Gemma Phase 2 deep investigation.
        </p>
      </div>

      {/* Submission Trigger */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleStartInvestigation}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg hover:scale-[1.01] active:scale-95 transition-all border border-blue-400/10"
        >
          <BrainCircuit className="w-4 h-4" /> Trigger Gemma Deep Investigation <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
