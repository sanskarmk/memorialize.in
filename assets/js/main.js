const dataUrl = './data/mock-data.json';

async function loadData() {
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error('Could not load mock data');
  return res.json();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderList(id, items, itemRenderer) {
  const wrap = document.getElementById(id);
  if (!wrap || !items?.length) return;
  wrap.innerHTML = items.map(itemRenderer).join('');
}

async function initHome() {
  const data = await loadData();
  setText('heroTitle', data.brand.heroTitle);
  setText('heroSubtitle', data.brand.heroSubtitle);

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

  renderList('pricing', data.home.pricing, (p) => `
    <article class="item">
      <div class="kicker">${p.plan}</div>
      <div class="price">₹${p.price}</div>
      <ul class="clean">${p.features.map(x => `<li>• ${x}</li>`).join('')}</ul>
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

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'stories') initStories();
  if (page === 'about') initAbout();
});
