import { ArrowRight, Clock3, Eye, HandCoins, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="page-shell relative mx-auto w-full max-w-7xl px-4 pb-14 pt-6 font-body text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-cyber/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-56 h-72 w-72 rounded-full bg-mint/20 blur-3xl" />

      <header className="site-nav glass-card sticky top-4 z-20 mb-8 animate-fade-up p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">Ghost-Author</p>
            <p className="text-sm text-white/65">Transparent royalty rails for collaborative IP</p>
          </div>

          <Link className="neon-button" to="/app">
            Open App
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-6 lg:grid-cols-12">
        <article className="hero-card glass-card animate-fade-up p-6 lg:col-span-8">
          <span className="hero-kicker badge border-cyber/40 bg-cyber/15 text-cyan-300">Problem Statement</span>
          <h1 className="hero-headline mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Creator royalties are often delayed, opaque, and manually calculated.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">
            Ghost-Author solves the payout bottleneck in creative collaboration. Instead of waiting
            for agency accounting cycles, every payment can be split on-chain in real-time based on
            pre-agreed percentages.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="problem-card">
              <Clock3 className="h-4 w-4 text-warning" />
              <p className="mt-2 text-sm font-semibold">Payment Delays</p>
              <p className="mt-1 text-xs text-white/65">Manual reconciliation can take days or weeks.</p>
            </div>
            <div className="problem-card">
              <Eye className="h-4 w-4 text-cyber" />
              <p className="mt-2 text-sm font-semibold">Low Transparency</p>
              <p className="mt-1 text-xs text-white/65">Stakeholders cannot verify split logic instantly.</p>
            </div>
            <div className="problem-card">
              <HandCoins className="h-4 w-4 text-mint" />
              <p className="mt-2 text-sm font-semibold">Operational Overhead</p>
              <p className="mt-1 text-xs text-white/65">Finance teams repeat the same payout process each cycle.</p>
            </div>
          </div>

          <Link className="neon-button mt-6" to="/app">
            Launch Royalty Studio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </article>

        <aside className="flow-card glass-card animate-fade-up p-6 [animation-delay:80ms] lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/55">How It Works</p>
          <ol className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flow-step rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="font-semibold">1. Configure Split</p>
              <p className="mt-1 text-xs text-white/65">Owner defines collaborators and percentage shares.</p>
            </li>
            <li className="flow-step rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="font-semibold">2. Validate On-Chain</p>
              <p className="mt-1 text-xs text-white/65">Contract enforces exact 100% total share (10,000 bps).</p>
            </li>
            <li className="flow-step rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="font-semibold">3. Pay Once</p>
              <p className="mt-1 text-xs text-white/65">Payer submits one transaction for the selected asset.</p>
            </li>
            <li className="flow-step rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="font-semibold">4. Split Instantly</p>
              <p className="mt-1 text-xs text-white/65">Funds are distributed atomically to all stakeholders.</p>
            </li>
          </ol>

          <div className="mt-4 rounded-xl border border-mint/30 bg-mint/10 p-3 text-xs text-mint">
            <Zap className="mb-1 h-4 w-4" />
            Real-time payout + on-chain auditability for every payment.
          </div>
        </aside>
      </section>
    </div>
  );
}
