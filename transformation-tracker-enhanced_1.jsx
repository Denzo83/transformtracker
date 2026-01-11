import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, TrendingDown, Moon, Sun, Dumbbell, ShoppingCart, ChefHat, Target, Award, Activity, Calendar, BarChart3, Book, FileText, Menu, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const TransformationTracker = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [dailyData, setDailyData] = useState({});
  const [weightHistory, setWeightHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const START_DATE = new Date(2025, 0, 12); // January 12, 2025

  // Workout schedule
  const workoutSchedule = {
    1: { name: "Legs Light/Rehab", type: "legs-light", emoji: "🦵", description: "Terminal knee extensions, wall sits, single-leg balance" },
    2: { name: "Basketball", type: "basketball", emoji: "🏀", description: "30 min game time - monitor knee closely" },
    3: { name: "Push Day", type: "push", emoji: "💪", description: "Bench press, overhead press, dips, triceps" },
    4: { name: "Pull Day", type: "pull", emoji: "🔙", description: "Rows, pull-ups, deadlifts, biceps, face pulls" },
    5: { name: "Legs Heavy", type: "legs-heavy", emoji: "🏋️", description: "Squats, leg press, lunges, hamstring curls" },
    6: { name: "Rest & Recovery", type: "rest", emoji: "😴", description: "Active recovery, stretching, foam rolling" },
    7: { name: "Upper Compound", type: "upper", emoji: "💪", description: "Compound movements, full upper body" }
  };

  const tabs = [
    { id: 'daily', name: 'Today', icon: Target },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'analytics', name: 'Progress', icon: BarChart3 },
    { id: 'meals', name: 'Meal Plan', icon: Book },
    { id: 'notes', name: 'Journal', icon: FileText }
  ];

  const getMealPlan = (dayOfWeek) => {
    const isTuesday = dayOfWeek === 2;
    return {
      morning: { item: "YoPro sachet + banana (optional)", protein: 15, carbs: isTuesday ? 27 : 0, cals: isTuesday ? 205 : 100 },
      lunch: { 
        item: `250g chicken + ${isTuesday ? '150g' : '120g'} rice + veggies`, 
        protein: 75, 
        carbs: isTuesday ? 70 : 55, 
        cals: isTuesday ? 650 : 580 
      },
      snack: { 
        item: isTuesday ? "Protein shake + banana + 2 rice cakes" : "Protein shake + fruit (optional)", 
        protein: isTuesday ? 28 : 26, 
        carbs: isTuesday ? 45 : 25, 
        cals: isTuesday ? 285 : 215 
      },
      dinner: { 
        item: `250g chicken + ${isTuesday ? '120g' : '100g'} rice + veggies`, 
        protein: 75, 
        carbs: isTuesday ? 58 : 50, 
        cals: isTuesday ? 600 : 600 
      },
      evening: { item: "YoPro sachet", protein: 15, carbs: 0, cals: 100 }
    };
  };

  const getDayKey = (week, day) => `w${week}d${day}`;

  const getDateForDay = (week, day) => {
    const dayNumber = (week - 1) * 7 + day - 1;
    const date = new Date(START_DATE);
    date.setDate(date.getDate() + dayNumber);
    return date;
  };

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const dailyResult = await window.storage.get('transformation-daily-data');
        const weightResult = await window.storage.get('transformation-weight-history');
        const darkModeResult = await window.storage.get('transformation-dark-mode');
        
        if (dailyResult?.value) setDailyData(JSON.parse(dailyResult.value));
        if (weightResult?.value) setWeightHistory(JSON.parse(weightResult.value));
        if (darkModeResult?.value) setDarkMode(JSON.parse(darkModeResult.value));
      } catch (error) {
        console.log('Starting fresh');
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const saveData = async (newDailyData, newWeightHistory, newDarkMode) => {
    try {
      if (newDailyData) await window.storage.set('transformation-daily-data', JSON.stringify(newDailyData));
      if (newWeightHistory) await window.storage.set('transformation-weight-history', JSON.stringify(newWeightHistory));
      if (newDarkMode !== undefined) await window.storage.set('transformation-dark-mode', JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveData(null, null, newDarkMode);
  };

  const getCurrentDayData = () => {
    const key = getDayKey(currentWeek, currentDay);
    return dailyData[key] || {
      meals: {},
      steps: null,
      weight: null,
      sleep: { bedTime: '', wakeTime: '', total: null },
      workout: false,
      kneeOk: null,
      water: 0,
      notes: ''
    };
  };

  const updateDayData = (updates) => {
    const key = getDayKey(currentWeek, currentDay);
    const newData = {
      ...dailyData,
      [key]: {
        ...getCurrentDayData(),
        ...updates
      }
    };
    setDailyData(newData);
    saveData(newData);
    
    const dayData = newData[key];
    const allMealsChecked = dayData.meals?.morning && dayData.meals?.lunch && 
                           dayData.meals?.dinner && dayData.meals?.evening;
    if (allMealsChecked && !showConfetti) triggerConfetti();
  };

  const updateWeight = (weight) => {
    const key = getDayKey(currentWeek, currentDay);
    const newWeightHistory = { ...weightHistory, [key]: weight };
    setWeightHistory(newWeightHistory);
    updateDayData({ weight });
    saveData(dailyData, newWeightHistory);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const toggleMeal = (meal) => {
    const currentData = getCurrentDayData();
    updateDayData({
      meals: { ...currentData.meals, [meal]: !currentData.meals[meal] }
    });
  };

  const calculateProgress = () => {
    const totalDays = 56;
    const completedDays = Object.keys(dailyData).filter(key => {
      const data = dailyData[key];
      return data.meals?.morning && data.meals?.lunch && data.meals?.dinner && data.workout;
    }).length;
    return (completedDays / totalDays) * 100;
  };

  const getWeekProgress = (week) => {
    const daysInWeek = Array.from({ length: 7 }, (_, i) => getDayKey(week, i + 1));
    const completed = daysInWeek.filter(key => {
      const data = dailyData[key];
      return data?.meals?.morning && data?.meals?.lunch && data?.meals?.dinner;
    }).length;
    return (completed / 7) * 100;
  };

  const getDayCompletionStatus = (week, day) => {
    const key = getDayKey(week, day);
    const data = dailyData[key];
    if (!data) return 'empty';
    
    const mealsComplete = data.meals?.morning && data.meals?.lunch && data.meals?.dinner && data.meals?.evening;
    const workoutComplete = data.workout;
    const weightLogged = data.weight !== null && data.weight !== undefined;
    const stepsLogged = data.steps !== null && data.steps !== undefined;
    
    const score = [mealsComplete, workoutComplete, weightLogged, stepsLogged].filter(Boolean).length;
    
    if (score === 4) return 'complete';
    if (score >= 2) return 'partial';
    if (score >= 1) return 'started';
    return 'empty';
  };

  const getWeightChartData = () => {
    const data = [];
    for (let week = 1; week <= 8; week++) {
      for (let day = 1; day <= 7; day++) {
        const key = getDayKey(week, day);
        const weight = weightHistory[key];
        if (weight) {
          data.push({
            day: `W${week}D${day}`,
            weight: weight,
            week: week
          });
        }
      }
    }
    return data;
  };

  const getStepsChartData = () => {
    const data = [];
    for (let week = 1; week <= 8; week++) {
      for (let day = 1; day <= 7; day++) {
        const key = getDayKey(week, day);
        const dayData = dailyData[key];
        if (dayData?.steps) {
          data.push({
            day: `W${week}D${day}`,
            steps: dayData.steps,
            target: day === 2 ? 9000 : 12000
          });
        }
      }
    }
    return data;
  };

  const calculateAverageWeight = () => {
    const weights = Object.values(weightHistory).filter(w => w !== null);
    if (weights.length === 0) return null;
    return (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
  };

  const calculateStats = () => {
    const allKeys = Object.keys(dailyData);
    const totalMealsLogged = allKeys.filter(key => {
      const data = dailyData[key];
      return data.meals?.morning && data.meals?.lunch && data.meals?.dinner;
    }).length;
    
    const totalWorkoutsLogged = allKeys.filter(key => dailyData[key]?.workout).length;
    
    const totalStepsLogged = allKeys.reduce((sum, key) => {
      return sum + (dailyData[key]?.steps || 0);
    }, 0);
    
    const avgSteps = totalStepsLogged / Math.max(allKeys.length, 1);
    
    return { totalMealsLogged, totalWorkoutsLogged, avgSteps: Math.round(avgSteps) };
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} flex items-center justify-center`}>
        <div className={`text-2xl font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'} animate-pulse`}>
          Loading your journey...
        </div>
      </div>
    );
  }

  const dayData = getCurrentDayData();
  const dayOfWeek = currentDay;
  const mealPlan = getMealPlan(dayOfWeek);
  const totalMacros = Object.values(mealPlan).reduce((acc, meal) => ({
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    cals: acc.cals + meal.cals
  }), { protein: 0, carbs: 0, cals: 0 });

  const getDayName = (day) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[day - 1];
  };

  const isShoppingDay = dayOfWeek === 7;
  const isCookingDay = dayOfWeek === 7 || dayOfWeek === 3;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} transition-colors duration-300`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Quicksand', sans-serif;
          -webkit-tap-highlight-color: transparent;
        }
        
        .font-display {
          font-family: 'Poppins', sans-serif;
        }
        
        .checkbox-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .checkbox-item:active {
          transform: scale(0.98);
        }
        
        .checkbox-checked {
          animation: checkBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes checkBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          position: absolute;
          animation: confetti-fall 3s linear forwards;
        }
        
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .stat-card {
          background: ${darkMode ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.7)'};
          backdrop-filter: blur(10px);
          border: 1px solid ${darkMode ? 'rgba(100, 100, 150, 0.3)' : 'rgba(255, 255, 255, 0.5)'};
          transition: all 0.3s ease;
        }
        
        .stat-card:active {
          transform: scale(0.99);
        }
        
        input[type="number"], input[type="time"], textarea {
          background: ${darkMode ? 'rgba(40, 40, 60, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
          border: 2px solid ${darkMode ? '#4a4a6a' : '#e0d4f7'};
          color: ${darkMode ? '#e0e0e0' : '#1a1a1a'};
          transition: all 0.3s ease;
        }
        
        input[type="number"]:focus, input[type="time"]:focus, textarea:focus {
          border-color: ${darkMode ? '#8b7ab8' : '#b794f6'};
          outline: none;
          box-shadow: 0 0 0 3px ${darkMode ? 'rgba(139, 122, 184, 0.2)' : 'rgba(183, 148, 246, 0.1)'};
        }
        
        .mobile-tap-target {
          min-height: 44px;
          min-width: 44px;
        }
        
        @media (max-width: 640px) {
          .checkbox-item {
            padding: 16px;
          }
        }
      `}</style>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                background: ['#ffd700', '#ff69b4', '#87ceeb', '#98fb98', '#dda0dd'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 stat-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl sm:text-3xl font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
              8-Week Journey
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl mobile-tap-target ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-purple-100 text-purple-700'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`sm:hidden p-2 rounded-xl mobile-tap-target ${darkMode ? 'bg-gray-700 text-white' : 'bg-purple-100 text-purple-700'}`}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Tab Menu */}
          {mobileMenuOpen && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl mobile-tap-target ${
                      activeTab === tab.id
                        ? darkMode ? 'bg-purple-600 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-purple-600'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-semibold text-sm">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Desktop Tabs */}
          <div className="hidden sm:flex gap-2 mt-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? darkMode ? 'bg-purple-600 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-semibold">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 pb-20">
        {/* DAILY TAB */}
        {activeTab === 'daily' && (
          <div className="space-y-4">
            {/* Progress Overview */}
            <div className="stat-card rounded-3xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl sm:text-2xl font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                  Overall Progress
                </h2>
                <Award className={darkMode ? 'text-yellow-400' : 'text-yellow-500'} size={28} />
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between text-sm">
                  <span className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {calculateProgress().toFixed(1)}% Complete
                  </span>
                  <span className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Day {(currentWeek - 1) * 7 + currentDay} / 56
                  </span>
                </div>
                <div className={`overflow-hidden h-4 mb-4 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                  <div
                    style={{ width: `${calculateProgress()}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Day Navigation */}
            <div className="stat-card rounded-3xl p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    if (currentDay > 1) setCurrentDay(currentDay - 1);
                    else if (currentWeek > 1) {
                      setCurrentWeek(currentWeek - 1);
                      setCurrentDay(7);
                    }
                  }}
                  disabled={currentWeek === 1 && currentDay === 1}
                  className={`p-3 rounded-2xl mobile-tap-target flex-shrink-0 ${
                    currentWeek === 1 && currentDay === 1
                      ? darkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'
                      : darkMode ? 'bg-purple-600 text-white' : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                  } disabled:cursor-not-allowed`}
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="text-center flex-1">
                  <div className={`text-2xl sm:text-3xl font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'} mb-1`}>
                    Week {currentWeek}, Day {currentDay}
                  </div>
                  <div className={`text-sm sm:text-base ${darkMode ? 'text-purple-400' : 'text-purple-600'} font-semibold mb-2`}>
                    {getDayName(dayOfWeek)} - {formatDate(getDateForDay(currentWeek, currentDay))}
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${
                    darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-100 to-pink-100'
                  }`}>
                    <span className="text-xl sm:text-2xl">{workoutSchedule[dayOfWeek].emoji}</span>
                    <span className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                      {workoutSchedule[dayOfWeek].name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (currentDay < 7) setCurrentDay(currentDay + 1);
                    else if (currentWeek < 8) {
                      setCurrentWeek(currentWeek + 1);
                      setCurrentDay(1);
                    }
                  }}
                  disabled={currentWeek === 8 && currentDay === 7}
                  className={`p-3 rounded-2xl mobile-tap-target flex-shrink-0 ${
                    currentWeek === 8 && currentDay === 7
                      ? darkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'
                      : darkMode ? 'bg-purple-600 text-white' : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                  } disabled:cursor-not-allowed`}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="stat-card rounded-3xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="text-green-500" size={20} />
                  <h3 className={`font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>Weight</h3>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={dayData.weight || ''}
                  onChange={(e) => updateWeight(parseFloat(e.target.value))}
                  placeholder="94.0"
                  className="w-full p-3 rounded-xl text-2xl font-bold text-center mobile-tap-target"
                />
                {calculateAverageWeight() && (
                  <div className={`text-sm text-center mt-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Avg: {calculateAverageWeight()}kg
                  </div>
                )}
              </div>

              <div className="stat-card rounded-3xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="text-blue-500" size={20} />
                  <h3 className={`font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>Steps</h3>
                </div>
                <input
                  type="number"
                  value={dayData.steps || ''}
                  onChange={(e) => updateDayData({ steps: parseInt(e.target.value) })}
                  placeholder={dayOfWeek === 2 ? "8000" : "12000"}
                  className="w-full p-3 rounded-xl text-2xl font-bold text-center mobile-tap-target"
                />
                <div className={`text-sm text-center mt-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Target: {dayOfWeek === 2 ? '8-10k' : '12-13k'}
                </div>
              </div>

              <div className="stat-card rounded-3xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-blue-400 text-xl">💧</div>
                  <h3 className={`font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>Water (L)</h3>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateDayData({ water: Math.max(0, (dayData.water || 0) - 0.5) })}
                    className={`w-10 h-10 rounded-full mobile-tap-target font-bold text-xl ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600 text-purple-300' : 'bg-purple-200 hover:bg-purple-300 text-purple-700'
                    }`}
                  >
                    -
                  </button>
                  <div className={`text-3xl font-bold w-20 text-center ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                    {(dayData.water || 0).toFixed(1)}
                  </div>
                  <button
                    onClick={() => updateDayData({ water: (dayData.water || 0) + 0.5 })}
                    className={`w-10 h-10 rounded-full mobile-tap-target font-bold text-xl ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600 text-purple-300' : 'bg-purple-200 hover:bg-purple-300 text-purple-700'
                    }`}
                  >
                    +
                  </button>
                </div>
                <div className={`text-sm text-center mt-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Target: 3-4L
                </div>
              </div>
            </div>

            {/* Meals */}
            <div className="stat-card rounded-3xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl sm:text-2xl font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                  Today's Meals
                </h2>
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  darkMode ? 'bg-gray-700 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}>
                  {totalMacros.cals} cal
                </div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(mealPlan).map(([mealKey, meal]) => (
                  <div
                    key={mealKey}
                    className={`checkbox-item flex items-start gap-3 p-4 rounded-2xl cursor-pointer ${
                      dayData.meals?.[mealKey] 
                        ? darkMode ? 'bg-green-900/40 border-2 border-green-600' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
                        : darkMode ? 'bg-gray-800 border-2 border-gray-600' : 'bg-white border-2 border-purple-100'
                    }`}
                    onClick={() => toggleMeal(mealKey)}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mobile-tap-target ${
                      dayData.meals?.[mealKey]
                        ? 'bg-green-500 checkbox-checked'
                        : darkMode ? 'bg-gray-700' : 'bg-purple-100'
                    }`}>
                      {dayData.meals?.[mealKey] && <Check className="text-white" size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold capitalize mb-1 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                        {mealKey}
                      </div>
                      <div className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-purple-600'}`}>
                        {meal.item}
                      </div>
                      <div className={`flex gap-3 text-xs ${darkMode ? 'text-gray-400' : 'text-purple-500'}`}>
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>{meal.cals} cal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-4 p-4 rounded-2xl ${
                darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-50 to-pink-50'
              }`}>
                <div className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-purple-900'}`}>Daily Totals</div>
                <div className="flex justify-around text-center">
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                      {totalMacros.protein}g
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Protein</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                      {totalMacros.carbs}g
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Carbs</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                      {totalMacros.cals}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Calories</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Workout & Sleep */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="stat-card rounded-3xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Dumbbell className="text-orange-500" size={22} />
                  <h3 className={`text-lg font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                    Workout
                  </h3>
                </div>
                
                <div
                  className={`p-4 rounded-2xl cursor-pointer transition-all mobile-tap-target ${
                    dayData.workout
                      ? darkMode ? 'bg-orange-900/40 border-2 border-orange-600' : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300'
                      : darkMode ? 'bg-gray-800 border-2 border-gray-600' : 'bg-white border-2 border-purple-100'
                  }`}
                  onClick={() => updateDayData({ workout: !dayData.workout })}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      dayData.workout ? 'bg-orange-500 checkbox-checked' : darkMode ? 'bg-gray-700' : 'bg-purple-100'
                    }`}>
                      {dayData.workout && <Check className="text-white" size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                        {workoutSchedule[dayOfWeek].name}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-purple-600'}`}>
                        {workoutSchedule[dayOfWeek].description}
                      </div>
                    </div>
                    <div className="text-2xl flex-shrink-0">{workoutSchedule[dayOfWeek].emoji}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Knee Status
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateDayData({ kneeOk: true })}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all mobile-tap-target ${
                        dayData.kneeOk === true
                          ? 'bg-green-500 text-white shadow-lg'
                          : darkMode ? 'bg-gray-800 text-gray-300 border-2 border-gray-600' : 'bg-white text-purple-600 border-2 border-purple-100'
                      }`}
                    >
                      ✓ Good
                    </button>
                    <button
                      onClick={() => updateDayData({ kneeOk: false })}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all mobile-tap-target ${
                        dayData.kneeOk === false
                          ? 'bg-red-500 text-white shadow-lg'
                          : darkMode ? 'bg-gray-800 text-gray-300 border-2 border-gray-600' : 'bg-white text-purple-600 border-2 border-purple-100'
                      }`}
                    >
                      ⚠️ Sore
                    </button>
                  </div>
                </div>
              </div>

              <div className="stat-card rounded-3xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Moon className="text-indigo-500" size={22} />
                  <h3 className={`text-lg font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                    Sleep
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                      Bed Time
                    </label>
                    <input
                      type="time"
                      value={dayData.sleep?.bedTime || ''}
                      onChange={(e) => updateDayData({ 
                        sleep: { ...dayData.sleep, bedTime: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl mobile-tap-target"
                    />
                  </div>
                  
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                      Wake Time
                    </label>
                    <input
                      type="time"
                      value={dayData.sleep?.wakeTime || ''}
                      onChange={(e) => {
                        const bedTime = dayData.sleep?.bedTime;
                        const wakeTime = e.target.value;
                        let totalSleep = null;
                        
                        if (bedTime && wakeTime) {
                          const [bedHour, bedMin] = bedTime.split(':').map(Number);
                          const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
                          
                          let bedMinutes = bedHour * 60 + bedMin;
                          let wakeMinutes = wakeHour * 60 + wakeMin;
                          
                          if (wakeMinutes < bedMinutes) wakeMinutes += 24 * 60;
                          
                          totalSleep = ((wakeMinutes - bedMinutes) / 60).toFixed(1);
                        }
                        
                        updateDayData({ 
                          sleep: { ...dayData.sleep, wakeTime, total: totalSleep }
                        });
                      }}
                      className="w-full p-3 rounded-xl mobile-tap-target"
                    />
                  </div>
                  
                  {dayData.sleep?.total && (
                    <div className={`p-3 rounded-xl text-center ${
                      darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                    }`}>
                      <div className={`text-3xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {dayData.sleep.total}h
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-500'}`}>Total Sleep</div>
                      {parseFloat(dayData.sleep.total) < 7 && (
                        <div className="text-xs text-red-500 mt-1">⚠️ Aim for 7-8 hours</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shopping & Cooking Reminders */}
            {(isShoppingDay || isCookingDay) && (
              <div className="stat-card rounded-3xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  {isShoppingDay ? (
                    <ShoppingCart className="text-green-500" size={22} />
                  ) : (
                    <ChefHat className="text-orange-500" size={22} />
                  )}
                  <h3 className={`text-lg font-display font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                    {isShoppingDay ? '🛒 Shopping Day!' : '👨‍🍳 Meal Prep Day!'}
                  </h3>
                </div>
                
                <div className={`p-4 rounded-2xl border-2 ${
                  darkMode ? 'bg-gray-800 border-yellow-600' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                }`}>
                  {isShoppingDay && (
                    <div className="space-y-2">
                      <div className={`font-semibold ${darkMode ? 'text-yellow-300' : 'text-orange-900'}`}>
                        Weekly Shopping List:
                      </div>
                      <ul className={`text-sm space-y-1 ml-4 ${darkMode ? 'text-yellow-200' : 'text-orange-700'}`}>
                        <li>• 3.5kg chicken breast</li>
                        <li>• 14 YoPro sachets</li>
                        <li>• 2kg white rice</li>
                        <li>• 7-10 bananas & 4-5 apples</li>
                        <li>• 2-3kg broccoli + veggies</li>
                        <li>• Protein powder</li>
                      </ul>
                    </div>
                  )}
                  
                  {isCookingDay && (
                    <div className="space-y-2">
                      <div className={`font-semibold ${darkMode ? 'text-yellow-300' : 'text-orange-900'}`}>
                        {dayOfWeek === 7 ? 'Sunday Prep (90 min):' : 'Wednesday Refresh (30 min):'}
                      </div>
                      <ul className={`text-sm space-y-1 ml-4 ${darkMode ? 'text-yellow-200' : 'text-orange-700'}`}>
                        <li>• Cook {dayOfWeek === 7 ? '3.5kg' : '1kg'} chicken breast</li>
                        <li>• Cook {dayOfWeek === 7 ? '1.5kg' : '800g'} rice</li>
                        <li>• Steam/prep vegetables</li>
                        <li>• Portion into containers</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-4 mt-4">
            <div className="stat-card rounded-3xl p-4 sm:p-6">
              <h2 className={`text-2xl font-display font-bold mb-4 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                56-Day Overview
              </h2>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-emerald-500"></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-400 to-orange-400"></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Partial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-400 to-purple-400"></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Started</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Empty</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-6">
                {Array.from({ length: 8 }).map((_, weekIdx) => {
                  const week = weekIdx + 1;
                  return (
                    <div key={week}>
                      <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        Week {week}
                      </h3>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }).map((_, dayIdx) => {
                          const day = dayIdx + 1;
                          const status = getDayCompletionStatus(week, day);
                          const isToday = week === currentWeek && day === currentDay;
                          const date = getDateForDay(week, day);
                          
                          let bgClass = '';
                          if (status === 'complete') bgClass = 'bg-gradient-to-br from-green-400 to-emerald-500';
                          else if (status === 'partial') bgClass = 'bg-gradient-to-br from-yellow-400 to-orange-400';
                          else if (status === 'started') bgClass = 'bg-gradient-to-br from-blue-400 to-purple-400';
                          else bgClass = darkMode ? 'bg-gray-700' : 'bg-gray-200';
                          
                          return (
                            <button
                              key={day}
                              onClick={() => {
                                setCurrentWeek(week);
                                setCurrentDay(day);
                                setActiveTab('daily');
                              }}
                              className={`${bgClass} rounded-xl p-3 transition-all hover:scale-105 ${
                                isToday ? 'ring-4 ring-purple-500' : ''
                              }`}
                            >
                              <div className="text-white font-bold text-lg">{day}</div>
                              <div className="text-white text-xs opacity-90">{workoutSchedule[day].emoji}</div>
                              <div className="text-white text-[10px] mt-1 opacity-75">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 mt-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="stat-card rounded-3xl p-4">
                <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {calculateStats().totalMealsLogged}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Days Meal Tracked</div>
              </div>
              <div className="stat-card rounded-3xl p-4">
                <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {calculateStats().totalWorkoutsLogged}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Workouts Completed</div>
              </div>
              <div className="stat-card rounded-3xl p-4">
                <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {calculateStats().avgSteps.toLocaleString()}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Avg Daily Steps</div>
              </div>
            </div>

            {/* Weight Chart */}
            {getWeightChartData().length > 0 && (
              <div className="stat-card rounded-3xl p-4 sm:p-6">
                <h3 className={`text-xl font-display font-bold mb-4 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                  Weight Progress
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getWeightChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ddd'} />
                    <XAxis 
                      dataKey="day" 
                      stroke={darkMode ? '#888' : '#666'}
                      tick={{ fill: darkMode ? '#888' : '#666', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']}
                      stroke={darkMode ? '#888' : '#666'}
                      tick={{ fill: darkMode ? '#888' : '#666', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#fff',
                        border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: darkMode ? '#fff' : '#000'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Steps Chart */}
            {getStepsChartData().length > 0 && (
              <div className="stat-card rounded-3xl p-4 sm:p-6">
                <h3 className={`text-xl font-display font-bold mb-4 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                  Daily Steps
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getStepsChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ddd'} />
                    <XAxis 
                      dataKey="day" 
                      stroke={darkMode ? '#888' : '#666'}
                      tick={{ fill: darkMode ? '#888' : '#666', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={darkMode ? '#888' : '#666'}
                      tick={{ fill: darkMode ? '#888' : '#666', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#fff',
                        border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: darkMode ? '#fff' : '#000'
                      }}
                    />
                    <Bar dataKey="steps" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="target" fill="#9333ea" opacity={0.3} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* MEALS TAB */}
        {activeTab === 'meals' && (
          <div className="space-y-4 mt-4">
            <div className="stat-card rounded-3xl p-4 sm:p-6">
              <h2 className={`text-2xl font-display font-bold mb-4 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                Meal Plan Reference
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Regular Days (Mon, Wed, Thu, Fri, Sat, Sun)
                  </h3>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                    <div className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                      Target: 1,700 cal | 200g protein | 135g carbs
                    </div>
                    <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-purple-700'}`}>
                      <li>• <strong>9am:</strong> YoPro + banana (optional)</li>
                      <li>• <strong>12pm:</strong> 250g chicken + 120g rice + veggies</li>
                      <li>• <strong>3pm:</strong> Protein shake + fruit (optional)</li>
                      <li>• <strong>7pm:</strong> 250g chicken + 100g rice + veggies</li>
                      <li>• <strong>9pm:</strong> YoPro</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Tuesday (Basketball Day)
                  </h3>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-orange-50'}`}>
                    <div className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-orange-900'}`}>
                      Target: 1,900 cal | 200g protein | 180g carbs
                    </div>
                    <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-orange-700'}`}>
                      <li>• <strong>9am:</strong> YoPro + banana</li>
                      <li>• <strong>12pm:</strong> 250g chicken + 150g rice + veggies</li>
                      <li>• <strong>3pm:</strong> Protein shake + banana + 2 rice cakes</li>
                      <li>• <strong>7-9pm:</strong> Basketball game</li>
                      <li>• <strong>8-9pm:</strong> 250g chicken + 120g rice + veggies</li>
                      <li>• <strong>9pm:</strong> YoPro</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Weekly Shopping List
                  </h3>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                    <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>
                      <li>• 3.5kg chicken breast</li>
                      <li>• 14 YoPro sachets</li>
                      <li>• 2kg white rice</li>
                      <li>• 7-10 bananas & 4-5 apples</li>
                      <li>• 2-3kg broccoli + mixed veggies</li>
                      <li>• Protein powder</li>
                      <li>• Hot sauce, seasonings</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Meal Prep Schedule
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                      <div className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
                        Sunday (90 min)
                      </div>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                        <li>• Cook 3.5kg chicken</li>
                        <li>• Cook 1.5kg rice</li>
                        <li>• Steam vegetables</li>
                        <li>• Portion everything</li>
                      </ul>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                      <div className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
                        Wednesday (30 min)
                      </div>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                        <li>• Cook 1kg chicken</li>
                        <li>• Cook 800g rice</li>
                        <li>• Refresh vegetables</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JOURNAL TAB */}
        {activeTab === 'notes' && (
          <div className="space-y-4 mt-4">
            <div className="stat-card rounded-3xl p-4 sm:p-6">
              <h2 className={`text-2xl font-display font-bold mb-4 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                Daily Journal
              </h2>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>
                Week {currentWeek}, Day {currentDay} - {formatDate(getDateForDay(currentWeek, currentDay))}
              </p>
              <textarea
                value={dayData.notes || ''}
                onChange={(e) => updateDayData({ notes: e.target.value })}
                placeholder="How are you feeling today? Any challenges? Victories? Knee status? Energy levels?"
                className={`w-full p-4 rounded-xl min-h-[300px] resize-none ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}
              />
              <div className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>
                Your notes are saved automatically
              </div>
            </div>
          </div>
        )}

        {/* Motivational Footer */}
        <div className="mt-6">
          <div className="stat-card rounded-3xl p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
            <div className="text-white text-center">
              <div className="text-2xl sm:text-3xl font-display font-bold mb-2">
                {calculateProgress() < 25 && "💪 Building momentum!"}
                {calculateProgress() >= 25 && calculateProgress() < 50 && "🔥 Crushing it!"}
                {calculateProgress() >= 50 && calculateProgress() < 75 && "🚀 More than halfway!"}
                {calculateProgress() >= 75 && calculateProgress() < 100 && "⭐ Final push!"}
                {calculateProgress() === 100 && "🏆 TRANSFORMATION COMPLETE!"}
              </div>
              <div className="text-sm sm:text-base opacity-90">
                {currentWeek <= 2 && "Foundation phase - Get your routine dialed in"}
                {currentWeek > 2 && currentWeek <= 4 && "Momentum phase - Muscle memory kicking in"}
                {currentWeek > 4 && currentWeek <= 6 && "The grind - Stay strong, trust the process"}
                {currentWeek > 6 && "Transformation phase - Visual changes accelerating"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransformationTracker;