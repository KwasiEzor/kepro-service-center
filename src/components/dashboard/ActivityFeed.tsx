import React from 'react';
import { FileText, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface Activity {
  type: 'QUOTE' | 'CONTACT' | 'INVOICE';
  id: string;
  title: string;
  user: string;
  date: string;
  status: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold uppercase tracking-widest text-text-tertiary">Recent Activity</h2>
      <div className="card-dark p-6 space-y-6">
        {activities.map((activity, idx) => (
          <div key={`${activity.type}-${activity.id}-${idx}`} className="flex gap-4 group">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
              activity.type === 'QUOTE' && "bg-brand-red/10 text-brand-red",
              activity.type === 'CONTACT' && "bg-blue-500/10 text-blue-500",
              activity.type === 'INVOICE' && "bg-green-500/10 text-green-500"
            )}>
              {activity.type === 'QUOTE' && <FileText className="w-5 h-5" />}
              {activity.type === 'CONTACT' && <MessageSquare className="w-5 h-5" />}
              {activity.type === 'INVOICE' && <FileText className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="font-bold text-sm text-text-primary truncate">{activity.title}</p>
                <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                  {format(new Date(activity.date), 'HH:mm')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                 <p className="text-xs text-text-secondary truncate">{activity.user}</p>
                 <span className={cn(
                   "text-[9px] font-black tracking-tighter uppercase px-1.5 py-0.5 rounded",
                   activity.status === 'PAID' || activity.status === 'APPROVED' ? "bg-green-500/10 text-green-500" : "bg-bg-secondary text-text-tertiary"
                 )}>
                   {activity.status}
                 </span>
              </div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-text-tertiary italic text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
};
