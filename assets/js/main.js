const dataFiles = {
  brand: './data/brand.json',
  home: './data/home.json',
  flow: './data/flow.json',
  stories: './data/stories.json',
  forms: './data/forms.json'
};
const flowStorageKey = 'memorialize-flow-state';
const sessionStorageKey = 'memorialize-session';

let cachedData;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

async function loadData() {
  if (cachedData) return cachedData;
  const [brand, home, flow, stories, forms] = await Promise.all([
    fetchJson(dataFiles.brand),
    fetchJson(dataFiles.home),
    fetchJson(dataFiles.flow),
    fetchJson(dataFiles.stories),
    fetchJson(dataFiles.forms)
  ]);
  cachedData = { ...brand, home, flow, ...stories, forms };
  return cachedData;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || '';
}

function setImage(id, src, alt = '') {
  const el = document.getElementById(id);
  if (el && src) {
    el.src = src;
    el.alt = alt;
  }
}

function renderList(id, items, renderer) {
  const root = document.getElementById(id);
  if (!root || !items?.length) return;
  root.innerHTML = items.map(renderer).join('');
}

function populateSelect(id, options, selectedValue) {
  const select = document.getElementById(id);
  if (!select || !options?.length) return;
  select.innerHTML = options
    .map((option) => {
      const value = typeof option === 'string' ? option : option.label;
      const selected = value === selectedValue ? 'selected' : '';
      return `<option ${selected}>${escapeHtml(value)}</option>`;
    })
    .join('');
}

function readFlowState(defaults) {
  try {
    const saved = JSON.parse(localStorage.getItem(flowStorageKey) || '{}');
    return {
      ...defaults,
      ...saved,
      profile: { ...defaults.profile, ...saved.profile },
      customization: { ...defaults.customization, ...saved.customization },
      checkout: { ...defaults.checkout, ...saved.checkout }
    };
  } catch {
    return defaults;
  }
}

function saveFlowState(state) {
  localStorage.setItem(flowStorageKey, JSON.stringify(state));
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

function bindNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();
    showToast('Subscribed. Founder notes and gifting updates will be shared here.');
  });
}

function hydrateBrandChrome(data) {
  setText('brandTagline', data.brand.tagline);
  const session = JSON.parse(localStorage.getItem(sessionStorageKey) || 'null');
  const authBadge = document.getElementById('authBadge');
  if (authBadge && session?.name) authBadge.textContent = `Signed in as ${session.name}`;
}

async function initHome() {
  const data = await loadData();
  hydrateBrandChrome(data);
  setText('heroTitle', data.brand.heroTitle);
  setText('heroSubtitle', data.brand.heroSubtitle);
  setImage('heroImage', data.brand.heroImage, 'Premium personalized 3D keepsake reference');
  setText('ownerQuote', data.brand.owner.quote);
  setText('ownerBio', data.brand.owner.shortBio);

  renderList('metrics', data.brand.stats, (s) => `
    <article class="metric"><b>${escapeHtml(s.value)}</b><span>${escapeHtml(s.label)}</span><small>Service promise</small></article>
  `);

  renderList('howSteps', data.home.howItWorks, (s) => `
    <article class="item elevated">
      <div class="kicker">Approval workflow · Step ${escapeHtml(s.step)}</div>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.desc)}</p>
    </article>
  `);

  renderList('categoriesGrid', data.home.categories, (c) => `
    <article class="item feature-card">
      <div class="kicker">${escapeHtml(c.type)}</div>
      <h3>${escapeHtml(c.name)}</h3>
      <p>${escapeHtml(c.desc)}</p>
    </article>
  `);

  renderList('pricing', data.home.pricing, (p) => `
    <article class="item price-card">
      <div class="kicker">${escapeHtml(p.tag)} · packed with care</div>
      <h3>${escapeHtml(p.plan)}</h3>
      <div class="price">₹${escapeHtml(p.price)}</div>
      <ul class="clean">${p.features.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
    </article>
  `);

  renderList('testimonialsGrid', data.home.testimonials, (t) => `
    <article class="item testimonial">
      <p>“${escapeHtml(t.quote)}”</p>
      <h3>${escapeHtml(t.name)}</h3>
      <div class="kicker">${escapeHtml(t.location)} · verified service feedback</div>
    </article>
  `);

  renderList('faq', data.home.faq, (f) => `
    <details>
      <summary>${escapeHtml(f.q)}</summary>
      <p>${escapeHtml(f.a)}</p>
    </details>
  `);
  bindNewsletterForm();
}

