import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Cpu, Key, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

const brandCategories = [
  {
    title: "German Precision",
    description: "Full module coding and key support for high-end German manufacturers.",
    brands: [
      { name: "BMW", series: "E, F, G Series Support", features: ["Key Programming", "ECU Coding", "ISN Recovery"] },
      { name: "Mercedes", series: "FBS 3 & 4 Systems", features: ["EIS Repair", "ELV Repair", "AMG Coding"] },
      { name: "Audi / VW", series: "MQB & MLB Platform", features: ["Immo 4th/5th Gen", "Component Protection", "Virtual Cockpit Sync"] },
      { name: "Porsche", series: "All Modern Models", features: ["PDK Programming", "Brake Bleeding", "Main Battery Coding"] }
    ]
  },
  {
    title: "British Luxury",
    description: "Specialized diagnostics for Land Rover and Jaguar platforms.",
    brands: [
      { name: "Land Rover", series: "Discovery, Range Rover", features: ["KVM Programming", "NGE Repair", "Terrain Response Code"] },
      { name: "Jaguar", series: "XE, XF, F-Type", features: ["Smart Key Integration", "BCM Pairing", "Diagnostic Logging"] }
    ]
  },
  {
    title: "French Tech",
    description: "Complete coverage for local automotive leaders.",
    brands: [
      { name: "Renault", series: "All Card & Key Models", features: ["UCH Programming", "Card Recovery", "Electronic Steering Lock"] },
      { name: "Peugeot", series: "All BSI Platforms", features: ["Pin Code Reading", "Key Matching", "DiagBox Analysis"] }
    ]
  }
];

export default function Brands() {
  return (
    <div className="pt-32 pb-20">
      <section className="px-6 sm:px-12 max-w-7xl mx-auto text-center mb-32">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-display font-bold mb-8"
        >
          Supported <span className="text-white/30">Manufacturers</span>
        </motion.h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
          We invest heavily in specialized hardware licenses for each manufacturer to provide dealer-equivalent or superior service capabilities.
        </p>
      </section>

      <section className="px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="space-y-32">
          {brandCategories.map((cat, idx) => (
            <motion.div 
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="max-w-xl">
                  <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">{cat.title}</h2>
                  <p className="text-lg text-white/40">{cat.description}</p>
                </div>
                <div className="flex items-center gap-2 text-brand-red font-bold uppercase tracking-widest text-xs">
                  <ShieldCheck className="w-5 h-5" /> Certified Coverage
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {cat.brands.map((brand) => (
                  <div key={brand.name} className="glass p-10 clip-angular-lg hover:bg-white/5 transition-all group border-white/5">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-4xl font-display font-black tracking-tighter mb-1 tracking-wider text-white group-hover:text-brand-red transition-colors">{brand.name}</h3>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">{brand.series}</p>
                      </div>
                      <div className="w-12 h-12 glass clip-angular-sm flex items-center justify-center p-3">
                         <Cpu className="text-white/40 w-full h-full" />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                       {brand.features.map(f => (
                         <span key={f} className="text-[10px] font-bold uppercase tracking-widest border border-white/10 px-3 py-1.5 clip-angular-sm text-white/50 group-hover:border-brand-red/30 group-hover:text-white transition-all">
                           {f}
                         </span>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Verification footer */}
      <section className="mt-32 px-6 sm:px-12">
        <div className="max-w-4xl mx-auto glass p-12 rounded-[50px] text-center border-brand-red/10 overflow-hidden relative group">
           <div className="absolute inset-0 bg-brand-red/5 mix-blend-overlay group-hover:bg-brand-red/10 transition-colors" />
           <CheckCircle2 className="w-12 h-12 text-brand-red mx-auto mb-8 shadow-2xl" />
           <h3 className="text-2xl md:text-3xl font-display font-bold mb-6">Can't see your brand?</h3>
           <p className="text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
             Our technical toolchain expands monthly. Even if your manufacturer isn't listed above, we likely have the protocols to support its basic diagnostic and key coding requirements.
           </p>
           <button className="px-8 py-3 bg-white text-brand-blue clip-angular-sm font-bold hover:scale-105 transition-all bg-glow-red">
             Inquire about your model
           </button>
        </div>
      </section>
    </div>
  );
}
