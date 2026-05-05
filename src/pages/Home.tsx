import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
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
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const services = [
  {
    title: "Car Key Specialist",
    description: "Lost all keys? We can program and cut new keys on-site for almost any vehicle model.",
    icon: Key,
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Full Diagnostics",
    description: "Deep binary scans of your vehicle electronics using dealer-level specialized equipment.",
    icon: Cpu,
    color: "from-purple-500 to-pink-600"
  },
  {
    title: "Immobilizer Repairs",
    description: "Fixing ECU synchronization issues and complex immobilizer system failures.",
    icon: Settings,
    color: "from-orange-500 to-red-600"
  }
];

const stats = [
  { label: "Successful Services", value: "12k+" },
  { label: "Expert Technicians", value: "24" },
  { label: "Response Time", value: "30min" },
  { label: "Client Rating", value: "4.9/5" }
];

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]);

  return (
    <div className="relative overflow-hidden pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-10 px-6 sm:px-12">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            style={{ y: y1 }}
            className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] bg-brand-blue/20 blur-[120px] rounded-full"
          />
          <motion.div 
            style={{ y: -y1 }}
            className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-brand-red/10 blur-[120px] rounded-full"
          />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-xs font-bold tracking-widest uppercase text-brand-red mb-8"
            >
              <span className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
              Available 24/7 in your area
            </motion.div>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
              Technicien <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">Auto Mobile</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Clés, Diagnostic, Programmation. Solution technique haut de gamme directement chez vous ou sur votre lieu de travail.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/quote"
                className="group relative px-8 py-4 bg-brand-red rounded-full font-bold text-lg overflow-hidden bg-glow-red transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  Request Service <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to="/services"
                className="group px-8 py-4 glass hover:bg-white/10 rounded-full font-bold text-lg transition-all"
              >
                Explore Services
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
              {['BMW', 'Audi', 'Mercedes', 'Range Rover', 'Porsche'].map((brand) => (
                <span key={brand} className="text-sm font-display font-bold tracking-widest">{brand}</span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200" 
                alt="Premium Car Key Service"
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/80 via-transparent to-transparent" />
              
              {/* Floating Glass Cards */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-12 -left-12 glass p-6 rounded-3xl shadow-xl max-w-[200px]"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="text-green-500 w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white/50">MOBILE EXPERT</span>
                </div>
                <p className="text-sm font-medium">On-site key coding within 45 minutes.</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 -right-12 glass p-6 rounded-3xl shadow-xl max-w-[220px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-brand-red text-brand-red" />)}
                </div>
                <p className="text-sm font-bold mb-1">Excellent Support</p>
                <p className="text-xs text-white/50">"Saved my holiday when I lost my Porsche keys."</p>
              </motion.div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-red/20 blur-[100px] -z-10 rounded-full scale-150" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 sm:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                key={stat.label}
                className="text-center group"
              >
                <h3 className="text-4xl md:text-5xl font-display font-bold mb-2 group-hover:text-brand-red transition-colors">
                  {stat.value}
                </h3>
                <p className="text-sm text-white/40 font-bold tracking-widest uppercase">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 px-6 sm:px-12 bg-white/5" id="services">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                Premium Solutions <br />
                <span className="text-white/40">For Your Vehicle</span>
              </h2>
              <p className="text-white/60 text-lg">
                We use the latest European diagnostic tools and authentic components to ensure your car's electronics remain factory-standard.
              </p>
            </div>
            <Link to="/services" className="group flex items-center gap-4 text-brand-red font-bold uppercase tracking-widest border-b border-brand-red/20 pb-2 hover:border-brand-red transition-all">
              See All Services <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                key={service.title}
                className="group glass p-10 rounded-[40px] hover:bg-white/10 transition-all duration-500"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl bg-gradient-to-br mb-8 flex items-center justify-center text-white",
                  service.color
                )}>
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-white/50 leading-relaxed mb-8">
                  {service.description}
                </p>
                <Link to={`/services#${service.title.toLowerCase()}`} className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-brand-red transition-all">
                  Read More <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[50px] bg-brand-blue p-12 md:p-20 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150" />
          
          <h2 className="relative z-10 text-4xl md:text-6xl font-display font-bold mb-8">
            Locked out or need <br />
            urgent assistance?
          </h2>
          <p className="relative z-10 text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Our priority mobile units are dispatching 24/7. Average response time in central areas is under 30 minutes.
          </p>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="tel:+1234567890"
              className="w-full sm:w-auto px-10 py-5 bg-white text-brand-blue rounded-full font-black text-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <PhoneCall className="w-6 h-6" /> CALL NOW
            </a>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-10 py-5 glass border-white/20 text-white rounded-full font-bold text-xl hover:bg-white/10 transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
