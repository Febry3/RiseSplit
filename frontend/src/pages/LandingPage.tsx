import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Eye,
  HandCoins,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const painPoints = [
  {
    icon: Clock3,
    title: "Payment Delays",
    body: "Royalty reports still depend on monthly reconciliation and manual payout cycles.",
  },
  {
    icon: Eye,
    title: "Opaque Splits",
    body: "Contributors cannot verify split logic and settlement status in real-time.",
  },
  {
    icon: HandCoins,
    title: "Ops Drag",
    body: "Finance teams repeat approval and transfer flows for every single release.",
  },
];

const flowSteps = [
  {
    icon: ShieldCheck,
    title: "1. Configure Rules",
    body: "Owner sets collaborators and basis points directly in the contract state.",
  },
  {
    icon: Workflow,
    title: "2. Validate Percentages",
    body: "Split totals are enforced on-chain to always equal 10,000 bps.",
  },
  {
    icon: TrendingUp,
    title: "3. Execute One Payment",
    body: "Payer submits one transaction using XLM or USDC asset contracts.",
  },
  {
    icon: BadgeCheck,
    title: "4. Settle Atomically",
    body: "Funds are distributed to all stakeholders in a single atomic flow.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-shell page-shell relative mx-auto w-full max-w-7xl px-4 pb-14 pt-6 font-body text-white sm:px-6 lg:px-8">
      <div className="landing-glow landing-glow-left pointer-events-none" />
      <div className="landing-glow landing-glow-right pointer-events-none" />

      <header className="landing-nav glass-card sticky top-4 z-20 mb-8 animate-fade-up p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">
              Ghost-Author
            </p>
            <p className="text-sm text-white/65">
              Real-time royalty rails for collaborative IP
            </p>
          </div>

          <Link className="sunrise-button" to="/app">
            Enter Studio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-6 lg:grid-cols-12">
        <article className="landing-hero glass-card animate-fade-up p-6 lg:col-span-8">
          <span className="risein-kicker badge border-white/25 bg-white/10 text-white">
            Problem We Fix
          </span>
          <h1 className="hero-headline mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
            Royalty payout is still slow by design.
            <span className="block text-white/70">
              Ghost-Author makes it instant and verifiable.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">
            Instead of waiting for agency-led accounting cycles, payments are split
            on-chain in one transaction using pre-agreed percentages. Every party can
            inspect rules and settlement outcomes from the same source of truth.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rise-chip">On-chain split contract</span>
            <span className="rise-chip">Atomic multi-party payout</span>
            <span className="rise-chip">XLM & USDC ready</span>
            <span className="rise-chip">Freighter wallet flow</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="sunrise-button" to="/app">
              Launch Royalty Studio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a className="ghost-outline-button inline-flex items-center" href="#protocol-flow">
              View Flow
            </a>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <article className="rise-stat">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                Split Precision
              </p>
              <p className="mt-1 text-xl font-semibold">10,000 bps</p>
            </article>
            <article className="rise-stat">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                Settlement Model
              </p>
              <p className="mt-1 text-xl font-semibold">Atomic</p>
            </article>
            <article className="rise-stat">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                Auditability
              </p>
              <p className="mt-1 text-xl font-semibold">Live on Horizon</p>
            </article>
          </div>
        </article>

        <aside className="launchpad-card glass-card animate-fade-up p-6 [animation-delay:80ms] lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/55">
            Rising Signal
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight">
            A payout rail built for modern creator teams
          </h2>

          <div className="signal-graph mt-4">
            <div className="signal-line signal-line-1" />
            <div className="signal-line signal-line-2" />
            <div className="signal-line signal-line-3" />
          </div>

          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li className="rise-list-item">
              <Sparkles className="h-4 w-4 text-cyber" />
              Contract-first split policy
            </li>
            <li className="rise-list-item">
              <ShieldCheck className="h-4 w-4 text-mint" />
              Deterministic distribution rules
            </li>
            <li className="rise-list-item">
              <Zap className="h-4 w-4 text-warning" />
              One payment, all collaborators paid
            </li>
          </ul>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {painPoints.map((item, index) => (
          <article
            key={item.title}
            className="pain-card glass-card animate-fade-up p-4"
            style={{ animationDelay: `${120 + index * 70}ms` }}
          >
            <item.icon className="h-5 w-5 text-white" />
            <p className="mt-3 text-base font-semibold">{item.title}</p>
            <p className="mt-2 text-sm text-white/70">{item.body}</p>
          </article>
        ))}
      </section>

      <section
        className="flow-shell glass-card mt-6 animate-fade-up p-6 [animation-delay:180ms]"
        id="protocol-flow"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/55">Protocol Flow</p>
            <h3 className="mt-1 font-display text-2xl">From config to split settlement</h3>
          </div>
          <Link className="sunrise-button" to="/app">
            Open Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {flowSteps.map((item) => (
            <article key={item.title} className="flow-lane rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-cyan-300" />
                <p className="font-semibold">{item.title}</p>
              </div>
              <p className="mt-2 text-sm text-white/70">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rise-cta glass-card mt-6 animate-fade-up p-6 [animation-delay:240ms]">
        <p className="text-xs uppercase tracking-[0.2em] text-white/55">Outcome</p>
        <h3 className="mt-2 font-display text-3xl leading-tight">
          Faster payouts, fewer disputes, transparent economics.
        </h3>
        <p className="mt-3 max-w-3xl text-sm text-white/75 sm:text-base">
          Ghost-Author turns royalty operations from a periodic manual workflow
          into a programmable, always-on payment rail for creators, producers,
          and right holders.
        </p>
      </section>
    </div>
  );
}
