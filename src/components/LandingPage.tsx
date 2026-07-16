"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Cloud, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans overflow-x-hidden selection:bg-[#d97757]/30 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#d97757]/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#4f46e5]/5 blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 h-20 border-b border-[#222] flex items-center justify-between px-6 md:px-12 bg-[#121212]/80 backdrop-blur-md">
        <div className="font-semibold text-2xl tracking-tight text-[#E0E0E0] font-serif italic">
          Cal.CGPA
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium hover:bg-white/5 text-[#E0E0E0]">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#d97757] hover:bg-[#c66646] text-white px-5 rounded-full font-medium transition-all shadow-lg shadow-[#d97757]/10 hover:shadow-[#d97757]/20 text-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto pt-20 pb-32 px-6 flex flex-col items-center text-center">
        {/* Gen-Z Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d97757]/30 bg-[#d97757]/5 text-xs text-[#d97757] font-medium mb-8 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          The Ultimate Academic Hub
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-white mb-6 font-sans leading-none max-w-4xl">
          Academic tracking, <br />
          <span className="bg-gradient-to-r from-[#d97757] via-[#e28a6f] to-[#6366f1] bg-clip-text text-transparent">
            but make it clean.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-10">
          The ultimate ERP and CGPA calculator for Electrical Engineering students.
          Sleek, fast, secured by Firebase, and built for the cloud.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/register">
            <Button className="bg-[#d97757] hover:bg-[#c66646] text-white px-8 py-6 rounded-full font-semibold text-base transition-all transform hover:scale-105 shadow-xl shadow-[#d97757]/20 flex items-center gap-2">
              Start Calculating <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white px-8 py-6 rounded-full font-semibold text-base transition-all">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Apple Style Glassmorphic Product Preview */}
        <div className="relative w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#1A1A1A]/40 backdrop-blur-xl shadow-2xl p-4 md:p-8 overflow-hidden group">
          {/* Top Window Bar */}
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="text-xs text-gray-500 font-mono ml-4">cal-cgpa-erp.app/calculator</div>
          </div>

          {/* Dummy UI Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative z-10">
            {/* Student Info Card */}
            <div className="md:col-span-1 bg-[#121212]/80 border border-white/5 rounded-xl p-5 space-y-4">
              <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">Student Profile</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="text-sm font-medium text-white">Anshuman Pattnaik</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Registration No</div>
                  <div className="text-sm font-mono text-[#d97757]">23110409</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Branch</div>
                  <div className="text-xs bg-[#d97757]/10 text-[#d97757] border border-[#d97757]/20 px-2 py-0.5 rounded inline-block mt-1">
                    Electrical Engineering
                  </div>
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div className="md:col-span-2 bg-[#121212]/80 border border-white/5 rounded-xl p-5 space-y-4 relative">
              <div className="flex justify-between items-center">
                <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">Semester 4 Grades</div>
                <div className="text-xs bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30 px-2 py-0.5 rounded">
                  SGPA: 9.42
                </div>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Power Electronics</span>
                  <span className="text-[#6ee7b7] font-bold">O</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Microprocessors & Microcontrollers</span>
                  <span className="text-[#34d399] font-bold">E</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Electrical Machines-II</span>
                  <span className="text-[#2dd4bf] font-bold">A</span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute bottom-[-15px] right-[-15px] bg-[#d97757] text-white px-4 py-2 rounded-full font-bold shadow-lg transform rotate-6 border-2 border-[#1E1E1E] text-xs">
                CGPA: 9.15 🔥
              </div>
            </div>
          </div>

          {/* Bottom shadow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent pointer-events-none opacity-40" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-[#222] bg-[#161616]/40 py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16 font-serif italic">
            Engineered for performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1C1C1E]/50 border border-white/5 rounded-2xl p-6 hover:border-[#d97757]/30 transition-all space-y-4">
              <div className="bg-[#d97757]/10 p-3 rounded-xl w-12 h-12 flex items-center justify-center text-[#d97757]">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Cloud Synced</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Save your progress instantly. Access your grades from any device, anywhere, securely linked to your account.
              </p>
            </div>

            <div className="bg-[#1C1C1E]/50 border border-white/5 rounded-2xl p-6 hover:border-[#d97757]/30 transition-all space-y-4">
              <div className="bg-[#4f46e5]/10 p-3 rounded-xl w-12 h-12 flex items-center justify-center text-[#6366f1]">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Excel Exports</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Export your entire academic record into a perfectly styled Excel template sheet with a single click.
              </p>
            </div>

            <div className="bg-[#1C1C1E]/50 border border-white/5 rounded-2xl p-6 hover:border-[#d97757]/30 transition-all space-y-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl w-12 h-12 flex items-center justify-center text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Admin Controls</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Authorized administrators have full viewing privileges of all student results, styled beautifully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#222] bg-[#121212] py-8 px-6 text-center text-xs text-gray-500 relative z-10">
        <div>&copy; {new Date().getFullYear()} Cal.CGPA. Built with Next.js and Firebase.</div>
      </footer>
    </div>
  );
}
