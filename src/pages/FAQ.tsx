import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Search, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const faqs = [
  {
    question: "Do you come to my location if I've lost all my keys?",
    answer: "Yes, we are a fully mobile service. We can travel to your home, workplace, or the roadside. We have all the necessary equipment in our vans to cut and program a brand new key from scratch on-site."
  },
  {
    question: "Which car brands do you support?",
    answer: "We specialize in premium European brands including BMW, Mercedes-Benz, Audi, Volkswagen, Porsche, and Land Rover. However, we also support most major manufacturers like Peugeot, Renault, Ford, and various Japanese brands."
  },
  {
    question: "How long does a diagnostic scan take?",
    answer: "A standard full system scan typically takes between 30 to 45 minutes. This includes a complete report of all electronic modules, clearing of intermittent fault codes, and a professional consultation on any existing issues."
  },
  {
    question: "Are your keys and modules original parts?",
    answer: "We offer both OEM (Original Equipment Manufacturer) and high-quality aftermarket alternatives. All our parts are strictly tested and come with a technical warranty to match or exceed factory standards."
  },
  {
    question: "Can you fix immobilizer issues that the dealer says require a full ECU replacement?",
    answer: "Often, yes. Many immobilizer faults are software-based synchronization errors. While dealers prefer to replace entire modules, we have the binary tools to repair the data inside the modules, potentially saving you thousands."
  },
  {
    question: "What information do I need to provide for a quote?",
    answer: "To give an accurate quote, we need the vehicle make, model, year, and its VIN (Vehicle Identification Number) if possible. For key issues, please specify if it's a backup key or if all keys are lost."
  }
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20">
      <section className="px-6 sm:px-12 max-w-4xl mx-auto text-center mb-16">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-20 h-20 bg-brand-red rounded-3xl flex items-center justify-center mx-auto mb-8 bg-glow-red"
        >
          <HelpCircle className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Got <span className="text-white/30">Questions?</span></h1>
        <p className="text-white/60 text-lg mb-10">Everything you need to know about our specialized automotive technical services.</p>
        
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search our knowledge base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass bg-white/5 border-white/10 rounded-full py-4 px-12 focus:outline-none focus:border-brand-red focus:bg-white/10 transition-all text-white placeholder:text-white/20"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
        </div>
      </section>

      <section className="px-6 sm:px-12 max-w-3xl mx-auto">
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx}
              className="glass border-white/5 rounded-[30px] overflow-hidden transition-all duration-300 hover:border-white/10"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className={cn(
                  "text-lg font-bold transition-colors",
                  openIndex === idx ? "text-brand-red" : "text-white group-hover:text-white/80"
                )}>
                  {faq.question}
                </span>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  openIndex === idx ? "bg-brand-red rotate-180" : "bg-white/5"
                )}>
                  {openIndex === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 text-white/50 leading-relaxed text-sm">
                      <div className="pt-4 border-t border-white/5">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <p className="text-lg italic">No matching questions found. Try a different search term.</p>
            </div>
          )}
        </div>

        {/* Still have questions? */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-10 glass rounded-[40px] text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-white/40 mb-8 max-w-md mx-auto">If you couldn't find the answer you were looking for, feel free to contact our expert team directly.</p>
          <button className="bg-white text-brand-blue px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
            Contact Support
          </button>
        </motion.div>
      </section>
    </div>
  );
}
