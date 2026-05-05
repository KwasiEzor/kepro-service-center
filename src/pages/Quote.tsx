import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Key, 
  Settings, 
  Cpu, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail,
  Zap,
  Lock,
  ShieldCheck,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

type Step = 'service' | 'vehicle' | 'details' | 'success';

const serviceOptions = [
  { id: 'keys', label: 'Car Key Specialist', icon: Key, description: 'Lost keys, spare keys, or remote repair' },
  { id: 'diagnostic', label: 'Full Diagnostics', icon: Cpu, description: 'ECU scans, sensor check, or performance logging' },
  { id: 'immobilizer', label: 'Immobilizer Repair', icon: Settings, description: 'ECU replacement or sync issues' },
  { id: 'other', label: 'Other Technical', icon: Zap, description: 'Module coding and specific electronic fixes' },
];

export default function Quote() {
  const [step, setStep] = React.useState<Step>('service');
  const [formData, setFormData] = React.useState({
    serviceType: '',
    brand: '',
    model: '',
    year: '',
    location: '',
    urgency: 'Standard',
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleNext = () => {
    if (step === 'service') setStep('vehicle');
    else if (step === 'vehicle') setStep('details');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  return (
    <div className="pt-32 pb-20 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Progress Header */}
        <div className="mb-12 text-center">
           <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold mb-4"
           >
            Request <span className="text-white/30">Service</span>
           </motion.h1>
           <p className="text-white/40 font-medium tracking-[0.2em] uppercase text-xs">Premium Mobile Technical Assistance</p>
        </div>

        {/* Step Indicator */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-4 mb-20">
            {['service', 'vehicle', 'details'].map((s, idx) => (
              <React.Fragment key={s}>
                <div className={cn(
                  "flex items-center gap-3 transition-all duration-500",
                  step === s ? "opacity-100 scale-110" : "opacity-30"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black",
                    step === s ? "border-brand-red bg-brand-red text-white" : "border-white/50 text-white/50"
                  )}>
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">{s}</span>
                </div>
                {idx < 2 && <div className="w-12 h-[1px] bg-white/10" />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="glass rounded-[40px] overflow-hidden border-white/5 shadow-2xl relative">
          <AnimatePresence mode="wait">
            {step === 'service' && (
              <motion.div
                key="step-service"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-display font-bold mb-4">What do you need help with?</h2>
                  <p className="text-white/40">Select the primary service required for your vehicle.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {serviceOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFormData({ ...formData, serviceType: opt.id })}
                      className={cn(
                        "flex items-start gap-6 p-8 rounded-3xl border-2 text-left transition-all group",
                        formData.serviceType === opt.id 
                          ? "border-brand-red bg-brand-red/10 bg-glow-red" 
                          : "border-white/5 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-xl",
                        formData.serviceType === opt.id ? "bg-brand-red text-white" : "bg-white/10 text-white/40"
                      )}>
                        <opt.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{opt.label}</h3>
                        <p className="text-xs text-white/40 leading-relaxed">{opt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-12 flex justify-end">
                  <button
                    disabled={!formData.serviceType}
                    onClick={handleNext}
                    className="flex items-center gap-3 px-10 py-4 bg-brand-red text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'vehicle' && (
              <motion.div
                key="step-vehicle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <button onClick={() => setStep('service')} className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors mb-8 uppercase tracking-widest">
                  <ChevronLeft className="w-4 h-4" /> Back to service
                </button>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-display font-bold mb-4">Vehicle Information</h2>
                  <p className="text-white/40">Provide the basic details of the vehicle requiring assistance.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. BMW, Audi, Mercedes"
                      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all"
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Model</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 Series, A4, G-Wagon"
                      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all"
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2021"
                      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all"
                      value={formData.year}
                      onChange={e => setFormData({...formData, year: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Location (City)</label>
                    <input
                      type="text"
                      placeholder="e.g. Paris, Lyon, Marseille"
                      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-12 flex justify-end">
                  <button
                    disabled={!formData.brand || !formData.model || !formData.year}
                    onClick={handleNext}
                    className="flex items-center gap-3 px-10 py-4 bg-brand-red text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    Final Step <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <button onClick={() => setStep('vehicle')} className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors mb-8 uppercase tracking-widest">
                  <ChevronLeft className="w-4 h-4" /> Back to vehicle
                </button>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-display font-bold mb-4">Personal Details</h2>
                  <p className="text-white/40">How should our technical team contact you?</p>
                </div>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Phone Number</label>
                    <input
                      required
                      type="tel"
                      placeholder="01 23 45 67 89"
                      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="john@example.com"
                      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Additional Information (Optional)</label>
                    <textarea
                      placeholder="Describe the issue in more detail..."
                      rows={4}
                      className="w-full glass bg-white/5 border-white/5 rounded-3xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all resize-none"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 mt-4">
                    <button
                      type="submit"
                      className="w-full py-5 bg-brand-red text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all bg-glow-red"
                    >
                      SEND REQUEST
                    </button>
                    <p className="text-[10px] text-white/20 text-center mt-6 uppercase tracking-widest leading-relaxed">
                      By submitting, you agree to our processing of your technical data for service purposes. <br />
                      Response time is usually within 15-30 minutes for urgent requests.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 md:p-20 text-center"
              >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Request Received</h2>
                <p className="text-xl text-white/60 mb-12 max-w-lg mx-auto">
                  Thank you, {formData.name}. Our technical supervisor has been notified. We will contact you via phone shortly to confirm the intervention.
                </p>
                <div className="glass p-8 rounded-3xl inline-block text-left mb-12 border-white/10">
                   <div className="flex items-center gap-3 mb-4 text-brand-red">
                     <Zap className="w-5 h-5 fill-brand-red" />
                     <span className="font-bold text-sm uppercase tracking-widest">Urgency Priority: High</span>
                   </div>
                   <div className="space-y-2 text-sm">
                     <p><span className="text-white/40">Ref ID:</span> <span className="font-mono">KP-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span></p>
                     <p><span className="text-white/40">Vehicle:</span> <span className="font-bold">{formData.brand} {formData.model}</span></p>
                   </div>
                </div>
                <div>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-10 py-4 glass border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-all"
                  >
                    Return Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating help hint */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="mt-12 flex items-center justify-center gap-6 text-[10px] text-white/40 font-bold uppercase tracking-[0.3em]"
        >
          <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Nationwide Service</div>
          <div className="flex items-center gap-2"><Lock className="w-3 h-3" /> Secure Data handling</div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Certified Technicians</div>
        </motion.div>
      </div>
    </div>
  );
}
