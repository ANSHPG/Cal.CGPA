"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";

export function LandingPage() {
  return (
    <div className="bg-[#181715] text-[#faf9f5] font-sans selection:bg-[#cc785c]/30 selection:text-white min-h-screen flex flex-col">
      {/* 
        HERO SECTION (min 100vh)
        Uses Claude Design System: Dark theme anchored on #181715
      */}
      <div className="min-h-screen flex flex-col relative z-10">
        {/* Top Nav */}
        <header className="h-20 border-b border-[#252320] flex items-center justify-between px-6 md:px-12 bg-[#181715]">
          <div className="font-serif text-2xl tracking-tight text-[#faf9f5]">
            Cal.CGPA
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login">
              <button className="text-[14px] font-medium text-[#faf9f5] hover:text-[#a09d96] transition-colors">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-[#cc785c] hover:bg-[#a9583e] text-white px-5 h-10 rounded-[8px] font-medium transition-colors text-[14px]">
                Register
              </button>
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-24 max-w-5xl mx-auto w-full">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#cc785c]/30 bg-[#cc785c]/10 text-xs text-[#cc785c] font-medium mb-12 uppercase tracking-[1.5px]">
            Academic Excellence
          </div>

          {/* Headline - Copernicus/Tiempos approximation */}
          <h1 className="text-5xl md:text-[64px] font-normal tracking-[-1.5px] text-[#faf9f5] mb-8 font-serif leading-[1.05] max-w-4xl">
            A considered approach <br /> to academic tracking.
          </h1>

          {/* Subheadline - StyreneB/Inter approximation */}
          <p className="text-[#a09d96] text-[18px] md:text-[22px] max-w-2xl mx-auto font-normal leading-[1.55] mb-12">
            The premier CGPA calculator and ERP dashboard for Electrical Engineering students. 
            Engineered for clarity, precision, and speed.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full bg-[#cc785c] hover:bg-[#a9583e] text-white px-8 h-[48px] rounded-[8px] font-medium text-[16px] transition-colors flex items-center justify-center gap-2">
                Register <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full bg-[#252320] hover:bg-[#1f1e1b] border border-[#3d3d3a] text-[#faf9f5] px-8 h-[48px] rounded-[8px] font-medium text-[16px] transition-colors">
                Login
              </button>
            </Link>
          </div>

          {/* Product Mockup Card (Dark Surface) */}
          <div className="w-full max-w-3xl rounded-[12px] bg-[#1f1e1b] border border-[#252320] p-6 shadow-2xl overflow-hidden text-left">
            <div className="flex items-center gap-2 mb-6 border-b border-[#252320] pb-4">
              <Terminal className="w-4 h-4 text-[#a09d96]" />
              <div className="text-[13px] text-[#a09d96] font-mono">cal-cgpa/terminal</div>
            </div>
            
            <div className="font-mono text-[14px] leading-[1.6] text-[#faf9f5]">
              <div className="flex text-[#a09d96] mb-4">
                <span className="w-8 text-right mr-4 opacity-50">1</span>
                <span>// Student Profile Loaded</span>
              </div>
              <div className="flex mb-1">
                <span className="w-8 text-right mr-4 text-[#a09d96] opacity-50">2</span>
                <span className="text-[#cc785c]">const</span> <span className="text-[#faf9f5] ml-2">student</span> <span className="text-[#cc785c] ml-2">=</span> <span className="text-[#faf9f5] ml-2">{`{`}</span>
              </div>
              <div className="flex mb-1">
                <span className="w-8 text-right mr-4 text-[#a09d96] opacity-50">3</span>
                <span className="text-[#5db8a6] ml-8">branch:</span> <span className="text-[#e8a55a] ml-2">"Electrical Engineering"</span>,
              </div>
              <div className="flex mb-1">
                <span className="w-8 text-right mr-4 text-[#a09d96] opacity-50">4</span>
                <span className="text-[#5db8a6] ml-8">status:</span> <span className="text-[#e8a55a] ml-2">"Active"</span>
              </div>
              <div className="flex mb-4">
                <span className="w-8 text-right mr-4 text-[#a09d96] opacity-50">5</span>
                <span>{`};`}</span>
              </div>
              <div className="flex mb-1">
                <span className="w-8 text-right mr-4 text-[#a09d96] opacity-50">6</span>
                <span className="text-[#a09d96]">System.calculateCGPA(student);</span>
              </div>
              <div className="flex mt-4 pt-4 border-t border-[#252320]">
                <span className="w-8 text-right mr-4 text-[#a09d96] opacity-50"></span>
                <span className="text-[#5db872]">→ Success: </span> <span className="text-[#faf9f5] ml-2">CGPA 9.15 computed and synced to cloud.</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 
        AUTHOR SECTION (Below 100vh)
        Uses slightly darker/elevated surface
      */}
      <section className="bg-[#1f1e1b] border-t border-[#252320] py-24 px-6 z-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[12px] text-[#cc785c] font-medium uppercase tracking-[1.5px] mb-4">
            Creator & Developer
          </div>
          <h2 className="text-[36px] font-serif font-normal tracking-[-0.5px] text-[#faf9f5] mb-6">
            About the Author
          </h2>
          <p className="text-[16px] text-[#a09d96] leading-[1.55] max-w-xl mx-auto mb-10">
            Hi, I'm <strong className="text-[#faf9f5] font-medium">Anshuman Pattnaik</strong>. 
            I built Cal.CGPA to provide a fast, beautiful, and cloud-synced experience for tracking academic progress. 
            Passionate about creating robust software and premium user experiences.
          </p>

          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://github.com/ANSHPG" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#252320] hover:bg-[#3d3d3a] text-[#faf9f5] px-6 py-3 rounded-[8px] transition-colors font-medium text-[14px]"
            >
              GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/anshuman-pattnaik-411a01297" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#252320] hover:bg-[#3d3d3a] text-[#faf9f5] px-6 py-3 rounded-[8px] transition-colors font-medium text-[14px]"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#181715] border-t border-[#252320] py-8 px-6 text-center z-20">
        <p className="text-[#a09d96] text-[13px]">
          &copy; {new Date().getFullYear()} Cal.CGPA &middot; Built by Anshuman Pattnaik
        </p>
      </footer>
    </div>
  );
}
