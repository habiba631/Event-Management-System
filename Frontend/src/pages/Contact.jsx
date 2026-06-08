import { useState } from 'react';
import StaticPageLayout from '../components/StaticPageLayout';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <StaticPageLayout
      tag="✦ Get in touch"
      title="Contact Us"
      subtitle="Have a question or feedback? We'd love to hear from you."
    >
      <div className="contact-grid">
        <div className="contact-info">
          <h2>Reach us</h2>
          <p>
            Whether you need help with an event, have a partnership inquiry, or want to
            report an issue, send us a message and we will get back to you.
          </p>
          <div className="contact-detail">
            <span className="contact-detail-label">Email</span>
            <a href="mailto:support@eventify.com">support@eventify.com</a>
          </div>
          <div className="contact-detail">
            <span className="contact-detail-label">Hours</span>
            <span>Monday – Friday, 9:00 AM – 6:00 PM (EET)</span>
          </div>
          <div className="contact-detail">
            <span className="contact-detail-label">Location</span>
            <span>Cairo, Egypt</span>
          </div>
        </div>

        {submitted ? (
          <div className="contact-success">
            <div className="contact-success-icon">✓</div>
            <h3>Message sent!</h3>
            <p>Thank you for reaching out. We will respond to your email as soon as possible.</p>
            <button type="button" className="btn btn-secondary" onClick={() => setSubmitted(false)}>
              Send another message
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                className="form-input"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                className="form-input contact-textarea"
                placeholder="How can we help?"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Send message →</button>
          </form>
        )}
      </div>
    </StaticPageLayout>
  );
}
