import type { Trend, DailyBrief } from '../types'

const genHistory = (base: number) =>
  Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
    score: Math.max(5, Math.min(100, base + (Math.random() - 0.4) * 20 * (i / 14))),
  }))

export const MOCK_TRENDS: Trend[] = [
  {
    id: 1,
    title: 'Agentic AI Frameworks Replacing Traditional SaaS Workflows',
    domain: 'AI',
    velocity_score: 91,
    tvs_delta: 14,
    stage: 'Rising',
    summary: 'Multi-agent systems like LangGraph and AutoGen are being deployed to automate entire business workflows — from lead qualification to financial reporting — without human-in-the-loop. Early adopters report 60–80% reduction in operational overhead.',
    investment_thesis: 'The shift from point-solution SaaS to agentic orchestration layers represents a $200B+ displacement opportunity. Companies building vertical-specific agent stacks (legal, finance, HR) are seeing 3–5x faster enterprise sales cycles than traditional SaaS.',
    product_opportunity: 'Build an "agent-as-a-service" platform targeting mid-market companies that lack ML teams. Focus on pre-built agent templates for common workflows with no-code customization.',
    risk_assessment: 'Reliability and hallucination remain unsolved at enterprise scale. Regulatory scrutiny around autonomous decision-making is increasing. First-mover advantage may be short-lived as hyperscalers bundle agent capabilities.',
    source_citations: ['https://news.ycombinator.com/item?id=39000001', 'https://reddit.com/r/MachineLearning', 'https://techcrunch.com/ai-agents'],
    first_seen_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    velocity_history: genHistory(91),
  },
  {
    id: 2,
    title: 'On-Device LLM Inference Hitting Consumer Hardware Thresholds',
    domain: 'AI',
    velocity_score: 78,
    tvs_delta: 22,
    stage: 'Emerging',
    summary: 'Quantized models like Llama 3.2 and Phi-3 Mini are running at usable speeds on M-series Macs and mid-range Android devices. This is triggering a wave of privacy-first AI apps that never send data to the cloud.',
    investment_thesis: 'On-device inference eliminates the per-query API cost structure, enabling new business models. Companies building on-device AI for healthcare, legal, and finance — where data sovereignty is non-negotiable — have a structural moat.',
    product_opportunity: 'Privacy-first AI assistant for regulated industries (healthcare, legal, finance) that runs entirely on-device. No data leaves the device — a compliance story that sells itself.',
    risk_assessment: 'Model quality gap vs cloud APIs remains significant for complex reasoning. Battery and thermal constraints limit sustained use. Apple and Google may commoditize this at the OS level.',
    source_citations: ['https://huggingface.co/blog/on-device', 'https://reddit.com/r/LocalLLaMA'],
    first_seen_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    velocity_history: genHistory(78),
  },
  {
    id: 3,
    title: 'GLP-1 Drugs Triggering Secondary Market Disruption in Food & Fitness',
    domain: 'Health',
    velocity_score: 85,
    tvs_delta: 31,
    stage: 'Rising',
    summary: 'Ozempic and Wegovy adoption is reshaping consumer behavior at scale — gym memberships down 12%, ultra-processed food sales declining, and a new category of "GLP-1 companion" apps emerging to manage side effects and nutrition.',
    investment_thesis: 'The downstream effects of GLP-1 adoption are larger than the drugs themselves. Protein supplement brands, low-calorie food companies, and muscle-preservation fitness concepts are seeing accelerating growth as 15M+ Americans use these drugs.',
    product_opportunity: 'A GLP-1 companion app that handles meal planning, muscle preservation protocols, and side effect management. The TAM is 15M current users growing to 50M+ by 2027.',
    risk_assessment: 'Supply constraints and insurance coverage uncertainty create demand volatility. Long-term efficacy and safety data still accumulating. Regulatory changes could restrict prescribing.',
    source_citations: ['https://reddit.com/r/Ozempic', 'https://news.ycombinator.com/item?id=39000002'],
    first_seen_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    velocity_history: genHistory(85),
  },
  {
    id: 4,
    title: 'Stablecoin Infrastructure Becoming B2B Payment Rails',
    domain: 'Fintech',
    velocity_score: 67,
    tvs_delta: 18,
    stage: 'Emerging',
    summary: 'USDC and USDT are being integrated directly into B2B payment flows by mid-market companies in emerging markets, bypassing SWIFT entirely. Settlement times dropping from 3 days to 3 seconds at 0.1% of traditional fees.',
    investment_thesis: 'The $150T annual B2B cross-border payment market is being disrupted from the bottom up. Stablecoin rails offer 99% cost reduction and instant settlement — the value proposition is undeniable for EM-to-EM corridors.',
    product_opportunity: 'A stablecoin-native B2B payment platform targeting SMEs in Southeast Asia and Latin America. Focus on corridors where traditional banking is expensive and slow.',
    risk_assessment: 'Regulatory clarity remains fragmented across jurisdictions. Banking partner risk is significant. Volatility in underlying crypto markets can affect confidence even in stablecoins.',
    source_citations: ['https://reddit.com/r/CryptoCurrency', 'https://techcrunch.com/fintech'],
    first_seen_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    velocity_history: genHistory(67),
  },
  {
    id: 5,
    title: 'Synthetic Data Generation Unlocking AI in Data-Scarce Domains',
    domain: 'AI',
    velocity_score: 72,
    tvs_delta: 9,
    stage: 'Emerging',
    summary: 'Diffusion models and LLMs are being used to generate high-fidelity synthetic training data for domains where real data is scarce, expensive, or legally restricted — radiology, autonomous driving, and fraud detection leading the charge.',
    investment_thesis: 'Synthetic data is the unlock for AI in regulated industries. Companies that can generate statistically valid, privacy-compliant synthetic datasets will capture the $1.2B data labeling market and expand it 10x.',
    product_opportunity: 'A synthetic data platform for healthcare AI — generate HIPAA-compliant synthetic patient records, medical images, and clinical notes at scale. Sell to hospital systems and pharma companies.',
    risk_assessment: 'Model collapse risk when synthetic data is used to train future models. Regulatory acceptance of synthetic data for clinical trials is still evolving. Quality validation is technically complex.',
    source_citations: ['https://arxiv.org/abs/2401.00001', 'https://reddit.com/r/MachineLearning'],
    first_seen_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    velocity_history: genHistory(72),
  },
  {
    id: 6,
    title: 'Carbon Credit Markets Gaining Institutional Credibility',
    domain: 'Climate',
    velocity_score: 54,
    tvs_delta: -3,
    stage: 'Emerging',
    summary: 'After years of greenwashing scandals, a new generation of MRV (Measurement, Reporting, Verification) technology is restoring confidence in voluntary carbon markets. Satellite-based monitoring and blockchain verification are becoming standard.',
    investment_thesis: 'The voluntary carbon market needs to reach $50B by 2030 to meet Paris Agreement targets. Companies building credible MRV infrastructure are positioned to capture the trust premium as institutional buyers re-enter the market.',
    product_opportunity: 'An MRV-as-a-service platform using satellite imagery and IoT sensors to provide real-time carbon sequestration verification. Target nature-based solution project developers.',
    risk_assessment: 'Market credibility remains fragile — one major scandal could set the market back years. Regulatory standardization is slow. Additionality and permanence remain philosophically contested.',
    source_citations: ['https://reddit.com/r/climate', 'https://news.ycombinator.com/item?id=39000003'],
    first_seen_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    velocity_history: genHistory(54),
  },
  {
    id: 7,
    title: 'Embedded Finance APIs Enabling Non-Banks to Offer Banking Products',
    domain: 'Fintech',
    velocity_score: 79,
    tvs_delta: 12,
    stage: 'Rising',
    summary: 'Platforms like Stripe Treasury, Unit, and Synctera are enabling any software company to embed bank accounts, cards, and lending products. Vertical SaaS companies are seeing 40–60% revenue uplift from embedded financial products.',
    investment_thesis: 'Every vertical SaaS company will eventually become a fintech. The infrastructure layer enabling this transition — BaaS providers, compliance-as-a-service, and ledger APIs — is a $30B+ opportunity.',
    product_opportunity: 'Build embedded lending for a specific vertical (e.g., contractor financing for home services platforms). The distribution is already built — you just need the financial product.',
    risk_assessment: 'Banking partner concentration risk. Regulatory scrutiny of BaaS models increasing after several high-profile failures. Unit economics require significant scale to be attractive.',
    source_citations: ['https://techcrunch.com/embedded-finance', 'https://reddit.com/r/fintech'],
    first_seen_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    velocity_history: genHistory(79),
  },
  {
    id: 8,
    title: 'Longevity Science Crossing from Research to Consumer Products',
    domain: 'Health',
    velocity_score: 63,
    tvs_delta: 27,
    stage: 'Emerging',
    summary: 'Biological age testing, senolytics, and NAD+ precursors are moving from academic research to mainstream consumer products. Bryan Johnson\'s Blueprint protocol has created a cultural moment that\'s accelerating consumer adoption.',
    investment_thesis: 'The longevity market is at an inflection point — moving from niche biohackers to mainstream health-conscious consumers. Companies that can translate complex longevity science into simple, measurable consumer protocols will capture significant market share.',
    product_opportunity: 'A longevity protocol subscription that combines biological age testing, personalized supplement stacks, and lifestyle optimization. Monthly testing creates retention and data flywheel.',
    risk_assessment: 'Regulatory gray area for many longevity compounds. Consumer skepticism about efficacy. High customer acquisition costs in a crowded wellness market.',
    source_citations: ['https://reddit.com/r/longevity', 'https://news.ycombinator.com/item?id=39000004'],
    first_seen_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    velocity_history: genHistory(63),
  },
  {
    id: 9,
    title: 'AI-Native Code Review Replacing Human PR Reviews at Scale',
    domain: 'AI',
    velocity_score: 88,
    tvs_delta: 19,
    stage: 'Rising',
    summary: 'Tools like CodeRabbit, Graphite, and GitHub Copilot Enterprise are handling 70–80% of routine PR review comments autonomously. Engineering teams are reporting 2–3x faster merge cycles and significantly reduced review fatigue.',
    investment_thesis: 'Code review is one of the highest-leverage bottlenecks in software development. AI-native review tools that integrate deeply with existing workflows (GitHub, GitLab, Jira) will capture the $8B developer tools market.',
    product_opportunity: 'An AI code review tool specialized for a specific language or framework (e.g., Rust, or React/TypeScript) with deeper semantic understanding than general-purpose tools.',
    risk_assessment: 'GitHub Copilot Enterprise is a direct competitor with massive distribution advantage. False positive rate in security-critical code review is still too high for many enterprises.',
    source_citations: ['https://news.ycombinator.com/item?id=39000005', 'https://reddit.com/r/programming'],
    first_seen_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    velocity_history: genHistory(88),
  },
]

