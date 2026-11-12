'use strict';

// Captures of the real QuickCheck UI, rendered only from its invented demo class.
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
document.querySelectorAll('svg').forEach(element => element.setAttribute('aria-hidden', 'true'));

const stage = document.querySelector('.product-theatre');
const sceneButtons = [...document.querySelectorAll('[data-scene-button]')];
const motionButton = document.querySelector('#motion-toggle');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const scenes = ['scan', 'review', 'save'];
let playing = false;
let timer = null;
let hasAutoplayed = false;
let pausedByVisibility = false;
let sceneIndex = 0;
function showScene(name) {
  sceneIndex = scenes.indexOf(name);
  stage.dataset.scene = name;
  sceneButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sceneButton === name)));
  document.querySelectorAll('[data-screen]').forEach(screen => {
    const active = screen.dataset.screen === name;
    screen.classList.toggle('is-active', active);
    screen.setAttribute('aria-hidden', String(!active));
  });
}
function updateMotionButton() {
  motionButton.innerHTML = icon(playing ? 'pause' : 'play') + `<span>${playing ? 'Pause demo' : sceneIndex === 2 ? 'Replay demo' : 'Play demo'}</span>`;
  motionButton.setAttribute('aria-label', playing ? 'Pause product animation' : 'Play product animation');
}
function stopAnimation() {
  clearTimeout(timer);
  playing = false;
  stage.classList.remove('is-playing');
  stage.classList.add('is-paused');
  updateMotionButton();
}
function scheduleScene() {
  timer = setTimeout(() => {
    if (!playing) return;
    if (sceneIndex === 2) { stopAnimation(); return; }
    showScene(scenes[sceneIndex + 1]);
    scheduleScene();
  }, sceneIndex === 0 ? 3200 : 2600);
}
function playAnimation(restart = false) {
  clearTimeout(timer);
  if (restart || sceneIndex === 2) showScene('scan');
  playing = true;
  hasAutoplayed = true;
  stage.classList.remove('is-paused');
  stage.classList.add('is-playing');
  updateMotionButton();
  scheduleScene();
}
sceneButtons.forEach(button => button.addEventListener('click', () => {
  stopAnimation();
  hasAutoplayed = true;
  showScene(button.dataset.sceneButton);
  updateMotionButton();
}));
motionButton.addEventListener('click', () => playing ? stopAnimation() : playAnimation());
showScene('scan');
const stageObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !hasAutoplayed && !reduceMotion.matches) playAnimation(true);
    else if (!entry.isIntersecting && playing) { pausedByVisibility = true; stopAnimation(); }
    else if (entry.isIntersecting && pausedByVisibility && !reduceMotion.matches) { pausedByVisibility = false; playAnimation(); }
  });
}, {threshold: .35});
stageObserver.observe(stage);
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stopAnimation(); });
reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) stopAnimation(); });

// Reveal each block once, with the full content available when motion is reduced.
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('has-motion');
  const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); }
  }), {threshold: .12});
  document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));

const billing = {
  monthly: ['₱49', 'per month', 'One month of Pro. Return to Free when it ends.', 'Monthly'],
  yearly: ['₱199', 'per year', '12 months from activation. About ₱17 a month.', 'Yearly'],
  lifetime: ['₱499', 'one-time', 'Pay once. Every update, for good.', 'Lifetime']
};
document.querySelectorAll('[data-billing]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-billing]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  const selected = billing[button.dataset.billing];
  document.querySelector('#pro-amount').textContent = selected[0];
  document.querySelector('#pro-period').textContent = selected[1];
  document.querySelector('#pro-footnote').textContent = selected[2];
  document.querySelector('#pro-contact').href = '#buy';
  document.querySelector('#pro-contact').setAttribute('aria-label', `Get QuickCheck Pro — ${selected[3]}`);
}));

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Open menu'); }
menuToggle.addEventListener('click', () => {
  const open = !navigation.classList.contains('is-open');
  navigation.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('is-open')) { closeMenu(); menuToggle.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.nav-wrap')) closeMenu(); });
document.querySelector('#year').textContent = new Date().getFullYear();

// Follow the existing release manifest; the signed updater feed itself is untouched.
fetch('version.json', {cache:'no-cache'}).then(response => {
  if (!response.ok) throw new Error('Manifest unavailable');
  return response.json();
}).then(manifest => {
  const pack = manifest.packages && manifest.packages.pro;
  if (!pack || !/^https:\/\/github\.com\/homearvin\/QUICK\.CHECK\/releases\/download\/v[\d.]+\/QuickCheckPro-[\d.]+-portable\.zip$/.test(pack.url)) return;
  const installer = pack.url.replace(/-portable\.zip$/, '-setup.exe');
  document.querySelectorAll('a[href*="/releases/download/"]').forEach(link => {
    if (link.href.endsWith('-portable.zip')) link.href = pack.url;
    else if (link.href.endsWith('-setup.exe')) link.href = installer;
  });
}).catch(() => { /* The verified release links in the HTML remain usable offline. */ });
