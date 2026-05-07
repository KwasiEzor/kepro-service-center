import React from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import {
  Key,
  Settings,
  Cpu,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
  MapPin,
  Star,
  ChevronRight,
  Clock,
  Car,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const services = [
  {
    title: "Car Key Specialist",
    description: "Lost all keys? We can program and cut new keys on-site for almost any vehicle model.",
    icon: Key,
    gradient: "from-[#FF6B2C] to-[#FF8C4D]",
    features: ["All Key Lost Recovery", "Smart Key Programming", "Remote Diagnostics"]
  },
  {
    title: "Full Diagnostics",
    description: "Deep binary scans of your vehicle electronics using dealer-level specialized equipment.",
    icon: Cpu,
    gradient: "from-[#FF6B2C] to-[#FFA06D]",
    features: ["ECU Analysis", "Network Scan", "Performance Tuning"]
  },
  {
    title: "Immobilizer Repairs",
    description: "Fixing ECU synchronization issues and complex immobilizer system failures.",
    icon: Settings,
    gradient: "from-[#FF8C4D] to-[#FF6B2C]",
    features: ["Module Coding", "Immo Sync", "Software Updates"]
  }
];

const stats = [
  { label: "Successful Services", value: "12k+", icon: CheckCircle2 },
  { label: "Expert Technicians", value: "24", icon: ShieldCheck },
  { label: "Response Time", value: "30min", icon: Clock },
  { label: "Client Rating", value: "4.9/5", icon: Star }
];

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / 20);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / 20);
  };

  return (
    <div className="relative overflow-hidden pt-20">
      {/* Hero Section - Automotive Style */}
      <section className="relative min-h-screen flex items-center justify-center pt-10 px-6 sm:px-12" onMouseMove={handleMouseMove}>
        {/* Automotive Dark Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D]" />

          <motion.div
            style={{ x: springX, y: springY }}
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C4D]/5 blur-[120px] clip-angular-sm"
          />
          <motion.div
            style={{ x: -springX, y: -springY }}
            className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-brand-red/5 to-[#FF6B2C]/10 blur-[100px] clip-angular-sm"
          />

          {/* Automotive Grid Pattern */}
          <div className="absolute inset-0 automotive-grid opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Automotive Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 clip-angular-sm bg-gradient-to-r from-[#FF6B2C]/10 to-[#FF8C4D]/10 border border-[#FF6B2C]/20 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-xl"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B2C]" />
              <span className="text-[#FF6B2C]">
                Premium Mobile Service
              </span>
            </motion.div>

            {/* Hero Headline - Automotive Style */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05]"
            >
              <span className="block text-white">Technicien</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B2C] to-[#FF8C4D] text-glow-strong">
                Auto Mobile
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/70 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Clés, Diagnostic, Programmation. Solution technique <span className="text-[#FF6B2C] font-bold">haut de gamme</span> directement chez vous.
            </motion.p>

            {/* Automotive CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/quote"
                className="group relative inline-flex items-center gap-3 px-8 py-4 clip-angular-sm font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C4D]" />
                <div className="absolute inset-0 bg-glow-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2 text-white">
                  Request Service <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/services"
                className="group relative inline-flex items-center gap-3 px-8 py-4 clip-angular-sm font-bold text-lg overflow-hidden border border-white/10 backdrop-blur-xl hover:border-[#FF6B2C]/30 hover:bg-white/5 transition-all"
              >
                <span className="relative z-10 text-white/90 group-hover:text-white transition-colors">
                  Explore Services
                </span>
              </Link>
            </motion.div>

            {/* Premium Brands */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 flex items-center justify-center lg:justify-start gap-8 flex-wrap"
            >
              {['BMW', 'Audi', 'Mercedes', 'Range Rover', 'Porsche'].map((brand, i) => (
                <motion.span
                  key={brand}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.4, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                  className="text-sm font-display font-bold tracking-widest text-white cursor-default transition-all"
                >
                  {brand}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Premium Hero Visual with Parallax Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* Main Image Card with Gradient Border */}
            <motion.div
              style={{ y: y2 }}
              className="relative z-10 clip-angular-xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-white/5 to-transparent p-1"
            >
              <div className="clip-angular-lg overflow-hidden relative group">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200"
                  alt="Premium Car Key Service"
                  className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-600/20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* Floating Premium Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="absolute top-12 -left-12 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 clip-angular-md shadow-2xl max-w-[240px] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 clip-angular-sm flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                </div>
                <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Verified</span>
              </div>
              <p className="text-sm font-bold mb-1">Lightning Response</p>
              <p className="text-xs text-white/60">On-site key coding within 45 minutes.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="absolute bottom-12 -right-12 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 clip-angular-md shadow-2xl max-w-[260px] border border-white/10"
            >
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm font-bold mb-2">Premium Support</p>
              <p className="text-xs text-white/60 italic">"Saved my holiday when I lost my Porsche keys. Professional service!"</p>
              <p className="text-[10px] text-white/40 mt-2 font-bold">— Jean-Marc, Paris</p>
            </motion.div>

            {/* Glowing Orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-[100px] clip-angular-sm -z-10" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-[100px] clip-angular-sm -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Premium Stats Section */}
      <section className="py-32 px-6 sm:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                key={stat.label}
                className="relative group"
              >
                {/* Card with Gradient Border */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-8 clip-angular-md border border-white/10 hover:border-white/20 transition-all duration-300">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                    className="w-12 h-12 mx-auto mb-6 bg-gradient-to-br from-[#FF6B2C]/20 to-[#FF8C4D]/20 clip-angular-sm flex items-center justify-center border border-[#FF6B2C]/20"
                  >
                    <stat.icon className="w-6 h-6 text-[#FF6B2C]" />
                  </motion.div>

                  {/* Value */}
                  <h3 className="text-4xl md:text-5xl font-display font-black mb-3 text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {stat.value}
                  </h3>

                  {/* Label */}
                  <p className="text-xs text-white/50 font-bold tracking-widest uppercase text-center">
                    {stat.label}
                  </p>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B2C]/0 to-[#FF8C4D]/0 group-hover:from-[#FF6B2C]/10 group-hover:to-[#FF8C4D]/10 clip-angular-md transition-all duration-300 -z-10" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Services Grid */}
      <section className="py-32 px-6 sm:px-12 relative" id="services">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 clip-angular-sm bg-gradient-to-r from-[#FF6B2C]/10 to-[#FF8C4D]/10 border border-[#FF6B2C]/20 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-xl"
              >
                <Zap className="w-3.5 h-3.5 text-[#FF6B2C]" />
                <span className="text-[#FF6B2C]">
                  Our Expertise
                </span>
              </motion.div>

              <h2 className="text-5xl md:text-7xl font-display font-black mb-6 leading-[1.1]">
                <span className="block text-white">Premium Solutions</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B2C] to-[#FF8C4D] text-glow-strong">
                  For Your Vehicle
                </span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                We use the latest European diagnostic tools and authentic components to ensure your car's electronics remain <span className="text-white font-bold">factory-standard</span>.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                to="/services"
                className="group inline-flex items-center gap-3 px-8 py-4 clip-angular-sm bg-gradient-to-r from-white/5 to-white/10 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all font-bold"
              >
                <span className="text-white">See All Services</span>
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Premium Service Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.02 }}
                key={service.title}
                className="group relative"
              >
                {/* Card */}
                <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 p-8 clip-angular-lg border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
                  {/* Gradient Overlay on Hover */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 clip-angular-lg",
                    service.gradient
                  )} />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                  >
                    <div className={cn(
                      "w-20 h-20 clip-angular-md bg-gradient-to-br mb-8 flex items-center justify-center text-white shadow-2xl",
                      service.gradient
                    )}>
                      <service.icon className="w-10 h-10" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-display font-bold mb-4 text-white relative z-10">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 leading-relaxed mb-6 relative z-10 text-sm">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-8 relative z-10">
                    {service.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 + i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2 text-xs text-white/50"
                      >
                        <div className="w-1 h-1 clip-angular-sm bg-gradient-to-r from-cyan-400 to-blue-400" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to={`/services#${service.title.toLowerCase()}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6B2C] transition-all relative z-10 group-hover:text-[#FF8C4D]"
                  >
                    Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Automotive CTA Section */}
      <section className="py-32 px-6 sm:px-12 relative">
        <div className="max-w-6xl mx-auto relative">
          {/* Automotive Card with Orange Border */}
          <div className="relative p-1 rounded-[56px] bg-gradient-to-br from-[#FF6B2C]/20 to-[#FF8C4D]/20">
            <div className="relative overflow-hidden rounded-[52px] bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] p-12 md:p-20 text-center border border-white/10">
              {/* Advanced Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />
              </div>

              {/* Animated Orange Orbs */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#FF6B2C]/20 to-[#FF8C4D]/20 blur-[100px] clip-angular-sm"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-brand-red/15 to-[#FF6B2C]/20 blur-[100px] clip-angular-sm"
              />

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 clip-angular-sm bg-gradient-to-r from-[#FF6B2C]/10 to-[#FF8C4D]/10 border border-[#FF6B2C]/20 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-xl"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#FF6B2C]" />
                  <span className="text-[#FF6B2C]">
                    24/7 Emergency Service
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-display font-black mb-6 leading-[1.1]"
                >
                  <span className="block text-white">Locked out or need</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B2C] to-[#FF8C4D] text-glow-strong">
                    urgent assistance?
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
                >
                  Our priority mobile units are dispatching <span className="text-[#FF6B2C] font-bold">24/7</span>. Average response time in central areas is under <span className="text-white font-bold">30 minutes</span>.
                </motion.p>

                {/* Premium CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                  {/* Primary CTA - Automotive Orange */}
                  <motion.a
                    href="tel:+1234567890"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-glow-orange opacity-50 group-hover:opacity-100 transition-opacity clip-angular-sm" />
                    <div className="relative px-10 py-5 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C4D] text-white clip-angular-sm font-black text-xl flex items-center justify-center gap-3 shadow-2xl">
                      <PhoneCall className="w-6 h-6" />
                      <span>CALL NOW</span>
                    </div>
                  </motion.a>

                  {/* Secondary CTA */}
                  <Link
                    to="/contact"
                    className="group w-full sm:w-auto px-10 py-5 backdrop-blur-xl bg-white/5 border border-[#FF6B2C]/30 text-white clip-angular-sm font-bold text-xl hover:bg-white/10 hover:border-[#FF6B2C]/50 transition-all flex items-center justify-center gap-3"
                  >
                    Contact Support
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
