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
    <div className="pt-32 pb-20 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C4D]/10 blur-[120px] clip-angular-sm" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C4D]/10 blur-[120px] clip-angular-sm" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Header */}
      <section className="px-6 sm:px-12 mb-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 clip-angular-sm bg-gradient-to-r from-[#FF6B2C]/10 to-[#FF8C4D]/10 border border-white/10 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-xl"
        >
          <Settings className="w-3.5 h-3.5 text-[#FF6B2C]" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B2C] to-[#FF8C4D]">
            Specialist Automotive Tech
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-6xl md:text-8xl font-display font-black mb-8 tracking-tight leading-[1.05]"
        >
          <span className="block text-white">Technical</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B2C] to-[#FF8C4D] animate-gradient">
            Expertise
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
        >
          We bridge the gap between mechanical hardware and digital software. Our technicians are trained in the <span className="text-white font-bold">latest immobilizer technologies</span> and diagnostic protocols.
        </motion.p>
      </section>

      {/* Premium Services Showcase */}
      <section className="px-6 sm:px-12 max-w-7xl mx-auto space-y-40 relative z-10">
        {serviceCategories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={cn(
              "flex flex-col lg:flex-row gap-16 items-center",
              idx % 2 !== 0 && "lg:flex-row-reverse"
            )}
          >
            {/* Content Side */}
            <div className="flex-1 space-y-10">
              {/* Icon + Title */}
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B2C]/20 to-[#FF8C4D]/20 clip-angular-md flex items-center justify-center border border-white/10 backdrop-blur-xl">
                  <cat.icon className="w-10 h-10 text-[#FF6B2C]" />
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-black leading-none text-white">
                  {cat.title}
                </h2>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/70 leading-relaxed"
              >
                {cat.description}
              </motion.p>

              {/* Service Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="grid sm:grid-cols-2 gap-4 pt-4"
              >
                {cat.services.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-6 clip-angular-md border border-white/10 hover:border-white/20 transition-all"
                  >
                    {/* Gradient glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 clip-angular-md transition-all duration-300 -z-10" />

                    <h4 className="font-bold text-white mb-2 text-sm">{s.name}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {s.detail}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Image Side with Premium Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex-1 relative group"
            >
              {/* Main Image Card with Gradient Border */}
              <div className="relative p-1 clip-angular-xl bg-gradient-to-br from-white/20 to-white/5">
                <div className="relative clip-angular-lg overflow-hidden aspect-[4/3] border border-white/10 shadow-2xl">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-600/30 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                </div>
              </div>

              {/* Decorative Glow */}
              <div className={cn(
                "absolute -z-10 w-full h-full clip-angular-xl bg-gradient-to-br from-[#FF6B2C]/20 to-[#FF8C4D]/20 blur-3xl transition-all duration-700 group-hover:blur-2xl group-hover:scale-105",
                idx % 2 === 0 ? "top-8 right-8" : "top-8 left-8"
              )} />
            </motion.div>
          </motion.div>
        ))}
      </section>

      {/* Premium Brand Coverage Banner */}
      <section className="mt-40 py-24 relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="absolute inset-0 border-y border-white/5" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 clip-angular-sm bg-gradient-to-r from-white/5 to-white/10 border border-white/10 text-xs font-bold tracking-widest uppercase backdrop-blur-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/40">Supporting Leading Manufacturers</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['VOLKSWAGEN', 'AUDI', 'BMW', 'MERCEDES', 'PORSCHE', 'LAND ROVER', 'PEUGEOT', 'RENAULT'].map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, opacity: 1 }}
                className="group flex items-center justify-center p-8 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] clip-angular-md border border-white/5 hover:border-white/10 transition-all cursor-default"
              >
                <span className="text-lg md:text-xl font-display font-black tracking-tight text-white/30 group-hover:text-white/70 transition-colors">
                  {brand}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
