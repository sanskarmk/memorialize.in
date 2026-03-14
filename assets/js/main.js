const dataUrl = './data/mock-data.json';

async function loadData() {
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error('Failed to load data');
  return res.json();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || '';
}

function setImage(id, src, alt = '') {
  const el = document.getElementById(id);
  if (el && src) { el.src = src; el.alt = alt; }
}

function renderList(id, items, renderer) {
  const root = document.getElementById(id);
  if (!root || !items?.length) return;
  root.innerHTML = items.map(renderer).join('');
}

async function initHome() {
  const data = await loadData();
  setText('heroTitle', data.brand.heroTitle);
  setText('heroSubtitle', data.brand.heroSubtitle);
  setImage('heroImage', data.home.heroImage, 'AI preview style board');

  renderList('howSteps', data.home.howItWorks, (s) => `
    <article class="item">
      <div class="kicker">Step ${s.step}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </article>
  `);

  renderList('categoriesGrid', data.home.categories, (c) => `
    <article class="item">
      <div class="kicker">${c.type}</div>
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
    </article>
  `);

  renderList('pricing', data.home.pricing, (p) => `
    <article class="item">
      <div class="kicker">${p.plan}</div>
      <div class="price">₹${p.price}</div>
      <ul class="clean">${p.features.map(x => `<li>• ${x}</li>`).join('')}</ul>
    </article>
  `);

  renderList('testimonialsGrid', data.home.testimonials, (t) => `
    <article class="item">
      <div class="kicker">${t.location}</div>
      <h3>${t.name}</h3>
      <p>“${t.quote}”</p>
    </article>
  `);

  renderList('faq', data.home.faq, (f) => `
    <details>
      <summary>${f.q}</summary>
      <p>${f.a}</p>
    </details>
  `);
}

async function initAbout() {
  const data = await loadData();
  setText('aboutMission', data.about.mission);
  renderList('aboutValues', data.about.values, (v) => `
    <article class="item">
      <h3>${v.title}</h3>
      <p>${v.desc}</p>
    </article>
  `);
}

async function initStories() {
  const data = await loadData();
  renderList('storiesGrid', data.stories, (s) => `
    <article class="item">
      <div class="kicker">${s.tag}</div>
      <h3>${s.title}</h3>
      <p>${s.text}</p>
    </article>
  `);
}

async function initAIPreview() {
  const data = await loadData();
  renderList('previewCards', data.previews, (p, i) => `
    <article class="item">
      <img class="preview-image" src="${p.img}" alt="AI concept preview ${i + 1}">
      <div class="kicker">Concept ${String.fromCharCode(65 + i)}</div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div style="margin-top:10px"><a class="btn secondary" href="customize-gift.html">Select Concept</a></div>
    </article>
  `);
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'about') initAbout();
  if (page === 'stories') initStories();
  if (page === 'ai-preview') initAIPreview();
});
