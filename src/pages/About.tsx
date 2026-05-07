import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Users, Zap, Award, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

const values = [
  {
    title: "Technical Excellence",
    text: "We don't just clear errors; we analyze root causes within the vehicle's binary architecture.",
    icon: Target
  },
  {
    title: "Mobile Freedom",
    text: "Dealer-grade service delivered to your location, saving you time and towing costs.",
    icon: Globe
  },
  {
    title: "Unmatched Reliability",
    text: "Our success rate with complex immobilizer issues is over 98% for premium brands.",
    icon: Shield
  }
];

export default function About() {
  return (
    <div className="pt-32 pb-20">
      <section className="px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">
              Redefining <br />
              <span className="text-brand-red">Auto Support</span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-xl">
              Founded in 2018, KeyPro was born out of a frustration with traditional dealer lead times and rigid workshop schedules. We envisioned a world where elite technical skill could be dispatched on-demand.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="clip-angular-lg overflow-hidden shadow-2xl border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1200" 
                alt="Our Engineering Team"
                className="w-full grayscale brightness-75 hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Visual accent */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-red/20 blur-3xl -z-10" />
          </motion.div>
        </div>

        {/* Vision/Values */}
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, idx) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="glass p-10 rounded-[35px] border-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="w-14 h-14 bg-brand-blue clip-angular-sm flex items-center justify-center p-3 mb-8 group-hover:scale-110 transition-transform">
                <v.icon className="w-full h-full text-brand-red" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{v.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {v.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="py-32 px-6 sm:px-12 bg-white/5 mt-32">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Our Journey</h2>
          <p className="text-white/60 text-lg">Continuous evolution in the rapidly changing world of automotive software.</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-20 relative">
          {/* Vertical Line */}
          <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-px bg-white/10" />

          {[
            { year: "2018", title: "Launch", desc: "Started as a small local mobile locksmith service with one technician." },
            { year: "2020", title: "Tech Expansion", desc: "Implemented dealer-level ODIS and Star Diagnosis capabilities." },
            { year: "2022", title: "Regional Hubs", desc: "Opened three rapid response centers covering the entire metro area." },
            { year: "2024", title: "AI Integration", desc: "Launched automated diagnostic profiling for faster client quotes." }
          ].map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={item.year} 
              className={cn(
                "flex flex-col md:flex-row items-center gap-8 md:gap-20",
                idx % 2 === 0 ? "md:flex-row-reverse" : ""
              )}
            >
              <div className="flex-1 text-center md:text-right">
                <div className={cn(
                  "hidden md:block",
                  idx % 2 === 0 ? "md:text-left" : "md:text-right"
                )}>
                  <h3 className="text-3xl font-display font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-brand-red clip-angular-sm flex items-center justify-center font-black text-white relative z-10 border-4 border-[#0D0D0D] bg-glow-red">
                {item.year.slice(2)}
              </div>
              <div className="flex-1">
                <div className={cn(
                  "block md:hidden text-center",
                  "md:block",
                  idx % 2 === 0 ? "md:text-right" : "md:text-left"
                )}>
                   <div className="md:hidden">
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-white/40 text-sm">{item.desc}</p>
                  </div>
                  <div className="hidden md:block">
                    <h3 className="text-3xl font-display font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

