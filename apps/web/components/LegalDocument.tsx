import type { LegalBulletSection } from '@/src/legal/legalContent';

export function LegalDocument({
  title,
  subtitle,
  effectiveDate,
  labels,
  sections,
}: {
  title: string;
  subtitle: string;
  effectiveDate: string;
  labels?: ReadonlyArray<{ title: string; value: string }>;
  sections: LegalBulletSection[];
}) {
  return (
    <section className="legal-page page-stack">
      <header className="page-header">
        <p className="kicker">BATH TIME LEGAL</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <span>시행일 {effectiveDate}</span>
      </header>
      {labels ? (
        <div className="label-grid">
          {labels.map((item) => (
            <div key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="legal-sections">
        {sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            {section.body ? <p>{section.body}</p> : null}
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
