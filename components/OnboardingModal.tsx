
import React, { useState } from 'react';
import { ShieldCheck, FileText, Lightbulb, ChevronRight, X, Sparkles, Target, Settings2 } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "医学科研转化智能顾问",
      description: "欢迎使用您的私人科研转化专家。我将协助您缩短医学技术从实验室到临床应用的距离。",
      icon: <Sparkles className="w-12 h-12 text-medical-500" />,
      color: "bg-medical-50"
    },
    {
      title: "专利布局与合规护航",
      description: "深度解析专利挖掘点，预判医疗器械研发与临床试验方案中的合规风险与伦理障碍。",
      icon: <Target className="w-12 h-12 text-indigo-500" />,
      color: "bg-indigo-50"
    },
    {
      title: "转化路径精准规划",
      description: "针对您的具体项目，提供定制化的路径规划、IP权属分析及转化合规建议。",
      icon: <Settings2 className="w-12 h-12 text-emerald-500" />,
      color: "bg-emerald-50"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white w-full max-w-md mx-4 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden border border-white animate-scale-in relative">
        
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-medical-500/10 to-transparent pointer-events-none" />

        <div className="p-10 relative">
          <div className="flex justify-between items-center mb-10">
            <div className="flex space-x-2.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === step ? 'w-10 bg-medical-500' : 'w-2 bg-slate-200'
                  }`} 
                />
              ))}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center min-h-[240px]">
             <div className={`p-7 rounded-3xl mb-8 ${steps[step].color} shadow-inner transition-colors duration-500`}>
                {steps[step].icon}
             </div>
             
             <h2 className="text-2xl font-bold text-slate-800 mb-4 animate-fade-in-up">
               {steps[step].title}
             </h2>
             
             <p className="text-slate-500 leading-relaxed text-[15px] animate-fade-in-up [animation-delay:100ms]">
               {steps[step].description}
             </p>
          </div>

          <button 
            onClick={handleNext}
            className="w-full mt-10 bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-medical-500/20 hover:shadow-medical-500/40 active:scale-[0.98] transition-all flex items-center justify-center group"
          >
            {step === steps.length - 1 ? '开启专家咨询' : '下一步'}
            {step !== steps.length - 1 && <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </div>
    </div>
  );
};
