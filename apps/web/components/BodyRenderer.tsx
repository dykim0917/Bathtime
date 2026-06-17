import type { ComponentType } from 'react';
import { Buildings, Fire, MapTrifold, SquaresFour, Thermometer, Waves } from '@phosphor-icons/react/ssr';
import type { CareCTA, ContentBodyBlock } from '@/src/archive/types';
import { careGuideAspectRatios, getCareGuideImageSrc } from '@web/lib/careImages';
import { KakaoSpotMap } from './KakaoSpotMap';

type CandidateIcon = ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'fill'; 'aria-hidden'?: boolean | 'true' | 'false' }>;
type SpotCandidateItem = Extract<ContentBodyBlock, { type: 'spotCandidates' }>['items'][number];

function getSpotCandidateIcon(typeLabel: string): CandidateIcon {
  if (typeLabel.includes('찜질')) return Fire;
  if (typeLabel.includes('해수탕')) return Waves;
  if (typeLabel.includes('온천')) return Thermometer;
  if (typeLabel.includes('관광')) return MapTrifold;
  if (typeLabel.includes('생활')) return Buildings;
  return SquaresFour;
}

function isExternalUrl(value: string | undefined): value is string {
  return Boolean(value?.startsWith('http://') || value?.startsWith('https://'));
}

function isPublicAssetPath(value: string | undefined): value is string {
  return Boolean(value?.startsWith('/'));
}

function getBodyImageSrc(uri: string): string | null {
  if (uri.startsWith('care-guide:')) return getCareGuideImageSrc(uri.replace('care-guide:', ''));
  return isExternalUrl(uri) || isPublicAssetPath(uri) ? uri : null;
}

function getImageAspectRatio(uri: string, explicitAspectRatio?: number): number | undefined {
  if (typeof explicitAspectRatio === 'number' && Number.isFinite(explicitAspectRatio) && explicitAspectRatio > 0) {
    return explicitAspectRatio;
  }
  if (uri.startsWith('care-guide:')) return careGuideAspectRatios[uri.replace('care-guide:', '')] ?? 4 / 3;
  return undefined;
}

function getImageDimensions(aspectRatio?: number): { width: number; height: number } {
  const width = 1200;
  const ratio = aspectRatio && Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 4 / 3;
  return { width, height: Math.round(width / ratio) };
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '링크';
  }
}

function splitTextUrl(value: string): { label: string; url: string } | null {
  const match = value.match(/^(.*?)(?:\s+-\s+|\s+)(https?:\/\/\S+)$/);
  if (!match) return null;
  return {
    label: match[1].trim().replace(/[\s,;:.-]+$/, ''),
    url: match[2],
  };
}

function ListItem({ item }: { item: string }) {
  const linked = splitTextUrl(item);
  if (!linked) return <li>{item}</li>;

  return (
    <li>
      {linked.label}
      {' '}
      <a className="inline-source-link" href={linked.url} target="_blank" rel="noreferrer">
        {hostname(linked.url)}에서 보기
      </a>
    </li>
  );
}

function ProductCandidateMeta({ value }: { value: string }) {
  const parts = value.split(' · ').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return <>{value}</>;

  return (
    <>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className={index === 1 ? 'product-candidate-price' : undefined}>
          {index > 0 ? ' · ' : null}
          {part}
        </span>
      ))}
    </>
  );
}

