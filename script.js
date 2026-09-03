document.addEventListener('DOMContentLoaded', () => {
  
  let state = { coins: 0, inventory: [], nextId: 1, keys: 0 };
  function saveState(){ localStorage.setItem('site_state', JSON.stringify(state)); }
  function loadState(){ try{ const s = JSON.parse(localStorage.getItem('site_state')); if(s) state = Object.assign(state, s); }catch(e){} }
  loadState();

  
  let lang = localStorage.getItem('site_lang') || 'en';
  const translations = {
    en: {
      'nav.home':'Home','nav.inventory':'Inventory','nav.topup':'Top Up','nav.store':'Store',
      'welcome.title':'Welcome','welcome.desc':'Bright, friendly design with a pale orange/yellow theme and red accents.',
      'spin.button':'Spin the Wheel','spin.note':'Possible rewards: coins, crates, collectables',
      'feature.title':'Feature','feature.desc':'Responsive layout, sidebar navigation, and colorful accents.','fast.title':'Fast','fast.desc':'Lightweight, works on most devices and screen sizes.',
      'inventory.title':'Inventory','inventory.desc':'Browse items available.','inventory.empty':'Inventory is empty',
      'topup.title':'Top Up','topup.desc':'Choose an amount in euros.','topup.notice':'',
      'payment.title':'Complete Payment','payment.demo':'Demo payment — no real transactions are made.','payment.amount':'Amount:','payment.method':'Choose method','payment.confirm':'Confirm Payment','payment.cancel':'Cancel','payment.processing':'Processing…',
      'store.title':'Store','store.desc':'Buy crates with your coins.','crate.common.title':'Common Crate','crate.common.desc':'Higher chance for coins, small chance for collectables.','crate.rare.title':'Rare Crate','crate.rare.desc':'Better rewards and higher coin amounts.','crate.epic.title':'Epic Crate','crate.epic.desc':'Best rewards and highest chance for collectables.','buy.common':'Buy Common','buy.rare':'Buy Rare','buy.epic':'Buy Epic',
      'buy.key':'Buy Key (1000)','coins':'coins','keys':'keys',
      'msg.not_enough_coins':'Not enough coins','msg.need_key':'You need a key to spin','msg.key_purchased':'Key purchased','msg.crate_purchased':'You purchased a {tier} crate',
      'reward.coins':'You received {n} coins','reward.crate':'You received a {rarity} crate','reward.collectable':'You received a collectable',
      'label.collectable':'Collectable','label.unopened':'Unopened','label.unnamed':'Unnamed','button.open':'Open',
      'collectables.title':'Collectables','collectables.desc':'List of all possible collectables. Images are placeholders — replace with real images in the images/ folder.','collectables.empty':'No collectables defined yet.'
    },
    nl: {
      'nav.home':'Start','nav.inventory':'Voorraad','nav.topup':'Opwaarderen','nav.store':'Winkel',
      'welcome.title':'Welkom','welcome.desc':'Fel, vriendelijk ontwerp met een bleek oranje/geel thema en rode accenten.',
      'spin.button':'Draai het wiel','spin.note':'Mogelijke beloningen: munten, kisten, verzamelobjecten',
      'feature.title':'Kenmerk','feature.desc':'Responsieve indeling, zijbalknavigatie en kleurrijke accenten.','fast.title':'Snel','fast.desc':'Lichtgewicht, werkt op de meeste apparaten en schermformaten.',
      'inventory.title':'Voorraad','inventory.desc':'Bekijk beschikbare items.','inventory.empty':'Voorraad is leeg',
      'topup.title':'Opwaarderen','topup.desc':'Kies een bedrag in euro.','topup.notice':'',
      'payment.title':'Voltooi betaling','payment.demo':'Demobetaling — er worden geen echte transacties uitgevoerd.','payment.amount':'Bedrag:','payment.method':'Kies methode','payment.confirm':'Bevestig betaling','payment.cancel':'Annuleren','payment.processing':'Bezig…',
      'store.title':'Winkel','store.desc':'Koop kisten met je munten.','crate.common.title':'Gewone Kist','crate.common.desc':'Hogere kans op munten, kleine kans op verzamelobjecten.','crate.rare.title':'Zeldzame Kist','crate.rare.desc':'Betere beloningen en hogere munthoeveelheden.','crate.epic.title':'Epische Kist','crate.epic.desc':'Beste beloningen en grote kans op verzamelobjecten.','buy.common':'Koop Gewoon','buy.rare':'Koop Zeldzaam','buy.epic':'Koop Episch',
      'buy.key':'Koop Sleutel (1000)','coins':'munten','keys':'sleutels',
      'msg.not_enough_coins':'Niet genoeg munten','msg.need_key':'Je hebt een sleutel nodig om te draaien','msg.key_purchased':'Sleutel gekocht','msg.crate_purchased':'Je kocht een {tier} kist',
      'reward.coins':'Je kreeg {n} munten','reward.crate':'Je kreeg een {rarity} kist','reward.collectable':'Je kreeg een verzamelobject',
      'label.collectable':'Verzamelobject','label.unopened':'Ongeopend','label.unnamed':'Naamloos','button.open':'Openen',
      'collectables.title':'Verzamelobjecten','collectables.desc':'Lijst van alle mogelijke verzamelobjecten. Afbeeldingen zijn tijdelijke aanduidingen — vervang ze met echte afbeeldingen in de images-map.','collectables.empty':'Nog geen verzamelobjecten gedefinieerd.'
    }
  };

  function t(key, vars){
    const bucket = translations[lang] || translations.en;
    let s = bucket[key] || key;
    if(vars){
      for(const k in vars){ s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]); }
    }
    return s;
  }

  
  function setTextSafe(el, text){ if(!el) return; if(el.children.length===0) el.textContent = text; else {
    
    let replaced = false; for(const node of Array.from(el.childNodes)){ if(node.nodeType===Node.TEXT_NODE){ node.nodeValue = text; replaced = true; break; } }
    if(!replaced) el.insertBefore(document.createTextNode(text), el.firstChild);
  }}

  function applyTranslations(){ document.querySelectorAll('[data-i18n]').forEach(el=>{ const key = el.dataset.i18n; if(!key) return; setTextSafe(el, t(key)); });
    const langBtn = document.getElementById('langToggle'); if(langBtn) langBtn.textContent = lang==='nl'?'NL':'EN'; }

  function replaceNode(el){ if(!el || !el.parentNode) return el; const n = el.cloneNode(true); el.parentNode.replaceChild(n, el); return n; }
  function replaceAll(selector){ return Array.from(document.querySelectorAll(selector)).map(el => replaceNode(el)); }

  
  function updateDisplays(){ const coinEl = document.getElementById('coinCount'); if(coinEl) coinEl.textContent = state.coins; const keyEl = document.getElementById('keyCount'); if(keyEl) keyEl.textContent = state.keys; saveState(); }

  
  function renderInventory(){ const grid = document.getElementById('inventoryGrid'); if(!grid) return; grid.innerHTML=''; if(state.inventory.length===0){ const d = document.createElement('div'); d.className='notice'; d.textContent = t('inventory.empty'); grid.appendChild(d); return; }
    state.inventory.forEach(item => {
      const div = document.createElement('div'); div.className='inventory-item';
      // Add a sell button which will be shown on hover via CSS.
      // It contains a data-id attribute so we can remove the correct item and pay coins.
      const sellBtnHtml = `<button class="btn sell-item" data-id="${item.id}" aria-label="Sell item">Sell</button>`;
      if(item.type==='crate'){
        const title = t(`crate.${item.rarity}.title`) || (item.rarity? item.rarity[0].toUpperCase()+item.rarity.slice(1)+' Crate':'Crate');
        div.innerHTML = `${sellBtnHtml}<h4>${title}</h4><div class="muted">${t('label.unopened')}</div><button class="btn open-crate" data-id="${item.id}">${t('button.open')}</button>`;
      } else {
        const collectibleName = item.name || t('label.unnamed');
        div.innerHTML = `${sellBtnHtml}<h4>${collectibleName}</h4><div class="muted">${t('label.collectable')}</div>`;
      }
      grid.appendChild(div);
    });
    
    // Open crate buttons (existing behaviour)
    grid.querySelectorAll('.open-crate').forEach(b => b.addEventListener('click', e => {
      const id = Number(b.dataset.id); openCrate(id);
    }));

    // Sell buttons: remove item when clicked and credit coins based on rarity.
    const sellPrices = { common:50, rare:100, epic:150, legendary:250 };
    grid.querySelectorAll('.sell-item').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation(); // prevent any parent handlers
      const id = Number(b.dataset.id);
      if(!Number.isFinite(id)) return;
      if(!confirm('Sell this item from your inventory?')) return;
      const idx = state.inventory.findIndex(i => i.id === id);
      if(idx === -1) return;
      const itemObj = state.inventory[idx];
      const rarity = (itemObj && itemObj.rarity) ? itemObj.rarity : 'common';
      const amount = sellPrices[rarity] || 0;
      // Remove item and credit coins
      state.inventory.splice(idx,1);
      state.coins = (state.coins || 0) + amount;
      saveState();
      renderInventory();
      updateDisplays();
      showPopup(`Sold for ${amount} coins`);
    }));
  }

  
  function addCoins(n){ state.coins += n; updateDisplays(); showRewardModal(t('reward.coins',{n})); }
  function addCrate(r){ state.inventory.push({id: state.nextId++, type:'crate', rarity: r}); saveState(); renderInventory(); showRewardModal(t(`crate.${r}.title`)||'Crate', t('reward.crate',{rarity: t(`crate.${r}.title`)})); }
  function addCollectable(){ state.inventory.push({id: state.nextId++, type:'collectable'}); saveState(); renderInventory(); showRewardModal(t('reward.collectable')); }
  function buyKey(){ const cost = 1000; if(state.coins < cost){ showPopup(t('msg.not_enough_coins')); return; } state.coins -= cost; state.keys += 1; updateDisplays(); showPopup(t('msg.key_purchased')); }

  
  function randChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function placeholderOutcome(slotName){
    return { type: 'placeholder', slot: slotName, label: '-moet nog komen-' };
  }

