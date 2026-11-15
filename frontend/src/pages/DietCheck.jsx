import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictDiet } from '../services/api';
import { 
  Apple, 
  Sparkles, 
  Droplet, 
  Moon, 
  Activity, 
  Flame, 
  Heart, 
  AlertCircle, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';

const DietCheck = () => {
  const navigate = useNavigate();

  const [dietType, setDietType] = useState('Veg');
  const [specificFoodItem, setSpecificFoodItem] = useState('Balanced Veg');
  const [sugarIntake, setSugarIntake] = useState('Medium');
  const [dairyIntake, setDairyIntake] = useState('Occasional');
  const [processedFoodFreq, setProcessedFoodFreq] = useState('Medium');
  const [spicyFoodFreq, setSpicyFoodFreq] = useState('Medium');
  const [oilyFoodLevel, setOilyFoodLevel] = useState('Medium');
  const [waterIntakeLiters, setWaterIntakeLiters] = useState(2.5);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);
  const [exercise, setExercise] = useState('Yes');
  const [skinType, setSkinType] = useState('Combination');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      diet_type: dietType,
      specific_food_item: specificFoodItem,
      sugar_intake: sugarIntake,
      dairy_intake: dairyIntake,
      processed_food_freq: processedFoodFreq,
      spicy_food_freq: spicyFoodFreq,
      oily_food_level: oilyFoodLevel,
      water_intake_liters: parseFloat(waterIntakeLiters) || 2.5,
      sleep_hours: parseInt(sleepHours, 10) || 7,
      stress_level: parseInt(stressLevel, 10) || 3,
      exercise,
      skin_type: skinType,
    };

    try {
      const result = await predictDiet(payload);
      navigate('/diet-results', { state: { result, formData: payload } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to predict diet risk. Please check your inputs.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <Apple className="w-3.5 h-3.5" />
          Nutritional & Metabolic Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Diet & Lifestyle Acne Risk Calculator
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Nutritional triggers and circadian disruption directly impact systemic IGF-1 and sebum hypersecretion. Complete the questionnaire to identify your risk level.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Questionnaire Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        
        {/* Section 1: Diet & Food Intake */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Apple className="w-4 h-4 text-emerald-600" />
            1. Diet & Food Habits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Primary Diet Pattern</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Vegan">Vegan (Plant-Based)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Predominant Meal Staple</label>
              <select
                value={specificFoodItem}
                onChange={(e) => setSpecificFoodItem(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Balanced Veg">Balanced Vegetables & Grains</option>
                <option value="Leafy Greens">Leafy Greens & Salads</option>
                <option value="Paneer/Dairy Rich">Paneer / Dairy-Heavy Curries</option>
                <option value="Red Meat">Red Meat (Beef, Mutton, Pork)</option>
                <option value="Processed Meat">Processed Meats (Sausages, Bacon)</option>
                <option value="Fish">Fish & Seafood</option>
                <option value="Nuts/Seeds">High Nuts & Seeds</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Sugar & Sweets Intake</label>
              <select
                value={sugarIntake}
                onChange={(e) => setSugarIntake(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Low">Low (Rarely consume desserts/sodas)</option>
                <option value="Medium">Medium (1-2 sweet treats weekly)</option>
                <option value="High">High (Daily sodas, candies, or sweetened beverages)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Dairy Intake Frequency</label>
              <select
                value={dairyIntake}
                onChange={(e) => setDairyIntake(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="None">None (Dairy-free / plant milk)</option>
                <option value="Occasional">Occasional (1-3 times weekly)</option>
                <option value="Daily">Daily (Milk, cheese, yogurt daily)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Ultra-Processed Food Frequency</label>
              <select
                value={processedFoodFreq}
                onChange={(e) => setProcessedFoodFreq(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Low">Low (Home-cooked whole foods)</option>
                <option value="Medium">Medium (Takeout 1-2 times weekly)</option>
                <option value="High">High (Packaged snacks, fast food frequently)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Oily & Fried Food Intake</label>
              <select
                value={oilyFoodLevel}
                onChange={(e) => setOilyFoodLevel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Low">Low (Steamed, baked, low oil)</option>
                <option value="Medium">Medium (Moderate cooking oils)</option>
                <option value="High">High (Deep fried snacks, greasy foods)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Hydration & Lifestyle */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Droplet className="w-4 h-4 text-teal-600" />
            2. Hydration & Physiology
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Daily Water Intake</label>
              <select
                value={waterIntakeLiters}
                onChange={(e) => setWaterIntakeLiters(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="1.0">Under 1.5 Liters</option>
                <option value="2.0">1.5 - 2.0 Liters</option>
                <option value="2.5">2.0 - 2.5 Liters</option>
                <option value="3.5">3.0+ Liters</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Avg Sleep Duration</label>
              <select
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="5">Under 6 Hours</option>
                <option value="6">6 - 7 Hours</option>
                <option value="7">7 - 8 Hours</option>
                <option value="8">8+ Hours</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Stress Level (1 to 5)</label>
              <select
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="1">1 - Minimal / Relaxed</option>
                <option value="2">2 - Low</option>
                <option value="3">3 - Moderate</option>
                <option value="4">4 - High / Frequent Stress</option>
                <option value="5">5 - Chronic / Burnout</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Regular Exercise</label>
              <select
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Yes">Yes (3+ times a week)</option>
                <option value="No">No / Sedentary</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Skin Type Baseline</label>
              <select
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Oily">Oily (Excess sebum, frequent shine)</option>
                <option value="Combination">Combination (Oily T-Zone, dry cheeks)</option>
                <option value="Normal">Normal / Balanced</option>
                <option value="Dry">Dry / Flaky</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Spicy Food Frequency</label>
              <select
                value={spicyFoodFreq}
                onChange={(e) => setSpicyFoodFreq(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Low">Low / Mild</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Hot peppers & spices daily)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-lg shadow-emerald-200 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Computing Risk Matrix...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Evaluate My Acne Risk Score</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DietCheck;
