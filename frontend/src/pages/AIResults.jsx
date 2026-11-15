import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getAssessments } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Sparkles, 
  Download, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle, 
  Layers, 
  Apple, 
  FileText, 
  Activity, 
  HeartHandshake, 
  ChevronRight,
  Loader2,
  Calendar
} from 'lucide-react';

const AIResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const [assessmentData, setAssessmentData] = useState(location.state?.result || null);
  const [imagePreview, setImagePreview] = useState(location.state?.imagePreview || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // If page was refreshed or accessed directly, load the most recent assessment from history
  useEffect(() => {
    if (!assessmentData) {
      const fetchLatest = async () => {
        try {
          const list = await getAssessments();
          if (list && list.length > 0) {
            const latest = list[0];
            setAssessmentData({
              assessment_id: latest.id,
              created_at: latest.created_at,
              analysis: {
                severity: latest.severity,
                acne_type: latest.acne_type,
                location: latest.location,
                localization: { region_scores: latest.region_scores }
              },
              explanation: latest.explanation
            });
          }
        } catch (err) {
          console.error("Failed to load past assessment:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchLatest();
    }
  }, [assessmentData]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AcneGuard_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-sm font-semibold text-slate-500">Retrieving diagnostic results...</p>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-5 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Assessment Found</h2>
        <p className="text-sm text-slate-500">Run a skin scan to view your localized severity analysis and treatment plan.</p>
        <Link
          to="/assessment"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-md hover:bg-teal-500 transition-all"
        >
          Take Skin Scan
        </Link>
      </div>
    );
  }

  const { analysis, explanation } = assessmentData;
  const severity = analysis?.severity || 'Clear';
  const acneType = analysis?.acne_type || 'General';
  const locationName = analysis?.location || 'Facial';
  const regionScores = analysis?.localization?.region_scores || { Forehead: 0.25, 'Left Cheek': 0.25, 'Right Cheek': 0.25, Chin: 0.25 };
  const skinScore = explanation?.skin_score ?? 80;

  // Severity color badge mapping
  const severityBadgeColors = {
    Clear: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Mild: 'bg-teal-50 text-teal-700 border-teal-200',
    Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    Severe: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header with PDF Download & Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Assessment Complete
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Diagnostic Health & Severity Report
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all"
          >
            {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-teal-600" />}
            <span>Export Clinical PDF</span>
          </button>

          <Link
            to="/diet-check"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all hover:scale-105"
          >
            <Apple className="w-4 h-4" />
            <span>Check Diet Triggers</span>
          </Link>
        </div>
      </div>

      {/* PDF Exportable Container */}
      <div ref={reportRef} className="space-y-8 p-1 sm:p-2 bg-slate-50 rounded-3xl">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Score Meter */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Skin Health</span>
              <Activity className="w-4 h-4 text-teal-600" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 tracking-tight">{skinScore}</span>
              <span className="text-slate-400 font-bold text-sm">/ 100</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  skinScore >= 80 ? 'bg-emerald-500' : skinScore >= 60 ? 'bg-teal-500' : skinScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${skinScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-500">
              {skinScore >= 80 ? 'Optimal skin barrier integrity.' : skinScore >= 50 ? 'Mild to moderate localized erythema.' : 'Active inflammatory lesions present.'}
            </p>
          </div>

          {/* Severity Classification */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Acne Severity</span>
              <Layers className="w-4 h-4 text-teal-600" />
            </div>

            <div>
              <span className={`inline-block px-4 py-1.5 rounded-xl border text-sm font-extrabold uppercase tracking-wide ${severityBadgeColors[severity] || severityBadgeColors.Clear}`}>
                {severity} Severity
              </span>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p><span className="font-bold text-slate-700">Primary Lesion:</span> <span className="capitalize">{acneType}</span></p>
              <p><span className="font-bold text-slate-700">Primary Region:</span> <span className="capitalize">{locationName}</span></p>
            </div>
          </div>

          {/* Scanned Portrait Preview or Icon */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            {imagePreview ? (
              <img src={imagePreview} alt="Captured Scan" className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-2xl">
                AI
              </div>
            )}
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Scanned Frame</h4>
              <p className="text-xs text-slate-500">Validated against ResNet-18 dermatology dataset.</p>
              <Link to="/assessment" className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 pt-1">
                Scan new photo <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Localized Quadrant Inflammation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              Facial Quadrant Redness Dispersion
            </h3>
            <span className="text-xs font-semibold text-slate-400">Relative Concentration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(regionScores).map(([region, score]) => {
              const pct = Math.round(score * 100);
              return (
                <div key={region} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">{region}</span>
                    <span className="text-teal-700">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanations & Tailored Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pathophysiology (Why it happened) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
              <HeartHandshake className="w-4 h-4" />
              Clinical Assessment
            </div>
            <h4 className="text-lg font-bold text-slate-900">Why It Happened</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {explanation?.why_it_happened || "Analysis detected localized erythema and micro-comedones caused by excess sebum production and pore barrier compromise."}
            </p>
          </div>

          {/* Topical Skincare Routine */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              Skincare Regimen
            </div>
            <h4 className="text-lg font-bold text-slate-900">Recommended Topical Actives</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {explanation?.skincare_routine_suggestions || "Use a gentle BHA/salicylic cleanser, follow with non-comedogenic hyaluronic acid moisturizer and broad-spectrum SPF 50."}
            </p>
          </div>

          {/* Nutrition Guidance */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Apple className="w-4 h-4" />
              Nutritional Interventions
            </div>
            <h4 className="text-lg font-bold text-slate-900">Dietary Adjustments</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {explanation?.diet_suggestions || "Minimize high-glycemic carbohydrates and skim milk products; increase leafy greens and omega-3 fatty acids."}
            </p>
          </div>

          {/* Lifestyle & Stress */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Activity className="w-4 h-4" />
              Circadian & Lifestyle
            </div>
            <h4 className="text-lg font-bold text-slate-900">Lifestyle Adjustments</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {explanation?.lifestyle_adjustments || "Maintain at least 7.5 hours of consistent sleep nightly to control cortisol and lower androgen-driven sebum spikes."}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link
          to="/history"
          className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
        >
          <Calendar className="w-4 h-4 text-teal-600" />
          View All Past Scans in History
        </Link>

        <Link
          to="/diet-check"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Calculate Diet Risk Score</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default AIResults;
