'use strict';
// The short page behind the try-it flow: the Pro price switch, the footer year,
// and keeping the Windows download links on the newest release.

// Pro prices. Change them here only.
const BILLING = {
  monthly:  { amount: '₱49',  period: 'per month', note: 'One month of Pro. Return to Free when it ends.' },
  yearly:   { amount: '₱199', period: 'per year',  note: '12 months from activation. About ₱17 a month.' },
  lifetime: { amount: '₱499', period: 'one-time',  note: 'Pay once. Every update, for good.' },
};

const billingButtons = [...document.querySelectorAll('[data-billing]')];
billingButtons.forEach(button => button.addEventListener('click', () => {
  const plan = BILLING[button.dataset.billing];
  billingButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  document.querySelector('#pro-amount').textContent = plan.amount;
  document.querySelector('#pro-period').textContent = plan.period;
  document.querySelector('#pro-footnote').textContent = plan.note;
}));

document.querySelector('#year').textContent = new Date().getFullYear();

// The release script writes the newest links into this page; version.json is read too,
// so a release published from the app side is picked up even before the page is edited.
const PRO_ZIP = /^https:\/\/github\.com\/homearvin\/QUICK\.CHECK\/releases\/download\/v[\d.]+\/QuickCheckPro-[\d.]+-portable\.zip$/;
fetch('version.json', { cache: 'no-cache' })
  .then(response => { if (!response.ok) throw new Error('version.json unavailable'); return response.json(); })
  .then(manifest => {
    const pack = manifest.packages && manifest.packages.pro;
    if (!pack || !PRO_ZIP.test(pack.url)) return;
    const installer = pack.url.replace(/-portable\.zip$/, '-setup.exe');
    document.querySelectorAll('a[href*="/releases/download/"]').forEach(link => {
      if (link.href.endsWith('-portable.zip')) link.href = pack.url;
      else if (link.href.endsWith('-setup.exe')) link.href = installer;
    });
  })
  .catch(() => { /* the links written in the page still work */ });