function SpotCandidateCard({ item }: { item: SpotCandidateItem }) {
  const Icon = getSpotCandidateIcon(item.typeLabel);

  return (
    <article className="spot-candidate-card">
      <div className="spot-candidate-icon" aria-hidden="true">
        <Icon size={24} weight="bold" aria-hidden="true" />
      </div>
      <div className="spot-candidate-copy">
        <div className="spot-candidate-kicker">
          <span>{item.typeLabel}</span>
          <span>{item.region}</span>
        </div>
        <h3>{item.name}</h3>
        <dl className="spot-candidate-facts">
          <div>
            <dt>확인된 정보</dt>
            <dd>{item.confirmed}</dd>
          </div>
          <div>
            <dt>확인할 것</dt>
            <dd>{item.needsCheck}</dd>
          </div>
          {item.soloNote ? (
            <div>
              <dt>혼자 쉬기 관점</dt>
              <dd>{item.soloNote}</dd>
            </div>
          ) : null}
        </dl>
        {(item.lastCheckedAt || item.sourceLabel) ? (
          <p className="spot-candidate-meta">
            {[item.lastCheckedAt ? `${item.lastCheckedAt} 확인` : null, item.sourceLabel].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        {(item.mapUrl || item.naverMapUrl) ? (
          <div className="spot-candidate-map-actions">
            {item.mapUrl ? (
              <a className="spot-candidate-map-link kakao" href={item.mapUrl} target="_blank" rel="noreferrer">
                <span className="map-provider-badge">
                  <img src="/brand/kakao-map-icon.png" alt="" width={20} height={20} loading="lazy" />
                </span>
                카카오맵에서 보기
              </a>
            ) : null}
            {item.naverMapUrl ? (
              <a className="spot-candidate-map-link naver" href={item.naverMapUrl} target="_blank" rel="noreferrer">
                <span className="map-provider-badge">
                  <img src="/brand/naver-map-icon.png" alt="" width={20} height={20} loading="lazy" />
                </span>
                네이버지도에서 보기
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
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
              {block.items.map((item) => <ListItem key={item} item={item} />)}
            </ul>
          );
        }

        if (block.type === 'image') {
          const imageSrc = getBodyImageSrc(block.uri);
          if (!imageSrc) return null;

          const aspectRatio = getImageAspectRatio(block.uri, block.aspectRatio);
          const dimensions = getImageDimensions(aspectRatio);
          return (
            <figure key={index} className="body-image" style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}>
              <img
                src={imageSrc}
                alt={block.caption ?? '바스타임 콘텐츠 이미지'}
                width={dimensions.width}
                height={dimensions.height}
                loading="lazy"
              />
            </figure>
          );
        }

        if (block.type === 'productCandidates') {
          return (
            <div key={index} className="product-candidate-list">
              {block.items.map((item) => {
                const imageSrc = getBodyImageSrc(item.imageUri);
                return (
                  <article key={`${item.brand}-${item.name}`} className="product-candidate-card">
                    <a className="product-candidate-image" href={item.purchaseUrl} target="_blank" rel="noreferrer">
                      {imageSrc ? <img src={imageSrc} alt={`${item.brand} ${item.name}`} width={320} height={320} loading="lazy" /> : null}
                    </a>
                    <div className="product-candidate-copy">
                      {item.badge ? <span className="product-candidate-badge">{item.badge}</span> : null}
                      <p className="product-candidate-brand">{item.brand}</p>
                      <h3>{item.name}</h3>
                      <p className="product-candidate-meta">
                        <ProductCandidateMeta value={item.metaSummary ?? `${item.priceLabel} · ${item.priceCheckedAt} 확인`} />
                      </p>
                      <p>{item.summary}</p>
                      <a className="product-candidate-cta" href={item.purchaseUrl} target="_blank" rel="noreferrer">
                        {item.ctaLabel ?? `${hostname(item.purchaseUrl)}에서 보기`}
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          );
        }

        if (block.type === 'spotCandidates') {
          return (
            <div key={index} className="spot-candidate-list">
              {block.items.map((item) => <SpotCandidateCard key={`${item.region}-${item.name}`} item={item} />)}
            </div>
          );
        }

        if (block.type === 'spotCandidateGroups') {
          return (
            <div key={index} className="spot-candidate-groups">
              {block.groups.map((group, groupIndex) => (
                <details key={group.title} className="spot-candidate-group" open={groupIndex === 0}>
                  <summary className="spot-candidate-group-summary">
                    <span>
                      <strong>{group.title}</strong>
                      {group.description ? <em>{group.description}</em> : null}
                    </span>
                    <span className="spot-candidate-group-count">{group.items.length}곳</span>
                  </summary>
                  <div className="spot-candidate-list">
                    {group.items.map((item) => <SpotCandidateCard key={`${item.region}-${item.name}`} item={item} />)}
                  </div>
                </details>
              ))}
            </div>
          );
        }

        if (block.type === 'spotMap') {
          return (
            <KakaoSpotMap
              key={index}
              title={block.title}
              description={block.description}
              items={block.items}
            />
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