async function initAbout() {
  const data = await loadData();
  hydrateBrandChrome(data);
  setText('aboutMission', data.about.mission);
  setText('ownerName', data.brand.owner.name);
  setText('ownerRole', data.brand.owner.role);
  setText('ownerBio', data.brand.owner.shortBio);
  setText('ownerQuote', data.brand.owner.quote);
  renderList('ownerPassions', data.brand.owner.passions, (passion) => `<span>${escapeHtml(passion)}</span>`);
  renderList('aboutValues', data.about.values, (v) => `
    <article class="item elevated">
      <h3>${escapeHtml(v.title)}</h3>
      <p>${escapeHtml(v.desc)}</p>
    </article>
  `);
  populateSelect('contactReason', data.forms.contactReasons, data.forms.contactReasons[0]);
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.reset();
      showToast('Message received. Sanskar will review your gifting request and follow up with next steps.');
    });
  }
}

async function initStories() {
  const data = await loadData();
  hydrateBrandChrome(data);
  renderList('storiesGrid', data.stories, (s) => `
    <article class="item story-card">
      <div class="kicker">${escapeHtml(s.tag)}</div>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.text)}</p>
    </article>
  `);
}

async function initAIPreview() {
  const data = await loadData();
  hydrateBrandChrome(data);
  renderList('previewCards', data.flow.previews, (p, i) => `
    <article class="item preview-card">
      <img class="preview-image" src="${escapeHtml(p.img)}" alt="3D printed concept preview ${i + 1}">
      <div class="kicker">Concept ${String.fromCharCode(65 + i)}</div>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.desc)}</p>
      <div class="card-actions"><a class="btn secondary select-concept" data-title="${escapeHtml(p.title)}" href="customize-gift.html">Select Concept</a></div>
    </article>
  `);
  document.querySelectorAll('.select-concept').forEach((link) => {
    link.addEventListener('click', () => {
      const defaults = createDefaults(data);
      const state = readFlowState(defaults);
      saveFlowState({ ...state, customization: { ...state.customization, selectedConcept: link.dataset.title } });
    });
  });
}

function createDefaults(data) {
  return {
    profile: data.flow.profile.defaults,
    customization: data.flow.customization,
    checkout: data.flow.checkout
  };
}

async function initCreateProfile() {
  const data = await loadData();
  hydrateBrandChrome(data);
  const state = readFlowState(createDefaults(data));

  populateSelect('occasion', data.flow.profile.occasionOptions, state.profile.occasion);
  populateSelect('relationship', data.flow.profile.relationshipOptions, state.profile.relationship);
  setText('profileHint', 'Share as much context as you can—the design review uses these details to shape the concept, approval notes, and finishing plan.');

  ['recipient', 'profession', 'hobbies', 'referenceUrl', 'storyPrompt'].forEach((field) => {
    const input = document.getElementById(field);
    if (input) input.value = state.profile[field] || '';
  });

  const form = document.getElementById('profileForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveFlowState({
      ...state,
      profile: {
        recipient: document.getElementById('recipient').value,
        occasion: document.getElementById('occasion').value,
        profession: document.getElementById('profession').value,
        relationship: document.getElementById('relationship').value,
        hobbies: document.getElementById('hobbies').value,
        referenceUrl: document.getElementById('referenceUrl').value,
        storyPrompt: document.getElementById('storyPrompt').value
      }
    });
    window.location.href = 'ai-preview.html';
  });
}

function getPreviewByTitle(previews, title) {
  return previews.find((preview) => preview.title === title) || previews[0];
}

