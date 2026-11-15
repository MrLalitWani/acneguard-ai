import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="flex justify-center items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span className="text-white font-extrabold tracking-tight">
            AcneGuard<span className="text-teal-400 font-bold">AI</span>
          </span>
        </div>
        <p className="text-sm max-w-md mx-auto leading-relaxed text-slate-400">
          Powered by state-of-the-art Computer Vision and Lifestyle Analytics. Understand your skin from the inside out.
        </p>
        <div className="border-t border-slate-800/80 pt-6 text-xs space-y-2 max-w-2xl mx-auto">
          <p className="text-slate-500">
            © {new Date().getFullYear()} AcneGuard AI. All rights reserved. Registered under clinical AI guidelines.
          </p>
          <p className="text-slate-600 leading-normal">
            Disclaimer: The skin scans and lifestyle analyses provided by AcneGuard AI are for educational and risk-modeling purposes only. They do not constitute formal medical diagnoses or prescriptions. Please consult a board-certified dermatologist for clinical skin treatments.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