// =========================
// RARITY ODDS
// =========================

const rarityOdds = {
  common: 60,
  rare: 30,
  epic: 8,
  legendary: 2
};


// =========================
// ITEMS PER RARITY
// =========================

const rarityItems = {

  common: [
    { type: 'coins', amount: 125, name: '125 coins' },
    { type: 'coins', amount: 600, name: '400 coins' },
    { type: 'crate', rarity: 'common', name: 'Common Crate' }
  ],

  rare: [
    { type: 'collectable', name: 'Hond', image: 'dog.jpg', description: 'A loyal companion — brings charm and a warm presence to your collection.', description_nl: 'Een trouwe metgezel — brengt charme en warmte aan je verzameling.' },
    { type: 'collectable', name: 'Kat', image: 'cat.jpg', description: 'Sleek and mysterious — collectors prize its elegance and playful attitude.', description_nl: 'Soepele en mysterieuze metgezel — verzamelaars waarderen zijn elegantie en speelsheid.' },
    { type: 'crate', rarity: 'rare', name: 'Rare Crate' }
  ],

  epic: [
    { type: 'collectable', name: 'Leeuw', image: 'leeuw.jpg', description: 'A majestic lion — a bold statement piece that signals prestige.', description_nl: 'Een majestueuze leeuw — een gedurfd pronkstuk dat prestige uitstraalt.' },
    { type: 'collectable', name: 'Krokodil', image: 'crocodile.jpg', description: 'A fierce trophy — perfect for daring collectors who love the extraordinary.', description_nl: 'Een gedurfde trofee — perfect voor durfals die het buitengewone willen.' },
    { type: 'crate', rarity: 'epic', name: 'Epic Crate' }
  ],

  legendary: [
    { type: 'collectable', name: 'Gouden Bever', image: 'golden beaver.png', description: 'A dazzling golden beaver — the ultimate trophy that sparkles in any collection.', description_nl: 'Een fonkelende gouden bever — de ultieme trofee die in elke verzameling schittert.' },
    { type: 'collectable', name: 'Draak', image: 'dragon.jpg', description: 'An ancient dragon — legendary and awe-inspiring, prized by top collectors.', description_nl: 'Een oeroude draak — legendarisch en indrukwekkend, geliefd bij topverzamelaars.' },
    { type: 'collectable', name: 'Griffen', image: 'griffen.jpg', description: 'A mythical griffin — guardian of treasures and highly coveted for its rarity.', description_nl: 'Een mythische griffioen — bewaker van schatten en zeer gewild vanwege zijn zeldzaamheid.' },
    { type: 'keys', amount: 1, name: '1 Key' },
    { type: 'keys', amount: 2, name: '2 Keys' }
  ]

};


