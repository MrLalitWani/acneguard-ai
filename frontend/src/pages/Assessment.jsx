import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSkin } from '../services/api';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sliders, 
  ChevronRight, 
  Info,
  X
} from 'lucide-react';

const Assessment = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Skincare Routine optional questions
  const [cleanser, setCleanser] = useState('Salicylic / Foaming');
  const [moisturizer, setMoisturizer] = useState('Light Gel / Oil-Free');
  const [sunscreen, setSunscreen] = useState('Daily SPF 50');
  const [actives, setActives] = useState('Niacinamide / None');

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError('');
    setSelectedFile(null);
    setImagePreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access webcam. Please check browser permissions or upload a photo.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setImagePreview(dataUrl);
    setSelectedFile(dataUrl);
    stopCamera();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WEBP).');
      return;
    }

    stopCamera();
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload a facial photo or take a webcam snapshot first.');
      return;
    }

    setLoading(true);
    setError('');

    const routineData = {
      cleanser,
      moisturizer,
      sunscreen,
      actives
    };

    try {
      const responseData = await analyzeSkin(selectedFile, routineData);
      navigate('/ai-results', { 
        state: { 
          result: responseData, 
          imagePreview: imagePreview 
        } 
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Analysis failed. Please ensure the image shows a clear facial view.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          AI Skin Health Assessment
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Visual Lesion & Severity Scanner
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Capture or upload an evenly lit portrait. Our neural pipeline analyzes redness dispersion across the forehead, cheeks, and chin.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Upload / Capture Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Visual Capture / Dropzone */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-600" />
            Step 1: Facial Image
          </h2>

          <div className="relative aspect-square rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center text-center group">
            {cameraActive ? (
              <div className="relative w-full h-full bg-black">
                <video ref={videoRef} playsInline autoPlay className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-teal-400/50 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-64 border-2 border-dashed border-teal-300/80 rounded-full" />
                </div>
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3 px-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Snap Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-xl bg-slate-800/90 text-white font-semibold text-xs hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="relative w-full h-full group">
                <img src={imagePreview} alt="Face Scan Preview" className="w-full h-full object-cover rounded-2xl" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-3 right-3 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-all shadow-md"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-semibold">
                  Photo Ready
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">Drag & drop facial portrait</p>
                  <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP (Max 10MB)</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Browse Device
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" /> Use Webcam
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <p>
              Tips for best accuracy: Remove glasses, pull hair back, and look directly forward under bright, natural daylight.
            </p>
          </div>
        </div>

        {/* Right Column: Skincare Routine Context */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-600" />
            Step 2: Routine Context (Optional)
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Cleanser Type</label>
              <select
                value={cleanser}
                onChange={(e) => setCleanser(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Salicylic / Foaming">Salicylic Acid / BHA Foaming Wash</option>
                <option value="Gentle Hydrating">Gentle Hydrating Cream Cleanser</option>
                <option value="Benzoyl Peroxide">Benzoyl Peroxide Antibacterial Wash</option>
                <option value="Water Only">Water Only / Bar Soap</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Moisturizer Consistency</label>
              <select
                value={moisturizer}
                onChange={(e) => setMoisturizer(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Light Gel / Oil-Free">Light Gel / Oil-Free Non-Comedogenic</option>
                <option value="Heavy Ceramide Cream">Rich Ceramide Cream / Balm</option>
                <option value="Face Oil">Natural Face Oils (Jojoba, Rosehip, etc.)</option>
                <option value="None">None / Rarely Use</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sunscreen Usage</label>
              <select
                value={sunscreen}
                onChange={(e) => setSunscreen(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Daily SPF 50">Daily Mineral / Chemical SPF 50+</option>
                <option value="Occasional">Only on sunny / outdoor days</option>
                <option value="None">Do not wear sunscreen</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Topical Actives / Serums</label>
              <select
                value={actives}
                onChange={(e) => setActives(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Niacinamide / None">Niacinamide or None</option>
                <option value="Retinoid / Adapalene">Retinol / Tretinoin / Adapalene</option>
                <option value="AHA / Glycolic">AHA / Glycolic Acid Exfoliants</option>
                <option value="Antibiotic Topical">Topical Clindamycin / Dapsone</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !selectedFile}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-base shadow-lg shadow-teal-200 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Scanning Quadrants & Neural Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Facial Health Now</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