async function initCustomize() {
  const data = await loadData();
  hydrateBrandChrome(data);
  const state = readFlowState(createDefaults(data));

  populateSelect('size', data.flow.customization.sizeOptions, state.customization.size || data.flow.customization.sizeOptions[1].label);
  populateSelect('material', data.flow.customization.materialOptions, state.customization.material || data.flow.customization.materialOptions[0]);
  populateSelect('colorStyle', data.flow.customization.colorOptions, state.customization.colorStyle || data.flow.customization.colorOptions[1]);
  populateSelect('packaging', data.flow.customization.packagingOptions, state.customization.packaging || data.flow.customization.packagingOptions[1]);

  document.getElementById('engraving').value = state.customization.engraving || '';
  document.getElementById('notes').value = state.customization.notes || '';

  const concept = getPreviewByTitle(data.flow.previews, state.customization.selectedConcept);
  setImage('selectedConceptImage', concept.img, `Selected concept ${concept.title}`);
  setText('selectedConceptTitle', concept.title);
  setText('selectedConceptDesc', concept.desc);

  const form = document.getElementById('customizeForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveFlowState({
      ...state,
      customization: {
        ...state.customization,
        size: document.getElementById('size').value,
        material: document.getElementById('material').value,
        colorStyle: document.getElementById('colorStyle').value,
        packaging: document.getElementById('packaging').value,
        engraving: document.getElementById('engraving').value,
        notes: document.getElementById('notes').value
      }
    });
    window.location.href = 'review-checkout.html';
  });
}

function calculateTotal(customization) {
  const sizePrice = (customization.sizeOptions || []).find((size) => size.label === customization.size)?.price || 1499;
  const addonsPrice = (customization.addons || []).reduce((total, addon) => total + addon.price, 0);
  return sizePrice + addonsPrice;
}

async function initReviewCheckout() {
  const data = await loadData();
  hydrateBrandChrome(data);
  const state = readFlowState(createDefaults(data));
  const mergedCustomization = { ...data.flow.customization, ...state.customization };
  const total = calculateTotal(mergedCustomization);

  renderList('orderSummary', [
    `Recipient: ${state.profile.recipient}`,
    `Occasion: ${state.profile.occasion}`,
    `Concept: ${mergedCustomization.selectedConcept}`,
    `Size: ${mergedCustomization.size || mergedCustomization.sizeOptions[1].label}`,
    `Finish: ${mergedCustomization.material || 'PLA+ matte'} + ${mergedCustomization.colorStyle || 'Pastel'}`,
    `Packaging: ${mergedCustomization.packaging || 'Gift box'}`,
    `Engraving: ${mergedCustomization.engraving || '-'}`
  ], (item) => `<li>${escapeHtml(item)}</li>`);

  setText('orderTotal', `Total: ₹${total}`);
  populateSelect('paymentMode', data.flow.checkout.paymentOptions, state.checkout.selectedPayment || data.flow.checkout.selectedPayment);
  document.getElementById('address').value = state.checkout.address || '';
  document.getElementById('phone').value = state.checkout.phone || '';
  document.getElementById('email').value = state.checkout.email || '';

  const form = document.getElementById('checkoutForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveFlowState({
      ...state,
      checkout: {
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        selectedPayment: document.getElementById('paymentMode').value
      }
    });
    window.location.href = 'track-order.html';
  });
}

async function initTrackOrder() {
  const data = await loadData();
  hydrateBrandChrome(data);
  setText('orderMeta', `Order ID: ${data.flow.tracking.orderId} • Customer: ${data.flow.tracking.customer}`);
  renderList('trackingTimeline', data.flow.tracking.events, (event) => `
    <div class="track-step ${event.status === 'done' ? 'done' : event.status === 'current' ? 'current' : ''}">
      <b>${escapeHtml(event.title)}</b><div>${escapeHtml(event.time)}</div>
    </div>
  `);
}

async function initLogin() {
  const data = await loadData();
  hydrateBrandChrome(data);
  setText('loginHint', `Try ${data.forms.login.email} / ${data.forms.login.password}`);
  document.getElementById('loginEmail').value = data.forms.login.email;
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');
    if (email === data.forms.login.email && password === data.forms.login.password) {
      localStorage.setItem(sessionStorageKey, JSON.stringify({ name: data.forms.login.name, email }));
      message.textContent = 'Login successful. Redirecting to create a gift...';
      window.setTimeout(() => { window.location.href = 'create-profile.html'; }, 700);
    } else {
      message.textContent = 'Use the preview credentials shown above to continue.';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'about') initAbout();
  if (page === 'stories') initStories();
  if (page === 'ai-preview') initAIPreview();
  if (page === 'create-profile') initCreateProfile();
  if (page === 'customize') initCustomize();
  if (page === 'review-checkout') initReviewCheckout();
  if (page === 'track-order') initTrackOrder();
  if (page === 'login') initLogin();
});
