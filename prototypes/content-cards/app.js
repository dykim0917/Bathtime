const cards = document.querySelector('#cards');
const search = document.querySelector('#search');
const city = document.querySelector('#city');
const detail = document.querySelector('#detail');
let activeKind = 'all';
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const external = (url, label, className = '') => `<a class="${className}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true">↗</span></a>`;
const mapUrl = place => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapQuery)}`;

function bindImageFallback(container) {
  container.querySelectorAll('img').forEach(img => img.addEventListener('error', () => { img.hidden = true; img.parentElement.classList.add('no-image'); }));
}

function render() {
  const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const shown = savedPlaces.filter(place => (activeKind === 'all' || place.kind === activeKind) && (city.value === 'all' || place.city === city.value) && terms.every(term => `${place.name} ${place.search} ${place.hook} ${place.condition || ''} ${place.tags.join(' ')}`.toLocaleLowerCase().includes(term)));
  cards.innerHTML = shown.map(place => `<article class="card">
    <button type="button" class="card-open" data-place="${place.id}" aria-label="${place.name} 상세 보기">
      <div class="cover ${place.id}"><span class="fallback-title" aria-hidden="true">${place.name}</span><img src="${escapeHtml(place.source.image)}" alt="${place.source.imageAlt}" style="object-position:${place.source.imagePosition}" referrerpolicy="no-referrer"><span class="type-label">${place.kind}</span><span class="platform-label">${place.source.platform === 'YouTube' ? '▶ Shorts' : '◎ Instagram'}</span></div>
      <div class="card-copy"><p class="location">${place.subtitle}</p><h3>${place.name}</h3><div class="tags">${place.highlights.map(tag => `<span>${tag}</span>`).join('')}</div>${place.condition ? `<p class="condition">${place.condition}</p>` : ''}</div>
    </button>
    <a class="card-bottom" href="${place.source.url}" target="_blank" rel="noopener noreferrer" aria-label="${place.name} 저장한 게시물 열기"><span>${place.source.platform}에서 보기</span><span aria-hidden="true">↗</span></a>
  </article>`).join('');
  document.querySelector('#count').textContent = shown.length;
  document.querySelector('#empty').hidden = shown.length !== 0;
  document.querySelector('#clear-filters').hidden = !terms.length && activeKind === 'all' && city.value === 'all';
  document.querySelector('#search-status').textContent = `${shown.length}개의 장소를 찾았어요.`;
  bindImageFallback(cards);
}

function openDetail(id) {
  const place = savedPlaces.find(item => item.id === id);
  document.querySelector('#detail-content').innerHTML = `
    <div class="detail-head"><p class="eyebrow">${place.country} · ${place.kind}</p><p class="location">${place.subtitle}</p><h2 id="detail-title">${place.name}</h2><p class="detail-hook">${place.hook}</p>${place.condition ? `<div class="detail-condition"><strong>${place.condition}</strong><small>${place.conditionSource}</small></div>` : ''}</div>
    <div class="detail-body"><section class="summary"><h3>내용 요약</h3><p>${place.summary}</p></section>
    <section><h3>이용 정보</h3><dl class="facts">${place.facts.map(fact => `<div><dt>${fact.label}</dt><dd>${fact.value}${fact.basis ? `<small class="${fact.official ? 'verified' : ''}">${fact.official && place.official ? external(place.official.url, fact.basis) : fact.basis}</small>` : ''}</dd></div>`).join('')}</dl></section>
    <section><div class="section-heading"><h3>저장한 게시물</h3><span>1개</span></div><a class="source-card" href="${place.source.url}" target="_blank" rel="noopener noreferrer"><span class="source-image"><img src="${escapeHtml(place.source.image)}" alt="${place.source.imageAlt}" referrerpolicy="no-referrer"></span><span><small>${place.source.platform} · ${place.source.creator}</small><strong>${place.source.title}</strong><small>${place.source.date ? `${place.source.date} 게시 · ` : ''}게시물 보기 ↗</small></span></a>${place.source.credit ? `<p class="credit">${place.source.credit}</p>` : ''}</section>
    <details class="provenance"><summary>출처 및 확인일</summary><p>${external(place.source.url, `${place.source.platform} · ${place.source.creator}`)}<br>${place.source.checked.replaceAll('-', '.')} 내용 확인</p>${place.official ? `<p>${external(place.official.url, place.official.label)}<br>${place.official.checked} 공식 안내 확인</p>` : ''}</details></div>
    <div class="detail-actions">${external(mapUrl(place), '지도에서 찾기', 'primary')}${place.official ? external(place.official.url, '공식 안내', 'secondary') : external(place.source.url, '게시물 보기', 'secondary')}</div>`;
  bindImageFallback(detail);
  detail.showModal();
  detail.scrollTop = 0;
  document.body.classList.add('modal-open');
}

document.querySelectorAll('[data-kind]').forEach(button => button.addEventListener('click', () => {
  activeKind = button.dataset.kind;
  document.querySelectorAll('[data-kind]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  render();
}));
search.addEventListener('input', render);
city.addEventListener('change', render);
cards.addEventListener('click', event => { const button = event.target.closest('[data-place]'); if (button) openDetail(button.dataset.place); });
document.querySelector('.close').addEventListener('click', () => detail.close());
detail.addEventListener('close', () => document.body.classList.remove('modal-open'));
detail.addEventListener('click', event => { if (event.target === detail) { const box = detail.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) detail.close(); } });
function resetFilters() { search.value = ''; city.value = 'all'; document.querySelector('[data-kind="all"]').click(); search.focus(); }
document.querySelector('#reset').addEventListener('click', resetFilters);
document.querySelector('#clear-filters').addEventListener('click', resetFilters);
render();

const discover = document.querySelector('#discover');
document.querySelector('#discover-open').addEventListener('click', () => { discover.showModal(); discover.scrollTop = 0; document.body.classList.add('modal-open'); });
document.querySelector('#discover-close').addEventListener('click', () => discover.close());
discover.addEventListener('close', () => document.body.classList.remove('modal-open'));