export const MOCK_BRIEF: DailyBrief = {
  brief_date: new Date().toISOString().split('T')[0],
  generated_at: new Date().toISOString(),
  top_trends: MOCK_TRENDS.slice(0, 10),
  content: `# TrendSense Intelligence Brief
**${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**

## Executive Summary

This week's signal analysis across Reddit, HackerNews, and NewsAPI reveals a dominant theme: **AI infrastructure is maturing from experimental to production-grade**, with agentic frameworks and on-device inference leading velocity scores. Secondary signals in health tech (GLP-1 downstream effects, longevity) and fintech (stablecoin B2B rails, embedded finance) suggest capital is rotating toward picks-and-shovels plays in these verticals.

---

## 1. Agentic AI Frameworks Replacing Traditional SaaS | TVS: 91 | Stage: Rising

Multi-agent systems are being deployed to automate entire business workflows without human-in-the-loop. Early adopters report 60–80% reduction in operational overhead.

**Investment Thesis:** The shift from point-solution SaaS to agentic orchestration layers represents a $200B+ displacement opportunity.

**Sources:** [HackerNews](https://news.ycombinator.com) · [r/MachineLearning](https://reddit.com/r/MachineLearning) · [TechCrunch](https://techcrunch.com)

---

## 2. AI-Native Code Review at Scale | TVS: 88 | Stage: Rising

Tools handling 70–80% of routine PR review comments autonomously. Engineering teams reporting 2–3x faster merge cycles.

**Investment Thesis:** Code review is one of the highest-leverage bottlenecks in software development. AI-native tools will capture the $8B developer tools market.

**Sources:** [HackerNews](https://news.ycombinator.com) · [r/programming](https://reddit.com/r/programming)

---

## 3. GLP-1 Secondary Market Disruption | TVS: 85 | Stage: Rising

Ozempic/Wegovy adoption reshaping consumer behavior — gym memberships down 12%, new "GLP-1 companion" app category emerging.

**Investment Thesis:** Downstream effects larger than the drugs themselves. Protein supplements, low-calorie food, muscle-preservation fitness seeing accelerating growth.

**Sources:** [r/Ozempic](https://reddit.com/r/Ozempic) · [HackerNews](https://news.ycombinator.com)

---

## 4. Embedded Finance APIs | TVS: 79 | Stage: Rising

Vertical SaaS companies seeing 40–60% revenue uplift from embedded financial products via BaaS platforms.

**Investment Thesis:** Every vertical SaaS company will eventually become a fintech. The infrastructure layer is a $30B+ opportunity.

---

## 5. On-Device LLM Inference | TVS: 78 | Stage: Emerging

Quantized models running at usable speeds on consumer hardware, triggering privacy-first AI app wave.

**Investment Thesis:** On-device inference eliminates per-query API costs, enabling new business models in regulated industries.

---

*Generated by TrendSense · Multi-agent pipeline · Groq Llama 3.1 70B*`,
}

export const MOCK_DOMAINS = ['AI', 'Fintech', 'Health', 'Climate', 'Crypto']
