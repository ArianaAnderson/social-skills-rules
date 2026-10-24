/* Optional first-party site integration. No secrets or user-entered data. */
(() => {
  'use strict';
  if (window.FGAnalytics) return;
  const tag = document.currentScript;
  const id = tag?.dataset.gaId;
  if (!/^G-[A-Z0-9]+$/.test(id || '')) return;
  const live = location.protocol === 'https:' &&
    ['familygallerytv.com', 'books.familygallerytv.com'].includes(location.hostname);
  const key = 'fg.analytics.choice.v1';
  const cookiePrefix = 'fgv';
  const habits = new Set([
    'habit-personal-space','habit-objects-away-from-faces','habit-ask-before-touching',
    'habit-different-preferences','habit-waiting-to-speak','habit-reciprocal-friendships',
    'habit-answer-the-question','habit-ask-about-their-interests','habit-join-a-game',
    'habit-respect-no','habit-flexible-play','habit-get-adult-help','habit-specific-parent-feedback'
  ]);
  const blocked = navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === '1' || window.doNotTrack === '1';
  let memory = null, loaded = false, enabled = false, pageViewed = false, status = '';
  const read = () => {
    try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v?.choice; }
    catch { return memory; }
  };
  const write = choice => {
    memory = choice;
    try { localStorage.setItem(key, JSON.stringify({choice, version:1, at:Date.now()})); } catch {}
  };
  const cleanURL = () => {
    const u = new URL(location.origin + location.pathname);
    const q = new URLSearchParams(location.search);
    for (const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']) {
      const v = q.get(k);
      if (v && /^[a-z0-9_-]{1,96}$/i.test(v)) u.searchParams.set(k, v);
    }
    return u.href;
  };
  const resource = () => habits.has(location.hash.slice(1)) ? location.hash.slice(1) : '';
  const referrer = () => { try { return new URL(document.referrer).origin + '/'; } catch { return ''; } };
  const send = (name, params = {}) => {
    if (!live || !enabled || blocked) return;
    window.gtag('event', name, {
      send_to:id, page_location:cleanURL(), page_referrer:referrer(),
      ...params
    });
  };
  const eraseCookies = () => {
    const names = document.cookie.split(';').map(v=>v.trim().split('=')[0])
      .filter(n=>n.startsWith(cookiePrefix + '_'));
    for (const name of names) for (const domain of ['', location.hostname, '.familygallerytv.com']) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain ? '; Domain='+domain : ''}`;
    }
  };
  const disable = () => {
    enabled = false;
    window['ga-disable-' + id] = true;
    eraseCookies();
  };
  const allow = () => {
    if (blocked || !live) return;
    if (enabled) return;
    enabled = true;
    window['ga-disable-' + id] = false;
    if (!loaded) {
      loaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', {
        analytics_storage:'granted', ad_storage:'denied',
        ad_user_data:'denied', ad_personalization:'denied'
      });
      window.gtag('set', 'ads_data_redaction', true);
      window.gtag('js', new Date());
      window.gtag('config', id, {
        send_page_view:false, allow_google_signals:false,
        allow_ad_personalization_signals:false, cookie_prefix:cookiePrefix,
        cookie_expires:7776000, cookie_update:false,
        page_location:cleanURL(), page_referrer:referrer()
      });
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
      script.onerror = () => { status = 'Analytics could not load. The website still works.'; updateStatus(); };
      document.head.append(script);
    }
    if (!pageViewed) {
      pageViewed = true;
      send('page_view');
      if (resource()) send('resource_view', {resource_id:resource()});
    }
  };
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = '/analytics/visitor-analytics.css';
  document.head.append(css);
  const panel = document.createElement('section');
  panel.id = 'fg-analytics-banner';
  panel.setAttribute('aria-labelledby','fg-analytics-title');
  panel.innerHTML = `<h2 id="fg-analytics-title">Your analytics choice</h2>
    <p>With your permission, we use Google Analytics to count visits, pages and retailer-link clicks. Google receives technical visit data. The site works without analytics.</p>
    <p id="fg-analytics-status" role="status"></p>
    <div class="fg-actions"><button type="button" id="fg-allow">Allow analytics</button><button type="button" id="fg-deny">Decline analytics</button></div>
    <a href="/privacy/">Privacy details</a>`;
  const opener = document.createElement('button');
  opener.type = 'button'; opener.id = 'fg-privacy-open';
  opener.textContent = 'Privacy choices';
  opener.setAttribute('aria-label','Open privacy and analytics choices');
  document.body.append(panel, opener);
  const updateStatus = () => {
    panel.querySelector('#fg-analytics-status').textContent = status ||
      (blocked ? 'Analytics is off because your browser sends a privacy signal.' :
      !live ? 'Analytics is disabled in this preview.' :
      read() === 'allow' ? 'Your saved preference allows optional analytics.' :
      read() === 'deny' ? 'Your saved preference declines optional analytics.' : '');
  };
  const open = () => { panel.hidden = false; updateStatus(); };
  const choose = choice => {
    write(choice);
    if (choice === 'allow' && !blocked) allow(); else disable();
    panel.hidden = true;
  };
  opener.addEventListener('click',open);
  panel.querySelector('#fg-allow').disabled = blocked;
  panel.querySelector('#fg-allow').addEventListener('click',()=>choose('allow'));
  panel.querySelector('#fg-deny').addEventListener('click',()=>choose('deny'));
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-fg-privacy-open]');
    if (button) { event.preventDefault(); open(); return; }
    const a = event.target.closest?.('a[href]');
    if (!a || !enabled) return;
    let u; try { u = new URL(a.href); } catch { return; }
    const h = u.hostname.replace(/^www\./,'');
    const retailer = h === 'amazon.com' || h === 'amzn.to' ? 'amazon' :
      h === 'etsy.com' || h.endsWith('.etsy.com') ? 'etsy' : '';
    if (!retailer || u.protocol !== 'https:') return;
    const asin = u.pathname.match(/\/(?:dp|gp\/product)\/(B0[A-Z0-9]{8})/i)?.[1] || '';
    send('retailer_click', {
      retailer, link_domain:h, link_url:u.origin + u.pathname,
      ...(asin ? {book_id:asin} : {}), ...(resource() ? {resource_id:resource()} : {})
    });
  });
  window.addEventListener('hashchange',()=>{if(resource()) send('resource_view',{resource_id:resource()});});
  window.addEventListener('storage', e => {
    if (e.key !== key) return;
    if (read() === 'allow' && !blocked) { if (!enabled) allow(); }
    else disable();
    updateStatus();
  });
  window.FGAnalytics = {openPreferences:open};
  if (blocked) disable();
  else if (read() === 'allow') allow();
  else disable();
  panel.hidden = blocked || ['allow','deny'].includes(read());
  updateStatus();
})();
