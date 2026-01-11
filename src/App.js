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
    const loadData = () => {
      try {
        const dailyResult = localStorage.getItem('transformation-daily-data');
        const weightResult = localStorage.getItem('transformation-weight-history');
        const darkModeResult = localStorage.getItem('transformation-dark-mode');
        
        if (dailyResult) setDailyData(JSON.parse(dailyResult));
        if (weightResult) setWeightHistory(JSON.parse(weightResult));
        if (darkModeResult) setDarkMode(JSON.parse(darkModeResult));
      } catch (error) {
        console.log('Starting fresh');
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const saveData = (newDailyData, newWeightHistory, newDarkMode) => {
    try {
      if (newDailyData) localStorage.setItem('transformation-daily-data', JSON.stringify(newDailyData));
      if (newWeightHistory) localStorage.setItem('transformation-weight-history', JSON.stringify(newWeightHistory));
      if (newDarkMode !== undefined) localStorage.setItem('transformation-dark-mode', JSON.stringify(newDarkMode));
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

  const styles = {
    container: {
      minHeight: '100vh',
      background: darkMode 
        ? '#111827' 
        : 'linear-gradient(to bottom right, #EFF6FF, #F3E8FF, #FCE7F3)',
      fontFamily: "'Quicksand', sans-serif",
      padding: '16px',
      transition: 'background 0.3s',
    },
    header: {
      background: darkMode ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      marginBottom: '16px',
      borderRadius: '24px',
      padding: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#581c87',
      fontFamily: "'Poppins', sans-serif",
    },
    button: {
      padding: '8px 16px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s',
      minHeight: '44px',
      minWidth: '44px',
    },
    buttonPrimary: {
      background: darkMode ? '#7c3aed' : 'linear-gradient(to right, #a855f7, #ec4899)',
      color: 'white',
    },
    card: {
      background: darkMode ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: darkMode ? '1px solid rgba(100, 100, 150, 0.3)' : '1px solid rgba(255, 255, 255, 0.5)',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '16px',
      transition: 'all 0.3s',
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '12px',
      border: darkMode ? '2px solid #4a4a6a' : '2px solid #e0d4f7',
      background: darkMode ? 'rgba(40, 40, 60, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      color: darkMode ? '#e0e0e0' : '#1a1a1a',
      fontSize: '16px',
      transition: 'all 0.3s',
    },
    text: {
      color: darkMode ? '#e0e0e0' : '#1a1a1a',
    },
    textMuted: {
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    progressBar: {
      height: '16px',
      borderRadius: '999px',
      background: darkMode ? '#374151' : '#f3e8ff',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(to right, #a855f7, #ec4899, #3b82f6)',
      transition: 'width 0.5s',
    }
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: '24px', fontWeight: '600', color: darkMode ? '#a855f7' : '#7c3aed'}}>
          Loading your journey...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        button:active { transform: scale(0.98); }
      `}</style>

      {/* Confetti */}
      {showConfetti && (
        <div style={{position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50}}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                left: `${Math.random() * 100}%`,
                top: '-20px',
                background: ['#ffd700', '#ff69b4', '#87ceeb', '#98fb98', '#dda0dd'][Math.floor(Math.random() * 5)],
                animation: `confetti-fall ${2 + Math.random() * 2}s linear forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <h1 style={styles.title}>8-Week Journey</h1>
          <div style={{display: 'flex', gap: '8px'}}>
            <button
              onClick={toggleDarkMode}
              style={{
                ...styles.button,
                background: darkMode ? '#374151' : '#f3e8ff',
                color: darkMode ? '#fbbf24' : '#7c3aed',
              }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                ...styles.button,
                background: darkMode ? '#374151' : '#f3e8ff',
                color: darkMode ? '#fff' : '#7c3aed',
                display: window.innerWidth < 640 ? 'block' : 'none',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: mobileMenuOpen || window.innerWidth >= 640 ? 'flex' : 'none',
          gap: '8px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  ...styles.button,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isActive 
                    ? (darkMode ? '#7c3aed' : 'linear-gradient(to right, #a855f7, #ec4899)')
                    : (darkMode ? '#374151' : '#fff'),
                  color: isActive ? '#fff' : (darkMode ? '#9ca3af' : '#7c3aed'),
                }}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div style={{maxWidth: '1280px', margin: '0 auto'}}>
        {/* Daily Tab - Simplified Version to Start */}
        {activeTab === 'daily' && (
          <div>
            {/* Progress Card */}
            <div style={styles.card}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h2 style={{fontSize: '24px', fontWeight: 'bold', ...styles.text}}>Overall Progress</h2>
                <Award color={darkMode ? '#fbbf24' : '#eab308'} size={32} />
              </div>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${calculateProgress()}%`}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '14px', ...styles.textMuted}}>
                <span>{calculateProgress().toFixed(1)}% Complete</span>
                <span>Day {(currentWeek - 1) * 7 + currentDay} / 56</span>
              </div>
            </div>

            {/* Day Navigation */}
            <div style={styles.card}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'}}>
                <button
                  onClick={() => {
                    if (currentDay > 1) setCurrentDay(currentDay - 1);
                    else if (currentWeek > 1) {
                      setCurrentWeek(currentWeek - 1);
                      setCurrentDay(7);
                    }
                  }}
                  disabled={currentWeek === 1 && currentDay === 1}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    opacity: (currentWeek === 1 && currentDay === 1) ? 0.3 : 1,
                    cursor: (currentWeek === 1 && currentDay === 1) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={24} />
                </button>

                <div style={{textAlign: 'center', flex: 1}}>
                  <div style={{fontSize: '28px', fontWeight: 'bold', ...styles.text}}>
                    Week {currentWeek}, Day {currentDay}
                  </div>
                  <div style={{fontSize: '16px', fontWeight: '600', color: darkMode ? '#a855f7' : '#7c3aed', marginTop: '4px'}}>
                    {getDayName(dayOfWeek)} - {formatDate(getDateForDay(currentWeek, currentDay))}
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: darkMode ? '#374151' : 'linear-gradient(to right, #f3e8ff, #fce7f3)',
                    borderRadius: '999px',
                    marginTop: '8px',
                  }}>
                    <span style={{fontSize: '24px'}}>{workoutSchedule[dayOfWeek].emoji}</span>
                    <span style={{fontWeight: '600', fontSize: '14px', color: darkMode ? '#c084fc' : '#7c3aed'}}>
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
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    opacity: (currentWeek === 8 && currentDay === 7) ? 0.3 : 1,
                    cursor: (currentWeek === 8 && currentDay === 7) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px'}}>
              <div style={styles.card}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                  <TrendingDown color="#22c55e" size={20} />
                  <h3 style={{fontWeight: 'bold', ...styles.text}}>Weight</h3>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={dayData.weight || ''}
                  onChange={(e) => updateWeight(parseFloat(e.target.value))}
                  placeholder="94.0"
                  style={{...styles.input, fontSize: '24px', fontWeight: 'bold', textAlign: 'center'}}
                />
                {calculateAverageWeight() && (
                  <div style={{fontSize: '14px', textAlign: 'center', marginTop: '8px', ...styles.textMuted}}>
                    Avg: {calculateAverageWeight()}kg
                  </div>
                )}
              </div>

              <div style={styles.card}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                  <Activity color="#3b82f6" size={20} />
                  <h3 style={{fontWeight: 'bold', ...styles.text}}>Steps</h3>
                </div>
                <input
                  type="number"
                  value={dayData.steps || ''}
                  onChange={(e) => updateDayData({ steps: parseInt(e.target.value) })}
                  placeholder={dayOfWeek === 2 ? "8000" : "12000"}
                  style={{...styles.input, fontSize: '24px', fontWeight: 'bold', textAlign: 'center'}}
                />
                <div style={{fontSize: '14px', textAlign: 'center', marginTop: '8px', ...styles.textMuted}}>
                  Target: {dayOfWeek === 2 ? '8-10k' : '12-13k'}
                </div>
              </div>

              <div style={styles.card}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                  <span style={{fontSize: '20px'}}>💧</span>
                  <h3 style={{fontWeight: 'bold', ...styles.text}}>Water (L)</h3>
                </div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                  <button
                    onClick={() => updateDayData({ water: Math.max(0, (dayData.water || 0) - 0.5) })}
                    style={{
                      ...styles.button,
                      background: darkMode ? '#374151' : '#f3e8ff',
                      color: darkMode ? '#c084fc' : '#7c3aed',
                      fontSize: '20px',
                      fontWeight: 'bold',
                    }}
                  >
                    -
                  </button>
                  <div style={{fontSize: '28px', fontWeight: 'bold', width: '80px', textAlign: 'center', ...styles.text}}>
                    {(dayData.water || 0).toFixed(1)}
                  </div>
                  <button
                    onClick={() => updateDayData({ water: (dayData.water || 0) + 0.5 })}
                    style={{
                      ...styles.button,
                      background: darkMode ? '#374151' : '#f3e8ff',
                      color: darkMode ? '#c084fc' : '#7c3aed',
                      fontSize: '20px',
                      fontWeight: 'bold',
                    }}
                  >
                    +
                  </button>
                </div>
                <div style={{fontSize: '14px', textAlign: 'center', marginTop: '8px', ...styles.textMuted}}>
                  Target: 3-4L
                </div>
              </div>
            </div>

            {/* Meals */}
            <div style={styles.card}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h2 style={{fontSize: '20px', fontWeight: 'bold', ...styles.text}}>Today's Meals</h2>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '4px 12px',
                  background: darkMode ? '#374151' : '#f3e8ff',
                  color: darkMode ? '#c084fc' : '#7c3aed',
                  borderRadius: '999px',
                }}>
                  {totalMacros.cals} cal
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {Object.entries(mealPlan).map(([mealKey, meal]) => (
                  <div
                    key={mealKey}
                    onClick={() => toggleMeal(mealKey)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      background: dayData.meals?.[mealKey]
                        ? (darkMode ? 'rgba(34, 197, 94, 0.2)' : 'linear-gradient(to right, #dcfce7, #d1fae5)')
                        : (darkMode ? '#1f2937' : '#fff'),
                      border: dayData.meals?.[mealKey]
                        ? `2px solid ${darkMode ? '#22c55e' : '#86efac'}`
                        : `2px solid ${darkMode ? '#374151' : '#f3e8ff'}`,
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: dayData.meals?.[mealKey] ? '#22c55e' : (darkMode ? '#374151' : '#f3e8ff'),
                      flexShrink: 0,
                    }}>
                      {dayData.meals?.[mealKey] && <Check color="#fff" size={18} />}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '600', textTransform: 'capitalize', marginBottom: '4px', ...styles.text}}>
                        {mealKey}
                      </div>
                      <div style={{fontSize: '14px', marginBottom: '4px', ...styles.textMuted}}>
                        {meal.item}
                      </div>
                      <div style={{display: 'flex', gap: '12px', fontSize: '12px', ...styles.textMuted}}>
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>{meal.cals} cal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '16px',
                background: darkMode ? '#1f2937' : 'linear-gradient(to right, #f3e8ff, #fce7f3)',
              }}>
                <div style={{fontWeight: 'bold', marginBottom: '8px', ...styles.text}}>Daily Totals</div>
                <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
                  <div>
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: darkMode ? '#a855f7' : '#7c3aed'}}>
                      {totalMacros.protein}g
                    </div>
                    <div style={{fontSize: '12px', ...styles.textMuted}}>Protein</div>
                  </div>
                  <div>
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: darkMode ? '#a855f7' : '#7c3aed'}}>
                      {totalMacros.carbs}g
                    </div>
                    <div style={{fontSize: '12px', ...styles.textMuted}}>Carbs</div>
                  </div>
                  <div>
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: darkMode ? '#a855f7' : '#7c3aed'}}>
                      {totalMacros.cals}
                    </div>
                    <div style={{fontSize: '12px', ...styles.textMuted}}>Calories</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Footer */}
            <div style={{
              ...styles.card,
              background: 'linear-gradient(to right, #a855f7, #ec4899, #3b82f6)',
              textAlign: 'center',
              color: '#fff',
            }}>
              <div style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '8px'}}>
                {calculateProgress() < 25 && "💪 Building momentum!"}
                {calculateProgress() >= 25 && calculateProgress() < 50 && "🔥 Crushing it!"}
                {calculateProgress() >= 50 && calculateProgress() < 75 && "🚀 More than halfway!"}
                {calculateProgress() >= 75 && calculateProgress() < 100 && "⭐ Final push!"}
                {calculateProgress() === 100 && "🏆 TRANSFORMATION COMPLETE!"}
              </div>
              <div style={{fontSize: '16px', opacity: 0.9}}>
                {currentWeek <= 2 && "Foundation phase - Get your routine dialed in"}
                {currentWeek > 2 && currentWeek <= 4 && "Momentum phase - Muscle memory kicking in"}
                {currentWeek > 4 && currentWeek <= 6 && "The grind - Stay strong, trust the process"}
                {currentWeek > 6 && "Transformation phase - Visual changes accelerating"}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'daily' && (
          <div style={{...styles.card, textAlign: 'center', padding: '48px'}}>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', ...styles.text}}>
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
            <p style={styles.textMuted}>
              Coming soon! For now, use the Daily tab to track your progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransformationTracker;