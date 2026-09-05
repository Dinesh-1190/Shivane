'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { PERSON, WEB3FORMS_ACCESS_KEY } from '@/lib/content';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { MagneticButton } from './MagneticButton';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Contact form.
 *
 * Fields are underline-only to match the site's hairline language. Validation
 * is client-side and announced through `aria-invalid` / `aria-describedby` so
 * it is available to screen readers, not just visible.
 *
 * Submissions post directly to Web3Forms (see `WEB3FORMS_ACCESS_KEY` in
 * lib/content.ts), which relays them to `PERSON.contactInbox` by email — the
 * site has no server of its own to send mail from, on either GitHub Pages or
 * the eventual Namecheap static host.
 */
export function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = 'Please enter your name.';
    if (!values.email.trim()) {
      next.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (!values.message.trim()) next.message = 'Please include a short message.';
    return next;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus('submitting');
    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New inquiry from ${PERSON.name} — shivaneaugustus.com`,
          from_name: values.name,
          name: values.name,
          email: values.email,
          message: values.message,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? 'Web3Forms request failed');
      }

      setStatus('sent');
      setValues({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const update = (field: keyof typeof values) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const fieldClass = (invalid: boolean) =>
    cn(
      'peer w-full border-0 border-b bg-transparent pb-3 pt-6 text-bone',
      'placeholder:text-transparent focus:outline-none focus:ring-0',
      'transition-colors duration-300',
      invalid ? 'border-b-red-400/70' : 'border-b-ink-line focus:border-b-brass',
    );

  const labelClass =
    cn(
      'pointer-events-none absolute left-0 top-6 origin-left font-sans text-sm text-bone-faint',
      'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
      // Float the label on focus or once the field holds a value.
      'peer-focus:top-0 peer-focus:text-[0.6rem] peer-focus:tracking-[0.2em] peer-focus:text-brass',
      'peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.6rem]',
      'peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:uppercase',
      'peer-focus:uppercase',
    );

  return (
    <form onSubmit={submit} noValidate className="w-full max-w-xl">
      <div className="relative">
        <input
          id="contact-name"
          name="name"
          type="text"
          placeholder="Name"
          value={values.name}
          onChange={update('name')}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={fieldClass(Boolean(errors.name))}
        />
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <FieldError id="contact-name-error" message={errors.name} />
      </div>

      <div className="relative mt-8">
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="Email"
          value={values.email}
          onChange={update('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={fieldClass(Boolean(errors.email))}
        />
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <FieldError id="contact-email-error" message={errors.email} />
      </div>

      <div className="relative mt-8">
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder="Message"
          value={values.message}
          onChange={update('message')}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={cn(fieldClass(Boolean(errors.message)), 'resize-none')}
        />
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <FieldError id="contact-message-error" message={errors.message} />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <MagneticButton type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending' : 'Send message'}
          <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        </MagneticButton>

        {/* Status is a live region so the outcome is announced, not just seen. */}
        <div aria-live="polite" className="min-h-[1.25rem]">
          <AnimatePresence mode="wait">
            {status === 'sent' && (
              <motion.p
                key="sent"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE.entrance }}
                className="font-sans text-sm text-brass"
              >
                Thank you — your message has been received.
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-sans text-sm text-red-400"
              >
                Something went wrong. Please try again, or email directly.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE.precise }}
          className="mt-2 font-sans text-xs text-red-400"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
