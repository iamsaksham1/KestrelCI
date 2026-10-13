/**
 * @file client/src/components/forms/ContactForm.jsx
 * @description Accessible contact form anchored at #contact for skip links.
 * Dispatches validated messages to POST /api/v1/contact.
 * Square corners, hairline borders, no orange accents.
 */

import React, { useState } from 'react';
import api from '../../services/api.js';
import Button from '../ui/Button.jsx';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.submitContact(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit contact message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-24 w-full" aria-labelledby="contact-heading">
      <div id="contact-section" className="w-full border border-line rounded-[2px] p-8 sm:p-12 bg-surface-light dark:bg-surface-dark select-none">
        <div className="mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted block mb-1">
            04 / DIRECT DISPATCH
          </span>
          <h2 id="contact-heading" className="font-sans font-light text-2xl sm:text-3xl text-ink tracking-tight">
            Direct Engineering Inquiry
          </h2>
          <p className="font-sans font-light text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
            Submit questions, custom stage integration requests, or bug reports. Emitted records are persisted to SQLite.
          </p>
        </div>

        {success ? (
          <div className="p-8 bg-emerald-500/[0.04] border border-emerald-500/30 rounded-[2px] text-center animate-fade-in space-y-3 font-mono">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" aria-hidden="true" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Message Sealed & Persisted
            </h3>
            <p className="text-xs text-ink-muted font-sans font-light">
              Your inquiry has been stored in the contact_messages repository.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuccess(false)}
              >
                Send Another Note
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-[2px] text-xs text-red-500 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Name *
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Rivera"
                  className="w-full text-xs px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. alex@company.com"
                  className="w-full text-xs px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Subject *
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Inquiring about custom stage integration"
                className="w-full text-xs px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
                Message *
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your note here (min 10 characters)..."
                className="w-full text-xs px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-white resize-y"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" loading={loading} withArrow>
                Submit Message
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default ContactForm;
