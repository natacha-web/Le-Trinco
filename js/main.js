// ===== TRINCO — main.js v2 =====

// Burger
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
burger?.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Nav scroll
window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// ===== SLIDER =====
const slides = document.querySelectorAll('.slide');
const thumbs = document.querySelectorAll('.slider-thumb');
const dots   = document.querySelectorAll('.dot');
const track  = document.querySelector('.slider-track');
let current  = 0;
let autoplay;

function goTo(n) {
  current = (n + slides.length) % slides.length;
  track.style.transform = `translateX(-${current * 100}%)`;
  thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
  dots.forEach((d, i)   => d.classList.toggle('active', i === current));
}

document.querySelector('.slider-prev')?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
document.querySelector('.slider-next')?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
thumbs.forEach((t, i) => t.addEventListener('click', () => { goTo(i); resetAuto(); }));
dots.forEach((d, i)   => d.addEventListener('click', () => { goTo(i); resetAuto(); }));

function resetAuto() { clearInterval(autoplay); autoplay = setInterval(() => goTo(current + 1), 4500); }
resetAuto();

// Touch swipe
let touchStartX = 0;
track?.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
track?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); resetAuto(); }
});

// ===== CARTE JSON =====
async function loadCarte() {
  try {
    const [carteRes, avisRes] = await Promise.all([
      fetch('/_data/carte.json'),
      fetch('/_data/avis.json')
    ]);
    const carte = await carteRes.json();
    const avisData = await avisRes.json();
    renderCarte(carte);
    renderAvis(avisData);
    renderHoraires(carte.horaires);
  } catch(e) { console.error('Erreur chargement données:', e); }
}

function stars(n) { return '★'.repeat(+n) + '☆'.repeat(5 - +n); }

function renderCarte(data) {
  const tabs = document.querySelectorAll('.tab-btn');
  const box  = document.getElementById('carte-content');

  const renderSection = key => {
    box.innerHTML = '';
    if (key === 'vins') {
      data.vins.forEach(cat => {
        const s = document.createElement('div');
        s.className = 'vins-section';
        s.innerHTML = `<div class="vins-categorie">${cat.categorie}</div>`;
        cat.items.forEach(v => {
          s.innerHTML += `
            <div class="vin-item">
              <div class="vin-info">
                <div class="vin-nom">${v.nom}</div>
                <div class="vin-region">${v.region}</div>
              </div>
              <div class="vin-prix">
                <div class="vin-prix-item"><span>verre</span><strong>${v.prix_verre}€</strong></div>
                <div class="vin-prix-item"><span>bouteille</span><strong>${v.prix_bouteille}€</strong></div>
              </div>
            </div>`;
        });
        box.appendChild(s);
      });
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'carte-grid';
    (data[key] || []).forEach(item => {
      grid.innerHTML += `
        <div class="carte-item fade-up">
          <div class="carte-item-header">
            <div class="carte-item-nom">${item.nom}</div>
            <div class="carte-item-prix">${item.prix}€</div>
          </div>
          <div class="carte-item-desc">${item.description}</div>
        </div>`;
    });
    box.appendChild(grid);
    observeFadeUp();
  };

  renderSection('planches');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderSection(tab.dataset.section);
  }));
}

function renderAvis(data) {
  const grid = document.getElementById('avis-grid');
  if (!grid) return;
  grid.innerHTML = '';
  data.avis.forEach(a => {
    grid.innerHTML += `
      <div class="avis-card fade-up">
        <div class="avis-stars">${stars(a.note)}</div>
        <p class="avis-texte">${a.texte}</p>
        <div class="avis-auteur">${a.prenom}</div>
        <div class="avis-date">${a.date}</div>
      </div>`;
  });
  observeFadeUp();
}

function renderHoraires(h) {
  const el = document.getElementById('horaires-content');
  if (!el || !h) return;
  el.innerHTML = `
    <table class="horaires-table">
      <tr><td>Mardi – Samedi</td><td>${h.mardi_samedi}</td></tr>
      <tr><td>Dimanche & Lundi</td><td>${h.dimanche_lundi}</td></tr>
    </table>
    <div class="privatisation-note">🎉 ${h.note} — <a href="mailto:contact@letrinco.fr" style="color:inherit">Nous contacter pour une privatisation</a></div>`;
}

// ===== FADE UP OBSERVER =====
function observeFadeUp() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => obs.observe(el));
}

// ===== FORMULAIRE =====
document.addEventListener('DOMContentLoaded', () => {
  loadCarte();
  observeFadeUp();

  document.getElementById('resa-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(e.target);
    const subject = encodeURIComponent(`Réservation Trinco — ${d.get('date')} à ${d.get('heure')}`);
    const body = encodeURIComponent(
      `Bonjour Jean-Mi & Charlotte,\n\nDemande de réservation :\n\n` +
      `Nom : ${d.get('nom')}\nDate : ${d.get('date')}\nHeure : ${d.get('heure')}\nCouverts : ${d.get('couverts')}` +
      (d.get('message') ? `\nMessage : ${d.get('message')}` : '') +
      `\n\nMerci !`
    );
    window.location.href = `mailto:contact@letrinco.fr?subject=${subject}&body=${body}`;
  });
});
