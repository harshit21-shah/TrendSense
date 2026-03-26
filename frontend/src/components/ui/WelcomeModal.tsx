import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Zap, Target, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('trendsense_welcome_seen');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('trendsense_welcome_seen', 'true');
    setIsOpen(false);
  };

  const steps = [
    {
      icon: <Sparkles size={32} className="text-accent" />,
      title: 'Welcome to TrendSense',
      description: 'Your AI-powered intelligence platform for tracking high-velocity market signals across AI, Fintech, Climate Tech, and more.',
      features: [
        'Real-time trend detection from Reddit, HackerNews, and tech communities',
        'AI-powered analysis with investment thesis and risk assessment',
        'No account needed — fully public intelligence data',
      ],
    },
    {
      icon: <TrendingUp size={32} className="text-success" />,
      title: 'Understanding TVS Score',
      description: 'Trend Velocity Score (TVS) measures how fast a trend is accelerating.',
      features: [
        { label: '90-100', desc: 'Very High — Explosive growth, high momentum', color: 'text-success' },
        { label: '70-89', desc: 'High — Strong signals, rising interest', color: 'text-blue-400' },
        { label: '50-69', desc: 'Medium — Steady growth, watch closely', color: 'text-yellow-400' },
        { label: '0-49', desc: 'Low — Early signals, emerging trends', color: 'text-text-muted' },
      ],
    },
    {
      icon: <Zap size={32} className="text-yellow-400" />,
      title: 'Trend Stages Explained',
      description: 'Each signal is classified by its market maturity stage.',
      features: [
        { label: 'Emerging', desc: 'Early-stage signals, high risk/reward', color: 'text-success' },
        { label: 'Rising', desc: 'Growing momentum, increasing adoption', color: 'text-blue-400' },
        { label: 'Mainstream', desc: 'Established trends, broad awareness', color: 'text-purple-400' },
        { label: 'Fading', desc: 'Declining interest, potential pivot', color: 'text-orange-400' },
      ],
    },
    {
      icon: <Target size={32} className="text-accent" />,
      title: 'Key Features',
      description: 'Everything you need to stay ahead of market trends.',
      features: [
        'Signals Feed — Browse all detected trends with real-time TVS scores',
        'Shruti AI — Chat with our AI analyst for deep-dive insights',
        'Daily Brief — Get curated intelligence reports',
        'Timeline — Track how trends evolve over time',
        'Watchlist — Save and monitor your favorite signals',
      ],
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[10000]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-surface-raised border border-border/50 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="px-8 pt-8 pb-6 flex items-start justify-between border-b border-border/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-text-primary tracking-tight leading-none">
                      {currentStepData.title}
                    </h2>
                    <p className="text-sm text-text-muted mt-1.5">
                      {currentStepData.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-xl hover:bg-surface"
                  aria-label="Close welcome guide"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-6 min-h-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {currentStepData.features.map((feature, i) => {
                      const isObject = typeof feature === 'object' && 'label' in feature;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-xl transition-all",
                            isObject ? "bg-surface/50 border border-border/20" : "bg-surface/30"
                          )}
                        >
                          <div className="w-6 h-6 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-black text-accent">{i + 1}</span>
                          </div>
                          <div className="flex-1">
                            {isObject ? (
                              <>
                                <div className={cn("text-sm font-black mb-1", feature.color)}>
                                  {feature.label}
                                </div>
                                <div className="text-sm text-text-secondary leading-relaxed">
                                  {feature.desc}
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-text-secondary leading-relaxed">
                                {feature}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-border/20 bg-surface/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        i === currentStep 
                          ? "w-8 bg-accent" 
                          : "w-2 bg-border/40 hover:bg-border/60"
                      )}
                      aria-label={`Go to step ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-surface transition-all"
                    >
                      Back
                    </button>
                  )}
                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleClose}
                      className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm transition-all shadow-lg shadow-accent/20"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
