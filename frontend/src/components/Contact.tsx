import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Phone, MapPin, CheckCircle2, XCircle, Github, Linkedin, Copy, Check } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface ContactProps {
  darkMode: boolean;
  onShowToast: (msg: string) => void;
}

const Contact: React.FC<ContactProps> = ({ darkMode, onShowToast }) => {
  const [formData, setFormData] = useState({ name: '', email: '', intent: 'Full-Time Role', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const intents = ['Full-Time Role', 'Contract Project', 'Architecture Consulting', 'General Inquiry'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('durojaiyetoluwani@gmail.com');
    setCopiedEmail(true);
    onShowToast('Email address copied to clipboard');
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      emailjs.init('D-J_eJQjG9-qF6GBb');
      await emailjs.send('service_6ne6ui5', 'template_qrdyyvs', {
        from_name: formData.name,
        from_email: formData.email,
        message: `[Scope: ${formData.intent}]\n\n${formData.message}`,
        to_name: 'Toluwanimi Davis',
      });
      setSubmitStatus('success');
      onShowToast('Message delivered! Response guaranteed in 24h.');
      setFormData({ name: '', email: '', intent: 'Full-Time Role', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      onShowToast('Failed to send message. Please email me directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactLinks = [
    { icon: Mail, label: 'Email', value: 'durojaiyetoluwani@gmail.com', href: 'mailto:durojaiyetoluwani@gmail.com' },
    { icon: Phone, label: 'Phone', value: '+234 806 983 8501', href: 'tel:+2348069838501' },
    { icon: Linkedin, label: 'LinkedIn', value: 'durojaiye-toluwanimi', href: 'https://www.linkedin.com/in/durojaiye-toluwanimi-9272b3294/' },
    { icon: Github, label: 'GitHub', value: 'github.com/davistolu', href: 'https://github.com/davistolu' },
    { icon: MapPin, label: 'Location', value: 'Lagos · Dubai · Remote', href: '#' },
  ];

  return (
    <section id="contact" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 w-full relative z-10 font-sans">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Get In Touch
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight">
            Initiate Conversation
          </h2>
          <p className="text-sm opacity-60 mt-2 max-w-xl">
            Open for full-time frontend and full-stack engineering roles, ambitious contract deliveries, and technical advisory.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column: Coordinates */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Copy Card */}
            <div
              onClick={handleCopyEmail}
              className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 ${
                darkMode
                  ? 'bg-[#121215] border-white/[0.08] hover:border-white/20'
                  : 'bg-white border-black/[0.08] hover:border-black/20 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Direct Email</span>
                {copiedEmail ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Copied
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-mono opacity-50">
                    <Copy className="w-3.5 h-3.5" /> Click to copy
                  </span>
                )}
              </div>
              <p className="font-display font-bold text-lg text-zinc-100 break-all">
                durojaiyetoluwani@gmail.com
              </p>
              <p className="text-xs opacity-50 font-mono mt-2">
                Direct response within 24 hours.
              </p>
            </div>

            {/* Direct Links */}
            <div className={`p-6 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-[#121215] border-white/[0.08]' : 'bg-white border-black/[0.08]'
            }`}>
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold mb-3">
                Coordinates
              </h4>
              {contactLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <a
                    key={i}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      darkMode
                        ? 'bg-white/[0.02] border-white/[0.04] hover:border-white/10 hover:bg-white/[0.04]'
                        : 'bg-zinc-50 border-black/[0.04] hover:border-black/10 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 opacity-50" />
                      <div>
                        <div className="text-[10px] font-mono opacity-40 uppercase">{link.label}</div>
                        <div className="text-xs font-semibold text-zinc-200">{link.value}</div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <div className={`p-6 sm:p-8 rounded-2xl border ${
              darkMode ? 'bg-[#121215] border-white/[0.08]' : 'bg-white border-black/[0.08]'
            }`}>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Intent Selector */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold mb-3">
                    Discussion Scope
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {intents.map((intent) => (
                      <button
                        type="button"
                        key={intent}
                        onClick={() => setFormData({ ...formData, intent })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                          formData.intent === intent
                            ? darkMode ? 'bg-white text-black font-semibold' : 'bg-black text-white font-semibold'
                            : darkMode
                            ? 'bg-white/[0.02] border border-white/[0.06] text-zinc-400 hover:text-white'
                            : 'bg-zinc-50 border border-black/[0.08] text-zinc-600 hover:text-black'
                        }`}
                      >
                        {intent}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                        darkMode
                          ? 'bg-black/30 border-white/[0.08] text-white focus:border-white/30'
                          : 'bg-zinc-50 border-black/[0.08] text-black focus:border-black/30'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. name@company.com"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                        darkMode
                          ? 'bg-black/30 border-white/[0.08] text-white focus:border-white/30'
                          : 'bg-zinc-50 border-black/[0.08] text-black focus:border-black/30'
                      }`}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2">
                    Project Goals / Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your product, engineering team, or timeline..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${
                      darkMode
                        ? 'bg-black/30 border-white/[0.08] text-white focus:border-white/30'
                        : 'bg-zinc-50 border-black/[0.08] text-black focus:border-black/30'
                    }`}
                  />
                </div>

                {/* Submit button */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-xs transition-all ${
                      darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
                    } disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  {submitStatus === 'success' && (
                    <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Message Delivered
                    </span>
                  )}
                  {submitStatus === 'error' && (
                    <span className="flex items-center gap-1.5 font-mono text-xs text-rose-400">
                      <XCircle className="w-4 h-4" /> Error. Email directly.
                    </span>
                  )}
                </div>

              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;