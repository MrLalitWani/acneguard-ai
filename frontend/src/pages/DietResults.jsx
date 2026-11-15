import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Apple, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Scan, 
  HeartHandshake, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';

const DietResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result;
  const formData = location.state?.formData;

  if (!result) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-5 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <Apple className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Assessment Data Found</h2>
        <p className="text-sm text-slate-500">Please complete the lifestyle and nutrition questionnaire to view your personalized risk analysis.</p>
        <Link
          to="/diet-check"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-500 transition-all"
        >
          Take Diet Assessment
        </Link>
      </div>
    );
  }

  const { risk_level, confidence_score, main_causes, recommendations } = result;

  const riskBadgeStyles = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const confidencePct = Math.round(confidence_score * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Analysis Complete
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Diet & Metabolic Risk Report
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/diet-check"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Retake Assessment</span>
          </Link>

          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all hover:scale-105"
          >
            <Scan className="w-4 h-4" />
            <span>Take Visual Scan</span>
          </Link>
        </div>
      </div>

      {/* Main Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Level Badge Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Diet-Induced Acne Flare Risk</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>

          <div>
            <span className={`inline-block px-5 py-2 rounded-2xl border text-xl font-black uppercase tracking-wider ${riskBadgeStyles[risk_level] || riskBadgeStyles.Low}`}>
              {risk_level} Risk
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {risk_level === 'Low' && 'Your nutritional habits and hydration are supportive of healthy skin barrier turnover.'}
            {risk_level === 'Medium' && 'Moderate inflammatory dietary factors detected that could trigger periodic skin flares.'}
            {risk_level === 'High' && 'Significant dietary or metabolic triggers (glycemic spikes, dairy hormones, or stress) strongly correlated with active breakouts.'}
          </p>
        </div>

        {/* Confidence Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Decision Confidence</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tight">{confidencePct}%</span>
            <span className="text-slate-400 font-bold text-xs">Model Predictive Fit</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${confidencePct}%` }} 
            />
          </div>

          <p className="text-xs text-slate-400">
            Validated across multi-factorial clinical acne risk scoring benchmarks.
          </p>
        </div>
      </div>

      {/* Identified Root Causes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Key Nutritional & Lifestyle Triggers Identified
        </h3>

        <div className="space-y-3 pt-2">
          {main_causes && main_causes.length > 0 ? (
            main_causes.map((cause, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-sm text-slate-700 leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{cause}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No high-risk triggers detected in your current profile.</p>
          )}
        </div>
      </div>

      {/* Clinical Recommendations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-emerald-600" />
          Evidence-Based Action Items & Modifications
        </h3>

        <div className="space-y-3 pt-2">
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Continue with your balanced nutritional regimen.</p>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link
          to="/history"
          className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          View past skin assessments & progress
        </Link>

        <Link
          to="/assessment"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Correlate With Facial Skin Scan</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default DietResults;
