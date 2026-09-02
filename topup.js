/* topup.js
	 Self-contained top-up page logic.

	 This script is intentionally independent from `script.js` so the
	 top-up page can function on its own. It reads and writes the shared
	 `site_state` in localStorage (the same key `script.js` uses) so
	 coins stay in sync across pages.

	 Flow:
	 1. On load, read `site_state` from localStorage, parse it, and show
			current coin count.
	 2. When a top-up button is clicked, open the payment modal and store
			the selected amount in a local variable `pendingTopup`.
	 3. When the user confirms, simulate processing, add coins to state
			(e.g. 1€ => 10 coins), save state, update UI, and close the modal.

	 All DOM elements are guarded so this file can be included on any page
	 without throwing errors.
*/

(function(){
	'use strict';

	// Guard: only run on pages that include the top-up form
	const topupForm = document.getElementById('topupForm');
	if(!topupForm) return;

	// Helper: read site_state from localStorage
	function loadState(){
		try{
			const raw = localStorage.getItem('site_state');
			if(!raw) return { coins: 0, inventory: [], nextId: 1, keys: 0 };
			return Object.assign({ coins: 0, inventory: [], nextId: 1, keys: 0 }, JSON.parse(raw));
		}catch(e){
			return { coins: 0, inventory: [], nextId: 1, keys: 0 };
		}
	}

	// Helper: save site_state to localStorage
	function saveState(state){
		try{ localStorage.setItem('site_state', JSON.stringify(state)); }catch(e){}
	}

	// Update coin/key displays if present on the page
	function updateDisplays(state){
		const coinEl = document.getElementById('coinCount');
		if(coinEl) coinEl.textContent = state.coins;
		const keyEl = document.getElementById('keyCount');
		if(keyEl) keyEl.textContent = state.keys;
	}

	// Simple popup notification (small transient message)
	function showPopup(text){
		const div = document.createElement('div');
		div.className = 'reward-popup';
		div.textContent = text;
		document.body.appendChild(div);
		requestAnimationFrame(()=> div.style.opacity = 1);
		setTimeout(()=>{ div.style.opacity = 0; setTimeout(()=> div.remove(), 400); }, 3000);
	}

	// State for this module
	let pendingTopup = 0;
	let state = loadState();
	updateDisplays(state);

	// Elements used by the modal
	const paymentModal = document.getElementById('paymentModal');
	const paymentAmount = document.getElementById('paymentAmount');
	const paymentProcessing = document.getElementById('paymentProcessing');
	const confirmPayment = document.getElementById('confirmPayment');
	const cancelPayment = document.getElementById('cancelPayment');
	const paymentClose = document.getElementById('paymentClose');
	const topupNotice = document.getElementById('topupNotice');

	// Open the payment modal for the selected amount.
	function openPaymentModal(amount){
		pendingTopup = Number(amount) || 0;
		if(paymentAmount) paymentAmount.textContent = `€${pendingTopup}`;
		if(paymentProcessing) paymentProcessing.setAttribute('aria-hidden','true');
		if(paymentModal) paymentModal.setAttribute('aria-hidden','false');
	}

	// Close the payment modal and clear pending amount
	function closePaymentModal(){
		pendingTopup = 0;
		if(paymentModal) paymentModal.setAttribute('aria-hidden','true');
	}

	// Confirm handler: simulate processing, credit coins, update UI and storage
	function handleConfirm(){
		if(!pendingTopup) { showPopup('No amount selected'); return; }
		if(paymentProcessing) paymentProcessing.setAttribute('aria-hidden','false');

		// Simulate network/server processing delay
		setTimeout(()=>{
			const coinsGained = pendingTopup * 10; // 1€ = 10 coins (example rate)
			state.coins = (state.coins || 0) + coinsGained;
			saveState(state); // persist updated balance
			updateDisplays(state); // update visible counters on page
			if(topupNotice) topupNotice.textContent = `Top Up €${pendingTopup} — You received ${coinsGained} coins`;
			showPopup(`You received ${coinsGained} coins`);
			// Hide processing and modal
			if(paymentProcessing) paymentProcessing.setAttribute('aria-hidden','true');
			closePaymentModal();
		}, 1000);
	}

	// Wire up: delegated click from the topup form so cloned buttons still work
	// Clicking an amount now immediately credits coins (1€ => 10 coins)
	topupForm.addEventListener('click', (ev)=>{
		const btn = ev.target.closest('.topup-option');
		if(!btn || !topupForm.contains(btn)) return;
		const amt = Number(btn.dataset.amount) || 0;
		// Immediate top-up: credit coins and persist state
		const coinsGained = amt * 10;
		state.coins = (state.coins || 0) + coinsGained;
		saveState(state);
		updateDisplays(state);
		if(topupNotice) topupNotice.textContent = `Top Up €${amt} — You received ${coinsGained} coins`;
		showPopup(`You received ${coinsGained} coins`);
	});

	// Attach modal controls (guards in case elements are missing)
	if(confirmPayment) confirmPayment.addEventListener('click', handleConfirm);
	if(cancelPayment) cancelPayment.addEventListener('click', closePaymentModal);
	if(paymentClose) paymentClose.addEventListener('click', closePaymentModal);

	// Buy Key button: allow users to buy a key with coins from this page.
	// Cost is 1000 coins (matches `script.js` behavior).
	const buyKeyBtn = document.getElementById('buyKeyBtn');
	function buyKey(){
		const cost = 1000;
		if((state.coins || 0) < cost){ showPopup('Not enough coins'); return; }
		state.coins -= cost;
		state.keys = (state.keys || 0) + 1;
		saveState(state);
		updateDisplays(state);
		showPopup('Key purchased');
	}
	if(buyKeyBtn) buyKeyBtn.addEventListener('click', buyKey);

	// Expose a small global helper for debugging in the console
	window.__topup_debug = {
		loadState, saveState, state
	};

})();
