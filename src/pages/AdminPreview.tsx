import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Map, 
  Users, 
  Calendar, 
  Search, 
  Bell, 
  Settings, 
  MoreVertical,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

const jobs = [
  { id: 'JOB-482', client: 'Marc B.', vehicle: 'Audi A4 (2021)', service: 'Lost All Keys', status: 'Priority', time: '14:30' },
  { id: 'JOB-483', client: 'Sarah L.', vehicle: 'BMW X5 (2023)', service: 'Full Diag', status: 'In Progress', time: '15:15' },
  { id: 'JOB-484', client: 'David K.', vehicle: 'Porsche 911', service: 'ECU Coding', status: 'Waiting', time: '16:00' },
];

export default function AdminPreview() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      {/* Sidebar */}
      <div className="w-64 glass border-r border-border-secondary flex flex-col p-6 gap-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-brand-red rounded-lg" />
          <span className="font-display font-bold tracking-tight uppercase text-xs">Technical Portal</span>
        </div>
        
        <nav className="flex-1 space-y-2">
           {[
             { icon: BarChart3, label: "Analytics", active: true },
             { icon: Map, label: "Live Fleet" },
             { icon: Calendar, label: "Schedule" },
             { icon: Users, label: "Clients" },
             { icon: Bell, label: "Alerts" }
           ].map(item => (
             <button key={item.label} className={cn(
               "w-full flex items-center gap-4 px-4 py-3 clip-angular-sm text-sm font-bold transition-all",
               item.active ? "bg-bg-secondary text-text-primary" : "text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
             )}>
               <item.icon className="w-5 h-5" />
               {item.label}
             </button>
           ))}
        </nav>
        
        <div className="p-4 glass clip-angular-sm border-border-secondary">
           <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-3">System Health</p>
           <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 bg-green-500 clip-angular-sm animate-pulse" />
             <span className="text-xs font-bold">Relay Node Online</span>
           </div>
           <div className="w-full h-1.5 bg-bg-secondary clip-angular-sm overflow-hidden">
             <div className="w-3/4 h-full bg-brand-red" />
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Technician Dashboard</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Analyzing 12 active mobile units across the region.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search job ID..."
                className="glass clip-angular-sm py-3 px-12 focus:outline-none focus:border-brand-red transition-all text-xs"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-secondary)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div className="w-10 h-10 glass clip-angular-sm flex items-center justify-center relative">
               <Bell className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
               <span className="absolute top-0 right-0 w-3 h-3 bg-brand-red clip-angular-sm border-2 border-brand-blue" />
            </div>
            <div className="w-10 h-10 clip-angular-sm overflow-hidden border-2 border-border-primary">
               <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
            </div>
          </div>
        </header>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           {[
             { label: "Revenue Daily", value: "€4,820", trend: "+12.5%", icon: BarChart3 },
             { label: "Active Jobs", value: "28", trend: "+4 this hr", icon: Clock },
             { label: "Response Time", value: "24m", trend: "-2m", icon: Zap }
           ].map(stat => (
             <div key={stat.label} className="glass p-8 rounded-[35px] border-border-secondary relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <stat.icon className="w-16 h-16" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-tertiary)' }}>{stat.label}</p>
                <h3 className="text-3xl font-display font-bold mb-4">{stat.value}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-green-500">
                   <ArrowUpRight className="w-4 h-4" /> {stat.trend}
                </div>
             </div>
           ))}
        </div>

        {/* Jobs List */}
        <div className="glass clip-angular-lg border-border-secondary overflow-hidden">
           <div className="p-8 border-b border-border-secondary flex items-center justify-between">
              <h2 className="text-xl font-bold">Priority Dispatches</h2>
              <button className="text-xs font-bold uppercase tracking-widest text-brand-red">View Dispatch Map</button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-tertiary)', opacity: 0.7 }}>
                   <th className="px-8 py-6">Reference</th>
                   <th className="px-8 py-6">Client</th>
                   <th className="px-8 py-6">Vehicle</th>
                   <th className="px-8 py-6">Service</th>
                   <th className="px-8 py-6">Status</th>
                   <th className="px-8 py-6">Time</th>
                   <th className="px-8 py-6"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {jobs.map(job => (
                    <tr key={job.id} className="text-sm hover:bg-white/[0.02] transition-colors group">
                       <td className="px-8 py-6 font-mono text-xs">{job.id}</td>
                       <td className="px-8 py-6 font-bold">{job.client}</td>
                       <td className="px-8 py-6" style={{ color: 'var(--color-text-tertiary)' }}>{job.vehicle}</td>
                       <td className="px-8 py-6">
                         <span className="px-3 py-1 bg-bg-secondary clip-angular-sm text-[10px] font-bold border border-border-primary uppercase tracking-widest">
                           {job.service}
                         </span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <div className={cn(
                               "w-2 h-2 clip-angular-sm shadow-[0_0_10px]",
                               job.status === 'Priority' ? "bg-red-500 shadow-red-500" : 
                               job.status === 'In Progress' ? "bg-blue-500 shadow-blue-500" : "bg-orange-500 shadow-orange-500"
                             )} />
                             <span className="font-bold text-xs">{job.status}</span>
                          </div>
                       </td>
                       <td className="px-8 py-6" style={{ color: 'var(--color-text-tertiary)' }}>{job.time}</td>
                       <td className="px-8 py-6">
                         <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-bg-secondary rounded-lg">
                           <MoreVertical className="w-4 h-4" />
                         </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}

