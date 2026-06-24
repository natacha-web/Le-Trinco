// ===== TRINCO — main.js =====

// Burger menu
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
burger?.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Nav scroll opacity
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 60) {
    nav.style.background = 'rgba(44,31,14,0.98)';
  } else {
    nav.style.background = 'rgba(44,31,14,0.92)';
  }
});

// ===== Chargement de la carte depuis JSON =====
async function loadCarte() {
  try {
    const res = await fetch('/_data/carte.json');
    const data = await res.json();
    renderCarte(data);
    renderAvis();
    renderHoraires(data.horaires);
  } catch (e) {
    console.error('Erreur chargement carte:', e);
  }
}

function stars(n) {
  return '★'.repeat(parseInt(n)) + '☆'.repeat(5 - parseInt(n));
}

function renderCarte(data) {
  const tabs = document.querySelectorAll('.tab-btn');
  const carteContainer = document.getElementById('carte-content');

  const renderSection = (key) => {
    carteContainer.innerHTML = '';

    if (key === 'vins') {
      data.vins.forEach(cat => {
        const section = document.createElement('div');
        section.className = 'vins-section';
        section.innerHTML = `<div class="vins-categorie">${cat.categorie}</div>`;
        cat.items.forEach(v => {
          section.innerHTML += `
            <div class="vin-item">
              <div class="vin-info">
                <div class="vin-nom">${v.nom}</div>
                <div class="vin-region">${v.region}</div>
              </div>
              <div class="vin-prix">
                <div><span>verre</span><strong>${v.prix_verre}€</strong></div>
                <div><span>bouteille</span><strong>${v.prix_bouteille}€</strong></div>
              </div>
            </div>`;
        });
        carteContainer.appendChild(section);
      });
      return;
    }

    const items = data[key] || [];
    const grid = document.createElement('div');
    grid.className = 'carte-grid';
    items.forEach(item => {
      grid.innerHTML += `
        <div class="carte-item">
          <div class="carte-item-header">
            <div class="carte-item-nom">${item.nom}</div>
            <div class="carte-item-prix">${item.prix}€</div>
          </div>
          <div class="carte-item-desc">${item.description}</div>
        </div>`;
    });
    carteContainer.appendChild(grid);
  };

  // Init avec "planches"
  renderSection('planches');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSection(tab.dataset.section);
    });
  });
}

async function renderAvis() {
  try {
    const res = await fetch('/_data/avis.json');
    const data = await res.json();
    const grid = document.getElementById('avis-grid');
    if (!grid) return;
    grid.innerHTML = '';
    data.avis.forEach(a => {
      grid.innerHTML += `
        <div class="avis-card">
          <div class="avis-stars">${stars(a.note)}</div>
          <p class="avis-texte">"${a.texte}"</p>
          <div class="avis-auteur">${a.prenom} <span class="avis-date">— ${a.date}</span></div>
        </div>`;
    });
  } catch (e) {
    console.error('Erreur avis:', e);
  }
}

function renderHoraires(h) {
  if (!h) return;
  const el = document.getElementById('horaires-content');
  if (!el) return;
  el.innerHTML = `
    <table class="horaires-table">
      <tr><td>Mardi – Samedi</td><td>${h.mardi_samedi}</td></tr>
      <tr><td>Dimanche & Lundi</td><td>${h.dimanche_lundi}</td></tr>
    </table>
    <div class="privatisation-note">🎉 ${h.note} — <a href="mailto:contact@letrinco.fr" style="color:inherit">Nous contacter pour une privatisation</a></div>
  `;
}

// ===== Formulaire de réservation =====
document.addEventListener('DOMContentLoaded', () => {
  loadCarte();

  const form = document.getElementById('resa-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nom = data.get('nom');
    const date = data.get('date');
    const heure = data.get('heure');
    const couverts = data.get('couverts');
    const message = data.get('message') || '';
    const subject = encodeURIComponent(`Réservation Trinco — ${date} à ${heure}`);
    const body = encodeURIComponent(
      `Bonjour Jean-Mi & Charlotte,\n\nJe souhaite réserver une table :\n\n` +
      `Nom : ${nom}\nDate : ${date}\nHeure : ${heure}\nCouverts : ${couverts}\n` +
      (message ? `\nMessage : ${message}` : '') +
      `\n\nMerci !`
    );
    window.location.href = `mailto:contact@letrinco.fr?subject=${subject}&body=${body}`;
  });
});
