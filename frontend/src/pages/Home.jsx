import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Apple, 
  ShieldCheck, 
  Scan, 
  Activity, 
  FileCheck, 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  HeartHandshake 
} from 'lucide-react';

const Home = () => {
  const { token } = useAuth();

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white p-8 sm:p-14 lg:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-teal-400" />
            Clinical-Grade Computer Vision & Lifestyle AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Target Acne At The Root. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">
              Powered by AI Diagnosis.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Upload a facial photo or take a live scan to detect acne severity, localized inflammation, and lesion types. Pair it with our nutrition engine to identify dietary triggers.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              to={token ? "/assessment" : "/register"}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Scan className="w-5 h-5" />
              Start Free Skin Scan
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={token ? "/diet-check" : "/login"}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-base transition-all hover:border-slate-600"
            >
              <Apple className="w-5 h-5 text-emerald-400" />
              Analyze Diet Triggers
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Instant Facial Quadrant Scoring
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> High-Resolution PyTorch ResNet
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> 100% Private & Encrypted
            </span>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600">Dual-Engine Diagnostics</h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Skin Health Assessment
          </p>
          <p className="text-slate-600 text-sm sm:text-base">
            Skin conditions are rarely skin-deep. AcneGuard combines visual lesion mapping with metabolic lifestyle triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Visual Severity Scan</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Analyzes forehead, cheeks, and chin redness variance and classifies severity across Clear, Mild, Moderate, and Severe stages.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Diet & Lifestyle Predictor</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Calculates acne flare-up risk based on sugar intake, dairy frequency, glycemic load, water hydration, stress level, and sleep quality.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Progress Tracker & Reports</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Track improvement over time with visual history logs and generate clinical PDF reports ready to share with your dermatologist.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200/60">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How AcneGuard Works in 3 Steps</h2>
            <p className="text-slate-500 text-sm">Get accurate insights in under 30 seconds</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-slate-900">Capture or Upload</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take a selfie using your webcam or upload a clear high-resolution facial photo with even lighting.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-slate-900">AI Deep Scan</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The neural network segments facial quadrants, measuring erythema, lesion densities, and acne classification.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-slate-900">Tailored Plan</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive personalized active ingredient recommendations (BHA, Retinoids, Niacinamide) and dietary guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to take control of your skin?</h3>
          <p className="text-teal-100 text-sm max-w-xl">
            Join thousands tracking their skin recovery with evidence-based AI diagnostics.
          </p>
        </div>
        <Link
          to={token ? "/assessment" : "/register"}
          className="px-8 py-3.5 rounded-2xl bg-white text-teal-900 hover:bg-slate-50 font-bold text-sm shadow-md transition-all hover:scale-105 whitespace-nowrap"
        >
          {token ? "Go to Skin Scan" : "Create Free Account"}
        </Link>
      </section>
    </div>
  );
};

export default Home;
