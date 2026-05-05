import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ChatBot from './ChatBot';

export default function Layout() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen gradient-bg selection:bg-brand-red selection:text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="py-20 px-6 sm:px-12 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center p-1.5">
                <div className="w-full h-full bg-white/20 rounded-sm" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">KEYPRO</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Premium automotive technology specialist based in France. Certified mobile intervention experts.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Services</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-brand-red transition-colors">Car Key Programming</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Diagnostic Scans</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">ECU Remapping</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Emergency Lockout</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-brand-red transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Our Service Area</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-brand-red rounded-full" />
                Emergency: 01 23 45 67 89
              </li>
              <li>contact@keypro.service</li>
              <li>Mon - Sat / 08:00 - 20:00</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-white/20">
          <p>© 2025 KEYPRO SERVICE CENTER. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#">INSTAGRAM</a>
            <a href="#">FACEBOOK</a>
            <a href="#">LINKEDIN</a>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
