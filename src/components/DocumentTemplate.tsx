import React from 'react';
import { Quote, Contact } from '../types';
import { format } from 'date-fns';
import { 
  ShieldCheck, 
  Car, 
  Key, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText,
  Zap,
  Info
} from 'lucide-react';

interface DocumentTemplateProps {
  type: 'quote' | 'contact';
  data: Quote | Contact;
  refId?: string;
}

export default function DocumentTemplate({ type, data, refId }: DocumentTemplateProps) {
  const isQuote = type === 'quote';
  const quoteData = data as Quote;
  const contactData = data as Contact;

  return (
    <div className="bg-white text-slate-900 p-8 md:p-12 shadow-2xl rounded-sm border border-slate-200 max-w-4xl mx-auto font-sans print:shadow-none print:border-none print:p-0" id="document-template">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 border-b border-slate-100 pb-12">
        <div>
          <div className="text-3xl font-black tracking-tighter text-slate-900 mb-2">
            KEYPRO<span className="text-orange-600">SERVICE</span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Professional Automotive Solutions</p>
          <div className="mt-6 space-y-1 text-sm text-slate-600">
            <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-orange-600" /> Industrial Zone, Building A, Paris</p>
            <p className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-orange-600" /> support@keypro-service.com</p>
            <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-orange-600" /> +33 (0) 1 23 45 67 89</p>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <div className="bg-slate-900 text-white px-6 py-2 rounded-sm text-xs font-black uppercase tracking-widest mb-4">
            {isQuote ? 'Service Quote Request' : 'Contact Inquiry'}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Reference</p>
            <p className="text-xl font-mono font-bold text-slate-900">
              #{refId || (isQuote ? quoteData.id.slice(-8).toUpperCase() : contactData.id.slice(-8).toUpperCase())}
            </p>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Issued On</p>
            <p className="text-sm font-bold text-slate-700">
              {format(new Date(data.createdAt), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {/* Customer Info */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Customer Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Full Name</p>
              <p className="text-base font-bold text-slate-900">{data.name || 'Anonymous User'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Contact Information</p>
              <p className="text-sm text-slate-700 font-medium">{data.email}</p>
              {data.phone && <p className="text-sm text-slate-700 font-medium">{data.phone}</p>}
            </div>
          </div>
        </div>

        {/* Vehicle/Inquiry Info */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">
            {isQuote ? 'Vehicle Specifications' : 'Inquiry Category'}
          </h3>
          <div className="space-y-4">
            {isQuote ? (
              <>
                <div className="flex gap-8">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Brand & Model</p>
                    <p className="text-base font-bold text-slate-900">{quoteData.brand} {quoteData.model}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Year</p>
                    <p className="text-base font-bold text-slate-900">{quoteData.year}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Service Type</p>
                  <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider">
                    <Key className="w-3 h-3" /> {quoteData.serviceType}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Subject</p>
                <p className="text-base font-bold text-slate-900">{contactData.subject}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description / Message */}
      <div className="mb-12">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2 mb-6">
          {isQuote ? 'Service Description & Requirements' : 'Message Content'}
        </h3>
        <div className="bg-slate-50 p-6 rounded-sm border-l-4 border-orange-600 italic text-slate-700 text-sm leading-relaxed">
          "{isQuote ? quoteData.description : contactData.message}"
        </div>
      </div>

      {/* Quote Specific Details */}
      {isQuote && quoteData.status === 'APPROVED' && (
        <div className="mb-12 p-8 bg-slate-900 text-white rounded-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Approved Estimation</h3>
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Estimated Total Price</p>
              <p className="text-4xl font-black">€{quoteData.estimatedPrice}</p>
              <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">* Subject to final verification</p>
            </div>
            {quoteData.adminNotes && (
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Technician Notes</p>
                <p className="text-sm text-slate-300 italic">"{quoteData.adminNotes}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer / Terms */}
      <div className="border-t border-slate-100 pt-8 mt-12 grid md:grid-cols-3 gap-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        <div className="flex gap-3">
          <ShieldCheck className="w-4 h-4 text-slate-300" />
          <p>Certified<br />Authenticity</p>
        </div>
        <div className="flex gap-3">
          <Clock className="w-4 h-4 text-slate-300" />
          <p>24h Support<br />Guarantee</p>
        </div>
        <div className="flex gap-3">
          <FileText className="w-4 h-4 text-slate-300" />
          <p>Official Service<br />Record</p>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[9px] text-slate-300 uppercase tracking-[0.2em]">Generated via KeyPro Service Center Secure Portal • {new Date().toISOString()}</p>
      </div>
    </div>
  );
}
