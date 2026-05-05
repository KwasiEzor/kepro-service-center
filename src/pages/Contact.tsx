import React from 'react';
import { motion } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send,
  ExternalLink,
  Instagram,
  Facebook,
  Linkedin
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Contact() {
  const [formState, setFormState] = React.useState('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 2000);
  };

  return (
    <div className="pt-32 pb-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">
              Let's Talk <br />
              <span className="text-white/30">Binary.</span>
            </h1>
            <p className="text-xl text-white/50 leading-relaxed mb-12 max-w-lg">
              Whether it's an emergency lockout or a complex ECU programming question, our specialists are ready to decode your problem.
            </p>

            <div className="space-y-8">
              {[
                { icon: Phone, label: "Emergency Hotline", value: "01 23 45 67 89", detail: "24/7 Rapid Response" },
                { icon: Mail, label: "Technical Support", value: "support@keypro.service", detail: "Reply within 4 hours" },
                { icon: MapPin, label: "Service Hub", value: "8 Rue de la Paix, Paris", detail: "Appointments Only" }
              ].map((item) => (
                <div key={item.label} className="flex gap-6 items-start group">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform shadow-xl">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{item.label}</p>
                    <p className="text-xl font-bold mb-1 text-white group-hover:text-brand-red transition-colors">{item.value}</p>
                    <p className="text-xs text-white/40">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex items-center gap-6">
              {[Instagram, Facebook, Linkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center text-white/40 hover:text-brand-red hover:border-brand-red transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass p-8 md:p-12 rounded-[40px] border-white/5 relative overflow-hidden group">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 blur-[100px] -z-10 group-hover:bg-brand-red/20 transition-colors duration-700" />
              
              <h2 className="text-3xl font-bold mb-8">Send a Message</h2>
              
              {formState === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent</h3>
                  <p className="text-white/50">One of our specialists will get back to you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">Your Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all text-sm"
                      placeholder="Jane Cooper"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all text-sm"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">Message Topic</label>
                    <select className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all text-sm appearance-none cursor-pointer">
                      <option className="bg-[#0A1F44]">General Inquiry</option>
                      <option className="bg-[#0A1F44]">Key Support</option>
                      <option className="bg-[#0A1F44]">B2B Partnerships</option>
                      <option className="bg-[#0A1F44]">Careers</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">How can we help?</label>
                    <textarea 
                      required
                      rows={5}
                      className="w-full glass bg-white/5 border-white/5 rounded-3xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all text-sm resize-none"
                      placeholder="Share some details about your problem..."
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="w-full py-5 bg-brand-red text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all bg-glow-red flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {formState === 'submitting' ? (
                      <>Processing <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /></>
                    ) : (
                      <>SEND MESSAGE <Send className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
