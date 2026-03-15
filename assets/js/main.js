const dataUrl = './data/mock-data.json';
const flowStorageKey = 'memorialize-flow-state';

let cachedData;

async function loadData() {
  if (cachedData) return cachedData;
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error('Failed to load data');
  cachedData = await res.json();
  return cachedData;
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
      return `<option ${selected}>${value}</option>`;
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

async function initHome() {
  const data = await loadData();
  setText('heroTitle', data.brand.heroTitle);
  setText('heroSubtitle', data.brand.heroSubtitle);
  setImage('heroImage', data.home.heroImage, '3D printed gift reference');

  renderList(
    'howSteps',
    data.home.howItWorks,
    (s) => `
    <article class="item">
      <div class="kicker">Step ${s.step}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </article>
  `
  );

  renderList(
    'categoriesGrid',
    data.home.categories,
    (c) => `
    <article class="item">
      <div class="kicker">${c.type}</div>
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
    </article>
  `
  );

  renderList(
    'pricing',
    data.home.pricing,
    (p) => `
    <article class="item">
      <div class="kicker">${p.plan}</div>
      <div class="price">₹${p.price}</div>
      <ul class="clean">${p.features.map((x) => `<li>• ${x}</li>`).join('')}</ul>
    </article>
  `
  );

  renderList(
    'testimonialsGrid',
    data.home.testimonials,
    (t) => `
    <article class="item">
      <div class="kicker">${t.location}</div>
      <h3>${t.name}</h3>
      <p>“${t.quote}”</p>
    </article>
  `
  );

  renderList(
    'faq',
    data.home.faq,
    (f) => `
    <details>
      <summary>${f.q}</summary>
      <p>${f.a}</p>
    </details>
  `
  );
}

async function initAbout() {
  const data = await loadData();
  setText('aboutMission', data.about.mission);
  renderList(
    'aboutValues',
    data.about.values,
    (v) => `
    <article class="item">
      <h3>${v.title}</h3>
      <p>${v.desc}</p>
    </article>
  `
  );
}

async function initStories() {
  const data = await loadData();
  renderList(
    'storiesGrid',
    data.stories,
    (s) => `
    <article class="item">
      <div class="kicker">${s.tag}</div>
      <h3>${s.title}</h3>
      <p>${s.text}</p>
    </article>
  `
  );
}

async function initAIPreview() {
  const data = await loadData();
  renderList(
    'previewCards',
    data.previews,
    (p, i) => `
    <article class="item">
      <img class="preview-image" src="${p.img}" alt="3D printed concept preview ${i + 1}">
      <div class="kicker">Concept ${String.fromCharCode(65 + i)}</div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div style="margin-top:10px"><a class="btn secondary" href="customize-gift.html">Select Concept</a></div>
    </article>
  `
  );
}

async function initCreateProfile() {
  const data = await loadData();
  const defaults = {
    profile: data.flow.profile.defaults,
    customization: data.flow.customization,
    checkout: data.flow.checkout
  };
  const state = readFlowState(defaults);

  populateSelect('occasion', data.flow.profile.occasionOptions, state.profile.occasion);
  populateSelect('relationship', data.flow.profile.relationshipOptions, state.profile.relationship);

  setText('profileHint', `${data.brand.name} mock flow uses local data only (no backend calls).`);

  ['recipient', 'profession', 'hobbies', 'referenceUrl', 'storyPrompt'].forEach((field) => {
    const input = document.getElementById(field);
    if (input) input.value = state.profile[field] || '';
  });

  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nextState = {
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
    };
    saveFlowState(nextState);
    window.location.href = 'ai-preview.html';
  });
}

function getPreviewByTitle(previews, title) {
  return previews.find((preview) => preview.title === title) || previews[0];
}

async function initCustomize() {
  const data = await loadData();
  const defaults = {
    profile: data.flow.profile.defaults,
    customization: data.flow.customization,
    checkout: data.flow.checkout
  };
  const state = readFlowState(defaults);

  populateSelect('size', data.flow.customization.sizeOptions, state.customization.size || data.flow.customization.sizeOptions[1].label);
  populateSelect('material', data.flow.customization.materialOptions, state.customization.material || data.flow.customization.materialOptions[0]);
  populateSelect('colorStyle', data.flow.customization.colorOptions, state.customization.colorStyle || data.flow.customization.colorOptions[1]);
  populateSelect('packaging', data.flow.customization.packagingOptions, state.customization.packaging || data.flow.customization.packagingOptions[1]);

  document.getElementById('engraving').value = state.customization.engraving || '';
  document.getElementById('notes').value = state.customization.notes || '';

  const concept = getPreviewByTitle(data.previews, state.customization.selectedConcept);
  setImage('selectedConceptImage', concept.img, `Selected concept ${concept.title}`);
  setText('selectedConceptTitle', concept.title);
  setText('selectedConceptDesc', concept.desc);

  const form = document.getElementById('customizeForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nextState = {
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
    };

    saveFlowState(nextState);
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
  const defaults = {
    profile: data.flow.profile.defaults,
    customization: data.flow.customization,
    checkout: data.flow.checkout
  };
  const state = readFlowState(defaults);

  const mergedCustomization = { ...data.flow.customization, ...state.customization };
  const total = calculateTotal(mergedCustomization);

  renderList(
    'orderSummary',
    [
      `Recipient: ${state.profile.recipient}`,
      `Occasion: ${state.profile.occasion}`,
      `Concept: ${mergedCustomization.selectedConcept}`,
      `Size: ${mergedCustomization.size || mergedCustomization.sizeOptions[1].label}`,
      `Finish: ${mergedCustomization.material || 'PLA+'} + ${mergedCustomization.colorStyle || 'Pastel'}`,
      `Packaging: ${mergedCustomization.packaging || 'Gift Box'}`,
      `Engraving: ${mergedCustomization.engraving || '-'}`
    ],
    (item) => `<li>• ${item}</li>`
  );

  setText('orderTotal', `Total: ₹${total}`);

  populateSelect('paymentMode', data.flow.checkout.paymentOptions, state.checkout.selectedPayment || data.flow.checkout.selectedPayment);
  document.getElementById('address').value = state.checkout.address || '';
  document.getElementById('phone').value = state.checkout.phone || '';

  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nextState = {
      ...state,
      checkout: {
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        selectedPayment: document.getElementById('paymentMode').value
      }
    };
    saveFlowState(nextState);
    window.location.href = 'track-order.html';
  });
}

async function initTrackOrder() {
  const data = await loadData();
  setText('orderMeta', `Order ID: ${data.flow.tracking.orderId} • Customer: ${data.flow.tracking.customer}`);

  renderList(
    'trackingTimeline',
    data.flow.tracking.events,
    (event) => `
    <div class="track-step ${event.status === 'done' ? 'done' : event.status === 'current' ? 'current' : ''}">
      <b>${event.title}</b><div>${event.time}</div>
    </div>
  `
  );
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
});
