// Custom UX component (vanilla JS) for Exchange Rates
// Uses window.openai API: reads toolOutput, requests fullscreen on mobile, persists selection

function detectMobile() {
  try {
    return (window.openai?.userAgent?.device?.type || 'unknown') !== 'desktop';
  } catch {
    return true;
  }
}

function byId(id) { return document.getElementById(id); }

function formatRate(rate) {
  if (!rate) return 'N/A';
  const n = Number(rate);
  if (Number.isNaN(n)) return String(rate);
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function flagFor(currency) {
  const flags = { USD:'🇺🇸', EUR:'🇪🇺', GBP:'🇬🇧', JPY:'🇯🇵', CHF:'🇨🇭', CAD:'🇨🇦', AUD:'🇦🇺',
    SEK:'🇸🇪', NOK:'🇳🇴', DKK:'🇩🇰', CNY:'🇨🇳', SAR:'🇸🇦', AED:'🇦🇪', TRY:'🇹🇷' };
  return flags[currency] || '💱';
}

async function maybeFullscreen() {
  try {
    if (detectMobile()) {
      await window.openai?.requestDisplayMode?.({ mode: 'fullscreen' });
    }
  } catch {}
}

function renderRates(root, data, widget) {
  const list = (data?.exchangeRates || data?.rates || data?.FxRates || []).map(r => ({
    currency: (r.Currency || r.CurrencyCode || r.currency || '').toString().toUpperCase(),
    buy: r.BuyRate ?? r.buyRate,
    sell: r.SellRate ?? r.sellRate
  }));

  if (list.length === 0) {
    root.innerHTML = '<div class="error">❌ Veri bulunamadı</div>';
    return;
  }

  const selected = widget?.selected || list[0].currency;
  const cards = list.map(item => `
    <button class="rate-card" data-c="${item.currency}">
      <div class="currency-header">
        <div class="currency-name">${flagFor(item.currency)} ${item.currency}</div>
      </div>
      <div class="rates-row">
        <div class="rate-item buy-rate">
          <div class="rate-label">Alış</div>
          <div class="rate-value">${formatRate(item.buy)}</div>
        </div>
        <div class="rate-item sell-rate">
          <div class="rate-label">Satış</div>
          <div class="rate-value">${formatRate(item.sell)}</div>
        </div>
      </div>
    </button>
  `).join('');

  root.innerHTML = `<div class="rates-grid">${cards}</div>`;
  root.querySelectorAll('.rate-card').forEach(btn => {
    btn.addEventListener('click', async () => {
      const c = btn.getAttribute('data-c');
      try { await window.openai?.setWidgetState?.({ selected: c }); } catch {}
    });
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  const data = window.openai?.toolOutput || window.__exchangeRatesData;
  const widget = window.openai?.widgetState || null;
  await maybeFullscreen();
  const root = byId('rates-container') || byId('root') || document.body;
  renderRates(root, data, widget);
});


