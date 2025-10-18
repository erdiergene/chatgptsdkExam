// Custom UX component (vanilla JS) for Campaigns

function byId(id){ return document.getElementById(id); }

function status(c){
  const now = Date.now();
  const s = c.StartDate || c.startDate; const e = c.EndDate || c.endDate;
  const sd = s ? new Date(s).getTime() : 0; const ed = e ? new Date(e).getTime() : 0;
  if (sd && sd>now) return 'Yakında';
  if (ed && ed<now) return 'Süresi Dolmuş';
  return 'Aktif';
}

function card(c){
  const title = c.Title || c.title || c.Name || c.name || 'Kampanya';
  const desc = c.Description || c.description || '';
  const badge = status(c);
  const link = c.Link || c.link || '';
  return `
  <div class="campaign-card">
    <div class="campaign-header">
      <div><div class="campaign-title">${title}</div></div>
      <div class="campaign-badge ${badge==='Aktif'?'badge-active':badge==='Yakında'?'badge-upcoming':'badge-expired'}">${badge}</div>
    </div>
    <div class="campaign-content">
      ${desc?`<div class="campaign-description">${desc}</div>`:''}
    </div>
    <div class="campaign-actions">
      ${link?`<a class="action-button btn-primary" target="_blank" href="${link}">Detayları Gör</a>`:''}
    </div>
  </div>`;
}

window.addEventListener('DOMContentLoaded', () => {
  const data = window.openai?.toolOutput || window.__campaignsData;
  const list = (data?.campaigns || data?.Campaigns || []);
  const root = byId('campaigns-container') || byId('root') || document.body;
  if (!list.length){
    root.innerHTML = '<div class="no-campaigns"><h3>🎯 Kampanya Bulunamadı</h3></div>';
    return;
  }
  root.innerHTML = `<div class="campaigns-grid">${list.map(card).join('')}</div>`;
});


