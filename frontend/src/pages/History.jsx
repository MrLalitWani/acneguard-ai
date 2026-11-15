import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAssessments, deleteAssessment } from '../services/api';
import { 
  History as HistoryIcon, 
  Sparkles, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  Activity, 
  Layers, 
  Loader2, 
  AlertCircle,
  Scan
} from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getAssessments();
      setAssessments(data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to retrieve assessment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
    setDeletingId(id);
    try {
      await deleteAssessment(id);
      setAssessments(assessments.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete assessment. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewAssessment = (item) => {
    navigate('/ai-results', {
      state: {
        result: {
          assessment_id: item.id,
          created_at: item.created_at,
          analysis: {
            severity: item.severity,
            acne_type: item.acne_type,
            location: item.location,
            localization: { region_scores: item.region_scores }
          },
          explanation: item.explanation
        }
      }
    });
  };

  const severityBadgeColors = {
    Clear: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Mild: 'bg-teal-50 text-teal-700 border-teal-200',
    Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    Severe: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider mb-1">
            <HistoryIcon className="w-4 h-4" /> Timeline Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Skin Progress & Assessment History
          </h1>
        </div>

        <Link
          to="/assessment"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all hover:scale-105"
        >
          <Scan className="w-4 h-4" />
          <span>New Skin Scan</span>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-sm font-medium text-slate-500">Loading your skin journey...</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Assessment History Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Take your first facial AI scan to start logging your skin barrier recovery and localized severity over time.
          </p>
          <div className="pt-2">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md"
            >
              Start First Scan
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((item) => {
            const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const score = item.explanation?.skin_score ?? 80;

            return (
              <div
                key={item.id}
                onClick={() => handleViewAssessment(item)}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-teal-300"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center flex-shrink-0 text-slate-700">
                    <span className="text-lg font-black">{score}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Score</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${severityBadgeColors[item.severity] || severityBadgeColors.Clear}`}>
                        {item.severity}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 capitalize">
                        {item.acne_type ? `${item.acne_type} acne` : 'General'}
                      </span>
                      {item.location && item.location !== 'none' && (
                        <span className="text-xs text-slate-400 capitalize">
                          • Primary: {item.location}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete record"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex items-center gap-1 text-xs font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
