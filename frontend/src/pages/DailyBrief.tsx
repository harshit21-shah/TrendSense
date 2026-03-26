import React from 'react';
import { 
  Calendar, 
  FileText, 
  Zap, 
  ChevronRight, 
  Share2, 
  Printer, 
  TrendingUp, 
  Info,
  Layers,
  Target,
  BarChart3,
  Lightbulb,
  Copy
} from 'lucide-react';
import { cn } from '../utils/cn';
import ErrorBoundary from '../components/ui/ErrorBoundary';

const DailyBrief: React.FC = () => {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sections = [
    {
      id: "01",
      title: "Executive Summary",
      icon: <FileText className="text-accent" size={24} />,
      content: (
        <div className="prose prose-invert max-w-none">
          <p className="text-base text-text-secondary leading-[1.6] font-medium">
            Today's intelligence signals indicate a sharp pivot in <strong className="text-text-primary font-bold">Generative AI applications</strong> toward specialized vertical integration. We are observing accelerated momentum in <strong className="text-text-primary font-bold">Fintech risk-assessment automation</strong> and <strong className="text-text-primary font-bold">Precision Health diagnostics</strong>.
          </p>
          <div className="h-px w-16 bg-accent/20 my-4" />
          <p className="text-sm text-text-secondary leading-[1.6]">
            The global <strong className="text-text-primary/80 font-semibold">Trend Velocity Score (TVS)</strong> for "Agentic Workflows" has spiked by 18.4% in the last 24-hour cycle, primarily driven by enterprise-level GitHub activity and high-frequency seed funding announcements in the EU region.
          </p>
        </div>
      )
    },
    {
      id: "02",
      title: "Key Trends",
      icon: <TrendingUp className="text-success" size={24} />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Agentic AI",
              score: 96,
              delta: 18.4,
              trend: 'up',
              description: "Autonomous agents capable of multi-step reasoning and tool use are seeing massive enterprise adoption."
            },
            {
              label: "Bio-Computing",
              score: 89,
              delta: 7.2,
              trend: 'up',
              description: "Synthetic biology meets compute; new paradigms in protein folding and drug discovery."
            },
            {
              label: "Sovereign Nodes",
              score: 84,
              delta: 11.5,
              trend: 'up',
              description: "Local-first, privacy-preserving AI infrastructure gaining traction in heavily regulated sectors."
            },
            {
              label: "Quantum Security",
              score: 72,
              delta: -2.1,
              trend: 'down',
              description: "Interest cooling slightly as focus shifts to near-term post-quantum cryptography implementations."
            },
            {
              label: "Edge Inference",
              score: 78,
              delta: 5.3,
              trend: 'up',
              description: "On-device AI processing gaining momentum in mobile and IoT applications for privacy and latency."
            },
            {
              label: "Neural Compression",
              score: 65,
              delta: -1.8,
              trend: 'down',
              description: "Model compression techniques stabilizing as hardware capabilities catch up to model complexity."
            }
          ].map((signal, i) => (
            <div key={i} className="p-4 rounded-card bg-surface/30 border border-border/5 hover:border-accent/10 transition-all flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-text-primary text-sm">{signal.label}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[26px] font-bold font-mono text-text-primary leading-none">{signal.score}</span>
                  <span className={cn(
                    "text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-badge",
                    signal.trend === 'up' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  )}>
                    {signal.trend === 'up' ? '+' : ''}{signal.delta}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{signal.description}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "03",
      title: "Market Insights",
      icon: <BarChart3 className="text-blue-400" size={24} />,
      content: (
        <div className="space-y-6">
          <p className="text-lg text-text-secondary/70 leading-relaxed">
            Market analysis reveals a significant correlation between <span className="text-text-primary font-bold">Edge AI deployments</span> and <span className="text-text-primary font-bold">industrial IoT efficiency</span>. Venture capital flow is shifting from horizontal LLM providers to vertical-specific solution integrators.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-surface-raised border border-border/50 text-center">
              <div className="text-3xl font-black text-text-primary mb-1">$4.2B</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">VC Inflow (24h)</div>
            </div>
            <div className="p-6 rounded-3xl bg-surface-raised border border-border/50 text-center">
              <div className="text-3xl font-black text-text-primary mb-1">12.4%</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">Avg. TVS Growth</div>
            </div>
            <div className="p-6 rounded-3xl bg-surface-raised border border-border/50 text-center">
              <div className="text-3xl font-black text-text-primary mb-1">18</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">New High-Impact Signals</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "04",
      title: "Recommended Actions",
      icon: <Target className="text-orange-400" size={24} />,
      content: (
        <div className="grid grid-cols-1 gap-6">
          {[
            { 
              title: "Strategic Pivot", 
              desc: "Reallocate infrastructure budget toward TEE-compatible hardware for sovereign AI deployments.",
              priority: "High"
            },
            { 
              title: "Risk Mitigation", 
              desc: "Implement multi-modal fraud detection systems for all transaction-heavy workflows.",
              priority: "Medium"
            },
            { 
              title: "Talent Acquisition", 
              desc: "Prioritize hiring for specialized LLM fine-tuning roles within the healthcare domain.",
              priority: "High"
            }
          ].map((action, i) => (
            <div key={i} className="group p-8 rounded-[2.5rem] bg-surface/30 border border-border/5 hover:bg-surface/50 hover:border-accent/10 transition-all duration-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                  <Lightbulb size={24} strokeWidth={2.5} />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-text-primary group-hover:text-accent transition-colors">{action.title}</h4>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                      action.priority === 'High' ? "bg-danger/10 text-danger" : "bg-blue-400/10 text-blue-400"
                    )}>
                      {action.priority} Priority
                    </span>
                  </div>
                  <p className="text-text-secondary/70 leading-relaxed font-medium">{action.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <ErrorBoundary>
      <div className="max-w-5xl mx-auto space-y-6 pb-24">
        {/* Brief Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-accent font-mono text-[10px] font-bold uppercase tracking-[0.15em]">
              <Calendar size={10} strokeWidth={3} />
              <span>Thursday, March 26, 2026</span>
            </div>
            <h1 className="text-h3 font-black tracking-tight text-text-primary">
              Intelligence Briefing
            </h1>
            <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span>Report ID:</span>
                <code className="px-1.5 py-0.5 bg-white/5 rounded text-caption font-mono">
                  TS-{new Date().getTime().toString().slice(-6)}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`TS-${new Date().getTime().toString().slice(-6)}`)}
                  className="p-1 hover:bg-surface-raised rounded transition-colors"
                  title="Copy Report ID"
                  aria-label="Copy Report ID"
                >
                  <Copy size={10} />
                </button>
              </div>
              <span className="w-1 h-1 bg-accent/20 rounded-full" />
              <span className="flex items-center gap-1 text-success/60">
                <Zap size={10} fill="currentColor" strokeWidth={0} />
                Live Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 h-9 rounded-btn bg-surface-raised border border-border/50 text-[11px] font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-all active:scale-95">
              <Share2 size={13} strokeWidth={2.5} />
              <span>Export PDF</span>
            </button>
            <button className="p-2 rounded-btn bg-surface-raised border border-border/50 text-text-muted hover:text-text-primary transition-all active:scale-95 w-9 h-9 flex items-center justify-center" aria-label="Print">
              <Printer size={14} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Brief Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {sections.map((section) => (
              <section key={section.id} className="space-y-3 scroll-mt-24" id={section.id}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-card bg-surface-raised border border-border/50 flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-accent/50 font-mono uppercase tracking-wider">Section {section.id}</span>
                    <h2 className="text-h4 font-bold tracking-tight text-text-primary leading-tight">{section.title}</h2>
                  </div>
                </div>
                <ErrorBoundary>
                  {section.content}
                </ErrorBoundary>
              </section>
            ))}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-surface-raised border border-border/50 space-y-5 sticky top-14 shadow-lg shadow-black/30">
              <div className="space-y-2">
                <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-text-muted/40 flex items-center gap-1.5">
                  <Layers size={11} className="text-accent" />
                  Navigation
                </h3>
                <nav className="flex flex-col gap-0.5">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface transition-all group border border-transparent hover:border-border/50"
                    >
                      <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary">{s.title}</span>
                      <ChevronRight size={13} className="text-text-muted/40 group-hover:text-accent transition-all group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-border/10 space-y-3">
                <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-text-muted/40 flex items-center gap-1.5">
                  <Info size={11} className="text-blue-400" />
                  Analyst Note
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed italic font-medium">
                  "Convergence of edge-compute and sovereign AI models is accelerating. We recommend an overweight position in infrastructure providers focusing on TEE by Q4."
                </p>
              </div>

              <button className="w-full py-3 rounded-xl bg-text-primary text-background text-[9px] font-black uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-black/20">
                Unlock Full Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        {scrollY > 400 && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 p-3 bg-accent text-white rounded-full shadow-lg hover:scale-110 transition-all z-50"
            title="Back to top"
          >
            <ChevronRight size={20} className="rotate-[-90deg]" />
          </button>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DailyBrief;
