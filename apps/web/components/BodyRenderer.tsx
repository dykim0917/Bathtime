import type { CareCTA, ContentBodyBlock } from '@/src/archive/types';

function isExternalUrl(value: string | undefined): value is string {
  return Boolean(value?.startsWith('http://') || value?.startsWith('https://'));
}

function ctaHref(cta: CareCTA): string {
  if (cta.action === 'open_article' && cta.targetId) return `/content/${cta.targetId}`;
  if (cta.action === 'open_item' && cta.targetId) return `/explore?query=${encodeURIComponent(cta.targetId)}`;
  if (cta.action === 'view_related' && cta.targetId) return `/explore?query=${encodeURIComponent(cta.targetId)}`;
  if (cta.action === 'submit') return '/submit';
  if (cta.action === 'start_timer' && cta.targetId) return `/app?from=care_archive&routine=${encodeURIComponent(cta.targetId)}`;
  return '/explore';
}

export function BodyRenderer({ blocks }: { blocks: ContentBodyBlock[] }) {
  return (
    <div className="content-body">
      {blocks.map((block, index) => {
        if ('legacyFallback' in block && block.legacyFallback) return null;

        if (block.type === 'heading') return <h2 key={index}>{block.text}</h2>;
        if (block.type === 'paragraph') return <p key={index}>{block.text}</p>;
        if (block.type === 'quote') return <blockquote key={index}>{block.text}</blockquote>;
        if (block.type === 'divider') return <hr key={index} />;

        if (block.type === 'list') {
          return (
            <ul key={index}>
              {block.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          );
        }

        if (block.type === 'image') {
          return (
            <figure key={index} className="body-image" style={block.aspectRatio ? { aspectRatio: `${block.aspectRatio}` } : undefined}>
              {isExternalUrl(block.uri) ? <img src={block.uri} alt={block.caption ?? '바스타임 콘텐츠 이미지'} loading="lazy" /> : null}
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          );
        }

        if (block.type === 'heroIntro') {
          return (
            <section key={index} className="body-panel hero-intro">
              <p className="kicker">{block.eyebrow}</p>
              <h2>{block.title}</h2>
              {block.intro.map((text) => <p key={text}>{text}</p>)}
            </section>
          );
        }

        if (block.type === 'aha') {
          return (
            <aside key={index} className="body-panel aha-panel">
              <h3>{block.title}</h3>
              <p>{block.text}</p>
            </aside>
          );
        }

        if (block.type === 'mechanism') {
          return (
            <section key={index} className="body-panel">
              <h3>{block.title}</h3>
              {block.subtitle ? <p className="panel-subtitle">{block.subtitle}</p> : null}
              <div className="step-grid">
                {block.steps.map((step, stepIndex) => (
                  <article key={`${step.label}-${stepIndex}`} className="step-card">
                    <span>{stepIndex + 1}</span>
                    <strong>{step.label}</strong>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === 'evidenceCard') {
          return (
            <section key={index} className="body-panel">
              <h3>{block.title}</h3>
              {block.intro ? <p className="panel-subtitle">{block.intro}</p> : null}
              <div className="evidence-list">
                {block.items.map((item) => {
                  const card = (
                    <>
                      <strong>{item.sourceName}{item.year ? ` · ${item.year}` : ''}</strong>
                      {item.finding ? <p className="finding">{item.finding}</p> : null}
                      <p>{item.bathtimeTakeaway}</p>
                    </>
                  );
                  return item.url ? (
                    <a key={`${item.sourceName}-${item.url}`} className="evidence-card" href={item.url} target="_blank" rel="noreferrer">
                      {card}
                    </a>
                  ) : (
                    <div key={item.sourceName} className="evidence-card">
                      {card}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        }

        if (block.type === 'ritualTimer') {
          return (
            <section key={index} className="body-panel timer-panel">
              <h3>{block.title}</h3>
              {block.description ? <p className="panel-subtitle">{block.description}</p> : null}
              <p className="timer-meta">{block.durationMinutes}분 · {block.environment ?? 'timer'}</p>
              <ol>
                {block.steps.map((step) => (
                  <li key={`${step.timeLabel}-${step.title}`}>
                    <strong>{step.timeLabel} · {step.title}</strong>
                    <p>{step.instruction}</p>
                  </li>
                ))}
              </ol>
              <a className="button-primary" href={`/app?from=care_archive&routine=${encodeURIComponent(block.timerId)}`}>
                {block.ctaLabel}
              </a>
            </section>
          );
        }

        if (block.type === 'safetyBox') {
          return (
            <aside key={index} className="body-panel safety-panel">
              <h3>{block.title}</h3>
              <ul>
                {block.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              {block.note ? <p className="panel-subtitle">{block.note}</p> : null}
            </aside>
          );
        }

        if (block.type === 'ctaGroup') {
          return (
            <section key={index} className="body-panel cta-panel">
              {block.title ? <h3>{block.title}</h3> : null}
              <div className="cta-row">
                {block.items.map((item) => (
                  <a key={`${item.action}-${item.targetId ?? item.label}`} className={item.emphasis === 'primary' ? 'button-primary' : 'button-secondary'} href={ctaHref(item)}>
                    {item.label}
                  </a>
                ))}
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
