import React from 'react';
import { IndustryTemplate, Tenant, ChatbotConfig } from '../types';
import { INDUSTRY_TEMPLATES } from '../data/templates';
import { Sparkles, Stethoscope, Building, ShoppingBag, Utensils, Landmark, Factory, GraduationCap, Check, ArrowRight, X } from 'lucide-react';

interface IndustryTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTenant: Tenant;
  onApplyTemplate: (template: IndustryTemplate) => void;
}

export const IndustryTemplateModal: React.FC<IndustryTemplateModalProps> = ({
  isOpen,
  onClose,
  activeTenant,
  onApplyTemplate
}) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope className="w-5 h-5 text-rose-500" />;
      case 'Building': return <Building className="w-5 h-5 text-blue-500" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-amber-500" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-orange-500" />;
      case 'Landmark': return <Landmark className="w-5 h-5 text-emerald-500" />;
      case 'Factory': return <Factory className="w-5 h-5 text-purple-500" />;
      default: return <GraduationCap className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-4xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Pre-Built Industry Solutions & Templates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select an industry preset to instantly configure chatbot persona, RAG knowledge bases, FAQs, and workflow triggers for <strong className="text-slate-800 dark:text-slate-200">{activeTenant.name}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INDUSTRY_TEMPLATES.map((tmpl) => {
            const isCurrentIndustry = activeTenant.industry === tmpl.id;

            return (
              <div
                key={tmpl.id}
                className={`border rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between ${
                  isCurrentIndustry
                    ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700">
                        {getIcon(tmpl.iconName)}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{tmpl.name}</h4>
                    </div>

                    {isCurrentIndustry && (
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tmpl.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <p><strong className="text-slate-700 dark:text-slate-300">Default Bot:</strong> {tmpl.defaultConfig.name}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Sample Docs:</strong> {tmpl.sampleDocs.map(d => d.title).join(', ')}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Workflows:</strong> {tmpl.workflows.map(w => w.name).join(', ')}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onApplyTemplate(tmpl);
                    onClose();
                  }}
                  className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    isCurrentIndustry
                      ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                      : 'bg-slate-800 dark:bg-slate-700 hover:bg-indigo-600 text-white'
                  }`}
                >
                  <span>{isCurrentIndustry ? 'Re-Apply Industry Preset' : 'Apply Industry Template'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
