/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Send, 
  Settings, 
  Mail, 
  User, 
  Lock, 
  Globe, 
  Hash, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Type,
  Bold,
  Italic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SMTPConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
  fromName: string;
  secure: boolean;
}

interface EmailData {
  to: string;
  subject: string;
  text: string;
}

export default function App() {
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    host: '',
    port: '587',
    user: '',
    pass: '',
    fromName: 'Pro Sender',
    secure: false
  });

  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    text: ''
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState<{ success: number, failed: number, errors: string[] } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'compose'>('config');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });

  const SPAM_KEYWORDS = [
    'free', 'win', 'winner', 'cash', 'prize', 'urgent', 'guaranteed', 
    'no cost', 'money back', 'act now', 'limited time', 'viagra', 
    'casino', 'lottery', 'earn money', 'make money', 'investment',
    'bitcoin', 'crypto', 'congratulations', 'claim now'
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse recipients
    const recipients = emailData.to.split(/[\n,]+/).map(r => r.trim()).filter(r => r !== '');
    
    if (recipients.length === 0) {
      setStatus('error');
      setErrorMessage('Please enter at least one recipient email.');
      return;
    }

    if (recipients.length > 1000) {
      setStatus('error');
      setErrorMessage('Maximum limit of 1000 recipients exceeded.');
      return;
    }

    // Check for spammy keywords in subject
    const subjectLower = emailData.subject.toLowerCase();
    const foundSpam = SPAM_KEYWORDS.find(keyword => subjectLower.includes(keyword));
    
    if (foundSpam) {
      setStatus('error');
      setErrorMessage(`Spam Alert: Your subject contains the restricted keyword "${foundSpam}". Please remove it to improve deliverability.`);
      return;
    }

    setStatus('sending');
    setErrorMessage('');
    setSummary(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          smtpConfig, 
          emailData: { ...emailData, to: recipients } 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setSummary(result.summary);
        // Reset email data but keep SMTP config
        setEmailData({ to: '', subject: '', text: '' });
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to send emails');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection.');
    }
  };

  const insertLink = () => {
    if (!linkData.text || !linkData.url) return;
    const formattedUrl = linkData.url.startsWith('http') ? linkData.url : `https://${linkData.url}`;
    const linkHtml = `<a href="${formattedUrl}" style="color: #2563eb; text-decoration: underline;">${linkData.text}</a>`;
    setEmailData({ ...emailData, text: emailData.text + ' ' + linkHtml });
    setLinkData({ text: '', url: '' });
    setShowLinkDialog(false);
  };

  const insertFormat = (tag: string) => {
    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;
    setEmailData({ ...emailData, text: emailData.text + openTag + ' ' + closeTag });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Pro Email Sender</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'config' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Configuration
            </button>
            <button 
              onClick={() => setActiveTab('compose')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'compose' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Compose
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {activeTab === 'config' ? (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">SMTP Configuration</h2>
                    <p className="text-gray-500">Set up your outgoing mail server details. Use a reputable provider for better deliverability.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> SMTP Host
                      </label>
                      <input 
                        type="text" 
                        placeholder="smtp.gmail.com"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={smtpConfig.host}
                        onChange={e => setSmtpConfig({...smtpConfig, host: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Hash className="w-3 h-3" /> Port
                      </label>
                      <input 
                        type="text" 
                        placeholder="587"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={smtpConfig.port}
                        onChange={e => setSmtpConfig({...smtpConfig, port: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <User className="w-3 h-3" /> Username / Email
                      </label>
                      <input 
                        type="email" 
                        placeholder="user@example.com"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={smtpConfig.user}
                        onChange={e => setSmtpConfig({...smtpConfig, user: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Password / App Key
                      </label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••••••"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-12"
                          value={smtpConfig.pass}
                          onChange={e => setSmtpConfig({...smtpConfig, pass: e.target.value})}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Settings className="w-3 h-3" /> Sender Name
                      </label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={smtpConfig.fromName}
                        onChange={e => setSmtpConfig({...smtpConfig, fromName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={smtpConfig.secure}
                            onChange={e => setSmtpConfig({...smtpConfig, secure: e.target.checked})}
                          />
                          <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          Secure Connection (SSL/TLS) - Required for Port 465
                        </span>
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">Leave unchecked for Port 587 (STARTTLS) or Port 25.</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => setActiveTab('compose')}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                      Next: Compose Email <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="compose"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Compose Email</h2>
                    <p className="text-gray-500">Draft your message. HTML is supported automatically.</p>
                  </div>

                  <form onSubmit={handleSend} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Recipients (Comma or Newline separated, max 1000)
                      </label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="email1@example.com, email2@example.com..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                        value={emailData.to}
                        onChange={e => setEmailData({...emailData, to: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        Subject
                      </label>
                      <input 
                        required
                        type="text" 
                        placeholder="Important Update"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={emailData.subject}
                        onChange={e => setEmailData({...emailData, subject: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                          Message Body
                        </label>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => insertFormat('b')}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                            title="Bold"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => insertFormat('i')}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                            title="Italic"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setShowLinkDialog(!showLinkDialog)}
                            className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${showLinkDialog ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                            title="Insert Link"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showLinkDialog && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-3 flex flex-col sm:flex-row gap-3 items-end">
                              <div className="flex-1 space-y-1 w-full">
                                <label className="text-[10px] font-bold text-blue-600 uppercase">Display Text</label>
                                <input 
                                  type="text" 
                                  placeholder="Click here"
                                  className="w-full px-3 py-1.5 text-sm bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                  value={linkData.text}
                                  onChange={e => setLinkData({...linkData, text: e.target.value})}
                                />
                              </div>
                              <div className="flex-1 space-y-1 w-full">
                                <label className="text-[10px] font-bold text-blue-600 uppercase">URL</label>
                                <input 
                                  type="text" 
                                  placeholder="example.com"
                                  className="w-full px-3 py-1.5 text-sm bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                  value={linkData.url}
                                  onChange={e => setLinkData({...linkData, url: e.target.value})}
                                />
                              </div>
                              <button 
                                type="button"
                                onClick={insertLink}
                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
                              >
                                Add
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <textarea 
                        required
                        rows={8}
                        placeholder="Hello, this is a test email..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                        value={emailData.text}
                        onChange={e => setEmailData({...emailData, text: e.target.value})}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        type="submit"
                        disabled={status === 'sending'}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {status === 'sending' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Sending Bulk...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" /> Send Emails
                          </>
                        )}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveTab('config')}
                        className="px-6 py-4 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Status & Tips */}
          <div className="lg:col-span-5 space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Delivery Status</h3>
              
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Mail className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">Ready to send. Configure your SMTP and compose a message.</p>
                  </motion.div>
                )}

                {status === 'sending' && (
                  <motion.div 
                    key="sending"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                    <p className="text-blue-600 font-medium">Processing Bulk Send...</p>
                    <p className="text-gray-400 text-xs mt-1">Sending emails with a 12-15s delay between each to prevent spam flagging.</p>
                  </motion.div>
                )}

                {status === 'success' && summary && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="text-emerald-600 font-bold">Bulk Send Complete!</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-emerald-50 p-3 rounded-xl text-center">
                        <p className="text-xs text-emerald-600 font-bold uppercase">Success</p>
                        <p className="text-2xl font-bold text-emerald-700">{summary.success}</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-xl text-center">
                        <p className="text-xs text-red-600 font-bold uppercase">Failed</p>
                        <p className="text-2xl font-bold text-red-700">{summary.failed}</p>
                      </div>
                    </div>

                    {summary.errors.length > 0 && (
                      <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Error Log</p>
                        <ul className="space-y-1">
                          {summary.errors.map((err, i) => (
                            <li key={i} className="text-[10px] text-red-500 font-mono break-all">{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button 
                      onClick={() => setStatus('idle')}
                      className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-all"
                    >
                      Dismiss Summary
                    </button>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-red-600 font-bold">Failed to Send</p>
                    <p className="text-gray-500 text-xs mt-2 px-4 line-clamp-3">{errorMessage}</p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="mt-4 text-xs font-bold text-red-600 hover:underline"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Deliverability Tips */}
            <div className="bg-[#1A1A1A] text-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Inbox Tips</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold">01</span>
                  </div>
                  <p className="text-sm text-gray-300">Use <span className="text-white font-medium">App Passwords</span> for Gmail instead of your main password.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold">02</span>
                  </div>
                  <p className="text-sm text-gray-300">Reputable providers like <span className="text-white font-medium">SendGrid</span> or <span className="text-white font-medium">Amazon SES</span> ensure better inboxing.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold">03</span>
                  </div>
                  <p className="text-sm text-gray-300">Automatic <span className="text-white font-medium">12-15s delay</span> between sends helps bypass spam filters.</p>
                </li>
              </ul>
            </div>

            {/* Common Settings */}
            <div className="p-6 border border-dashed border-gray-300 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Presets</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Gmail', host: 'smtp.gmail.com', port: '587', secure: false },
                  { name: 'Outlook', host: 'smtp.office365.com', port: '587', secure: false },
                  { name: 'SendGrid', host: 'smtp.sendgrid.net', port: '587', secure: false },
                  { name: 'Zoho', host: 'smtp.zoho.com', port: '465', secure: true },
                  { name: 'Private Email', host: 'mail.privateemail.com', port: '465', secure: true },
                  { name: 'cPanel/Webmail', host: 'mail.yourdomain.com', port: '465', secure: true }
                ].map(preset => (
                  <button 
                    key={preset.name}
                    onClick={() => setSmtpConfig({...smtpConfig, host: preset.host, port: preset.port, secure: preset.secure})}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:border-blue-500 hover:text-blue-600 transition-all"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
