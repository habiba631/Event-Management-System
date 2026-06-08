import { Link } from 'react-router-dom';

export default function StaticPageLayout({ tag, title, subtitle, children }) {
  return (
    <div className="static-page">
      <div className="container static-page-inner">
        <Link to="/" className="static-page-back">← Back to home</Link>
        <div className="static-page-hero animate-fadeInDown">
          {tag && <div className="section-tag">{tag}</div>}
          <h1 className="section-title">{title}</h1>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <div className="static-page-content animate-fadeInUp">
          {children}
        </div>
      </div>
    </div>
  );
}
