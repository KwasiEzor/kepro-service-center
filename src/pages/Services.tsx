import React from 'react';
import { motion } from 'motion/react';
import { 
  Key, 
  Settings, 
  Cpu, 
  ShieldCheck, 
  FileSearch, 
  Zap, 
  Lock, 
  RefreshCcw,
  Microchip
} from 'lucide-react';
import { cn } from '../lib/utils';

const serviceCategories = [
  {
    id: "keys",
    title: "Car Key Solutions",
    description: "State-of-the-art key cutting and programming for high-end automotive brands.",
    services: [
      { name: "Backup Key Creation", detail: "Professional duplication of smart keys and fobs." },
      { name: "Lost All Keys (AKL)", detail: "Complete key recovery without vehicle disassembly." },
      { name: "Remote Repair", detail: "Restoring signal strength and battery management." },
      { name: "Emergency Lockout", detail: "Non-destructive vehicle entry using Lishi tools." }
    ],
    icon: Key,
    image: "https://images.unsplash.com/photo-1619641782822-233bc69f5601?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "diagnostics",
    title: "Advanced Diagnostics",
    description: "Dealer-level binary analysis of vehicle control units and electronic systems.",
    services: [
      { name: "Full System Scan", detail: "DTC clearing and deep network analysis." },
      { name: "EGR / DPF Analysis", detail: "Checking particulate filter and valve efficiency." },
      { name: "Sensor Calibration", detail: "ADAS and radar system alignment." },
      { name: "Performance Logging", detail: "Real-time data capture for power profiling." }
    ],
    icon: Cpu,
    image: "https://images.unsplash.com/photo-1593583845845-7d67ede93328?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "programming",
    title: "ECU & Modules",
    description: "Complex software synchronization and unit replacements for modern automotive architectures.",
    services: [
      { name: "Module Coding", detail: "Programming new components to the factory network." },
      { name: "Immo Synchronization", detail: "Fixing pairing issues between ECU and BCM." },
      { name: "Software Updates", detail: "Flashing official firmware to fix factory bugs." },
      { name: "Odometer Sync", detail: "Correcting mileage after cluster replacement." }
    ],
    icon: Microchip,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
  }
];

export default function Services() {
  return (
    <div className="pt-32 pb-20 overflow-hidden">
      {/* Header */}
      <section className="px-6 sm:px-12 mb-20 text-center relative">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-xs font-bold tracking-widest uppercase text-brand-red mb-8"
        >
          Specialist Automotive Tech
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight"
        >
          Technical <span className="text-white/40">Expertise</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
        >
          We bridge the gap between mechanical hardware and digital software. Our technicians are trained in the latest immobilizer technologies and diagnostic protocols.
        </motion.p>
      </section>

      {/* Main Services Wall */}
      <section className="px-6 sm:px-12 max-w-7xl mx-auto space-y-32">
        {serviceCategories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={cn(
              "flex flex-col lg:flex-row gap-16 items-center",
              idx % 2 !== 0 && "lg:flex-row-reverse"
            )}
          >
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center p-4 border border-brand-red/20 shadow-[0_0_20px_rgba(255,45,45,0.1)]">
                  <cat.icon className="w-full h-full text-brand-red" />
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold leading-none">{cat.title}</h2>
              </div>
              
              <p className="text-xl text-white/70 font-medium">
                {cat.description}
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                {cat.services.map((s, i) => (
                  <div key={i} className="glass p-6 rounded-3xl hover:bg-white/5 transition-colors border-white/5">
                    <h4 className="font-bold text-white mb-2">{s.name}</h4>
                    <p className="text-xs text-white/40 leading-relaxed font-medium">
                      {s.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative group">
              <div className="relative rounded-[40px] overflow-hidden aspect-[4/3] border border-white/10 shadow-2xl">
                <img 
                  src={cat.image} 
                  alt={cat.title}
                  className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/60 via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Decorative side block */}
              <div className={cn(
                "absolute -z-10 w-full h-full border-2 border-brand-red/20 rounded-[40px] transition-transform duration-500 group-hover:scale-105",
                idx % 2 === 0 ? "top-6 right-6" : "top-6 left-6"
              )} />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Brand Coverage banner */}
      <section className="mt-32 py-20 bg-white/5 border-y border-white/5">
        <div className="flex flex-col items-center gap-8 text-center text-white/20">
          <span className="text-sm font-bold tracking-[0.3em] uppercase">Supporting leading manufacturers</span>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 px-6">
            {['VOLKSWAGEN', 'AUDI', 'BMW', 'MERCEDES', 'PORSCHE', 'LAND ROVER', 'PEUGEOT', 'RENAULT'].map(b => (
              <span key={b} className="text-2xl font-display font-black tracking-tighter hover:text-white/60 transition-colors cursor-default">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
