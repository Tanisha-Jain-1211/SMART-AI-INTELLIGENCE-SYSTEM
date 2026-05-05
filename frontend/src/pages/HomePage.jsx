import { Link } from "react-router-dom";
import { ShieldCheck, MapPin, BarChart3, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20 py-10">
      {/* Hero Section */}
      <section className="text-center mt-10">
        <h1 className="text-5xl font-extrabold text-white tracking-tight sm:text-7xl">
          Smarter City, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 text-glow">
            Better Tomorrow.
          </span>
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-lg text-slate-300">
          The Smart Complaint Intelligence System empowers citizens to report issues seamlessly,
          while AI ensures every complaint is categorized, prioritized, and routed to the right department instantly.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/submit"
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:bg-indigo-500 hover:-translate-y-1 transition-all duration-300"
          >
            Report an Issue
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/login"
            className="rounded-full glass-panel px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all duration-300"
          >
            Track My Complaint
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6 mt-10">
        <Link to="/my-complaints" className="glass-card p-8 text-center flex flex-col items-center hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="rounded-full bg-indigo-500/20 p-4 mb-4">
            <MapPin className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Location Intelligence</h3>
          <p className="text-slate-400 text-sm">
            Pinpoint the exact location of the issue on the map. Our system automatically groups issues in the same area.
          </p>
        </Link>
        <Link to="/submit" className="glass-card p-8 text-center flex flex-col items-center hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="rounded-full bg-cyan-500/20 p-4 mb-4">
            <ShieldCheck className="h-8 w-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">AI Triage</h3>
          <p className="text-slate-400 text-sm">
            Our AI engine instantly categorizes complaints and predicts urgency, eliminating manual routing delays.
          </p>
        </Link>
        <Link to="/admin" className="glass-card p-8 text-center flex flex-col items-center hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="rounded-full bg-purple-500/20 p-4 mb-4">
            <BarChart3 className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Real-time Analytics</h3>
          <p className="text-slate-400 text-sm">
            City administrators get a bird's-eye view of all complaints, spotting trends and allocating resources effectively.
          </p>
        </Link>
      </section>
    </div>
  );
}