// =========================
// RANDOM RARITY
// =========================

function randomRarity(odds = rarityOdds) {

  const roll = Math.random() * 100;

  let total = 0;

  for (const rarity in odds) {

    total += odds[rarity];

    if (roll < total) {
      return rarity;
    }

  }

  return 'common';
}


// =========================
// RANDOM ITEM FROM RARITY
// =========================

function randomItemFromRarity(rarity) {

  const list = rarityItems[rarity];

  if (!list || list.length === 0) {
    return null;
  }

  return list[Math.floor(Math.random() * list.length)];
}


// =========================
// WHEEL
// =========================

function spinOutcome() {

  const rarity = randomRarity();

  const item = randomItemFromRarity(rarity);

  if (!item) return null;

  return {
    ...item,
    rarity: rarity
  };
}


// =========================
// CRATE
// =========================

function spinOutcomeForCrate(crateRarity) {

  // Iedere crate kan zijn eigen rarity odds hebben.
  // Voorlopig gebruikt hij dezelfde odds.

  const rarity = randomRarity();

  const item = randomItemFromRarity(rarity);

  if (!item) return null;

  return {
    ...item,
    rarity: rarity
  };
}

function applyOutcome(o) {

  if (!o) return;

  // Coins
  if (o.type === 'coins') {

    addCoins(o.amount);

    showRewardModal(
      o.rarity.toUpperCase(),
      `${o.name} (${o.rarity})`
    );

  }

  // Crate
  else if (o.type === 'crate') {

    addCrate(o.rarity);

    showRewardModal(
      o.rarity.toUpperCase(),
      `${o.name} (${o.rarity})`
    );

  }

  // Keys
  else if (o.type === 'keys') {

    state.keys += o.amount;

    updateDisplays();

    showRewardModal(
      o.rarity.toUpperCase(),
      `${o.name} (${o.rarity})`
    );

  }

  // Collectable
  else if (o.type === 'collectable') {

    state.inventory.push({
      id: state.nextId++,
      type: 'collectable',
      name: o.name,
      rarity: o.rarity
    });

    saveState();
    renderInventory();

    showRewardModal(
      o.rarity.toUpperCase(),
      `${o.name} (${o.rarity})`
    );

  }

}

  
  function showPopup(text){ const div = document.createElement('div'); div.className='reward-popup'; div.textContent = text; document.body.appendChild(div); requestAnimationFrame(()=>div.style.opacity=1); setTimeout(()=>{ div.style.opacity=0; setTimeout(()=>div.remove(),400); },3000); }
  function showRewardModal(title, text){ const modal = document.getElementById('rewardModal'); const content = document.getElementById('rewardContent'); if(!modal || !content){ return showPopup(text || title); } content.innerHTML = `<h2>${title || ''}</h2><p>${text||''}</p>`; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); }

  function openCrate(id){ const idx = state.inventory.findIndex(i => i.id===id && i.type==='crate'); if(idx===-1) return; const crate = state.inventory.splice(idx,1)[0]; saveState(); renderInventory(); const outcome = spinOutcomeForCrate(crate.rarity||'common'); applyOutcome(outcome); }

  
  function bindUi(){
    applyTranslations();
    
    const spinBtn = replaceNode(document.getElementById('spinBtn'));
    const wheel = document.getElementById('wheel');
    if(spinBtn){ spinBtn.onclick = null; spinBtn.addEventListener('click', ()=>{
      if(spinBtn.disabled) return; if(state.keys<=0){ showPopup(t('msg.need_key')); return; } state.keys -= 1; updateDisplays(); spinBtn.disabled = true; const spins = Math.floor(Math.random()*6)+6; const deg = spins*360 + Math.floor(Math.random()*360); if(wheel) wheel.style.transform = `rotate(${deg}deg)`; setTimeout(()=>{ const outcome = spinOutcome(); applyOutcome(outcome); spinBtn.disabled = false; },3200);
    }); }

    
    // Top-up buttons: use event delegation on the container so cloned
    // nodes or dynamically replaced buttons still work.
    const topupForm = document.getElementById('topupForm');
    if(topupForm){
      topupForm.addEventListener('click', (ev) => {
        const btn = ev.target.closest('.topup-option');
        if(!btn || !topupForm.contains(btn)) return;
        const amt = Number(btn.dataset.amount) || 0;
        console.log('Top-up option clicked:', amt);
        const paymentModal = document.getElementById('paymentModal');
        const paymentAmount = document.getElementById('paymentAmount');
        const paymentProcessing = document.getElementById('paymentProcessing');
        if(paymentAmount) paymentAmount.textContent = `€${amt}`;
        if(paymentProcessing) paymentProcessing.setAttribute('aria-hidden','true');
        if(paymentModal) paymentModal.setAttribute('aria-hidden','false');
        pendingTopup = amt;
      });
    }

    
    const paymentClose = replaceNode(document.getElementById('paymentClose'));
    const cancelPayment = replaceNode(document.getElementById('cancelPayment')) || replaceNode(document.getElementById('cancelPayment'));
    const confirmPayment = replaceNode(document.getElementById('confirmPayment'));
    const paymentProcessing = document.getElementById('paymentProcessing');
    if(paymentClose) paymentClose.addEventListener('click', ()=>{ const pm = document.getElementById('paymentModal'); if(pm) pm.setAttribute('aria-hidden','true'); });
    if(cancelPayment) cancelPayment.addEventListener('click', ()=>{ const pm = document.getElementById('paymentModal'); if(pm) pm.setAttribute('aria-hidden','true'); });
    if(confirmPayment) confirmPayment.addEventListener('click', ()=>{
      console.log('Confirm payment clicked, pendingTopup=', pendingTopup);
      if(paymentProcessing) paymentProcessing.setAttribute('aria-hidden','false'); setTimeout(()=>{ const gained = (pendingTopup||0)*10; addCoins(gained); const pm = document.getElementById('paymentModal'); if(pm) pm.setAttribute('aria-hidden','true'); if(paymentProcessing) paymentProcessing.setAttribute('aria-hidden','true'); const topupNotice = document.getElementById('topupNotice'); if(topupNotice) topupNotice.textContent = `${t('topup.title')} €${pendingTopup} — ${t('reward.coins',{n:gained})}`; pendingTopup = 0; }, 1200);
    });

    
    const buyKeyBtn = replaceNode(document.getElementById('buyKeyBtn'));
    if(buyKeyBtn) buyKeyBtn.addEventListener('click', ()=> buyKey());

    
    replaceAll('.buy-crate').forEach(b => b.addEventListener('click', ()=>{
      const tier = b.dataset.tier || 'common'; const prices = { common:100, rare:250, epic:600 }; const price = prices[tier]||prices.common; if(state.coins < price){ showPopup(t('msg.not_enough_coins')); return; } state.coins -= price; state.inventory.push({id: state.nextId++, type:'crate', rarity: tier}); saveState(); renderInventory(); updateDisplays(); showPopup(t('msg.crate_purchased',{tier: t(`crate.${tier}.title`)}));
    }));

    
    const rewardClose = replaceNode(document.getElementById('rewardClose'));
    const rewardModal = document.getElementById('rewardModal');
    if(rewardClose) rewardClose.addEventListener('click', ()=>{ if(rewardModal){ rewardModal.classList.add('hidden'); rewardModal.setAttribute('aria-hidden','true'); } });

    

    
    replaceAll('.sidebar nav a').forEach(a=> a.addEventListener('click', (e)=>{ const href = a.getAttribute('href'); if(href && href.startsWith('#')){ e.preventDefault(); const target = a.dataset.target; if(target){ document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id===target)); } } }));
    const ham = replaceNode(document.getElementById('hamburger'));
    if(ham) ham.addEventListener('click', ()=>{ const sidebar = document.getElementById('sidebar'); if(sidebar) sidebar.classList.toggle('open'); });

  }

  let pendingTopup = 0;

  
  function replaceNode(x){ if(!x) return null; try{ const el = x instanceof HTMLElement ? x : (typeof x==='string'? document.querySelector(x): x); if(!el || !el.parentNode) return el; const n = el.cloneNode(true); el.parentNode.replaceChild(n, el); return n; }catch(e){ return x; } }
  function replaceAll(sel){ return Array.from(document.querySelectorAll(sel)).map(el=>{ if(!el.parentNode) return el; const n = el.cloneNode(true); el.parentNode.replaceChild(n, el); return n; }); }

  // Expose the rarity items so other pages (collectables page) can access them.
  window.rarityItems = rarityItems;

  /**
   * Render the "Collectables" page if it exists on the current document.
   * It iterates `rarityItems` and creates a simple card per collectable item.
   * Images are left as placeholders — the HTML includes an <img> tag with a
   * `data-src` so you can drop actual image filenames later.
   */
  function renderCollectablesPage(){
    const grid = document.getElementById('collectablesGrid');
    if(!grid) return;
    grid.innerHTML = '';
    // Build a flat list of collectables from rarityItems
    const list = [];
    for(const rarity in rarityItems){
      rarityItems[rarity].forEach(it => {
        if(it.type === 'collectable') list.push(Object.assign({rarity}, it));
      });
    }
    if(list.length === 0){ const d = document.createElement('div'); d.className='notice'; d.textContent = t('collectables.empty'); grid.appendChild(d); return; }
    list.forEach((it, idx) => {
      const card = document.createElement('div'); card.className = 'collectable-card';
      // Choose the image (allow spaces in filenames)
      const imgSrc = it.image ? encodeURI(it.image) : `images/placeholder-${idx%6}.png`;
      // Localized description: prefer a language-specific property if present
      const desc = (lang === 'nl' && it.description_nl) ? it.description_nl : (it.description || (lang === 'nl' ? 'Geen beschrijving.' : 'No description yet.'));
      card.innerHTML = `
        <div class="thumb"><img src="${imgSrc}" alt="${it.name || 'Collectable'}"></div>
        <div class="info"><h4>${it.name || 'Unnamed'}</h4><div class="muted">${it.rarity || ''}</div>
        <p class="desc">${desc}</p></div>
      `;
      grid.appendChild(card);
    });
  }

  renderInventory(); updateDisplays(); applyTranslations(); bindUi();

  // Populate collectables page if present
  renderCollectablesPage();

  const langToggle = document.getElementById('langToggle'); if(langToggle) langToggle.addEventListener('click', ()=>{ lang = (lang==='nl'?'en':'nl'); localStorage.setItem('site_lang', lang); bindUi(); });
  if(langToggle) langToggle.addEventListener && langToggle.addEventListener('click', ()=>{ renderCollectablesPage(); });

});
