/**
 * Tradesman Toolkit - Quote Logic (js/quote.js)
 */

let currentQuoteId = "";
let quoteItems = [];

// Default demo rows for fresh quotes
const QUOTE_DEMO_ITEMS = [
  { description: "Hacking off blown cement render, dry-lining backing boards, and skimming room walls", qty: 1, price: 540 },
  { description: "Gyproc moisture-resistant plasterboards (2.4m x 1.2m)", qty: 6, price: 16.50 }
];

function initQuotePage() {
  loadSettings();
  
  // Set default company profile fields
  document.getElementById("editor-company-name").value = appSettings.companyName || "";
  document.getElementById("editor-company-phone").value = appSettings.companyPhone || "";
  document.getElementById("editor-company-address").value = appSettings.companyAddress || "";
  document.getElementById("editor-company-email").value = appSettings.companyEmail || "";
  document.getElementById("editor-company-vat").value = appSettings.vatNumber || "";
  
  updateEditorLogoPreview();
  
  // Set default tax/discount rates in editor from global branding sets
  document.getElementById("editor-vat-percentage").value = appSettings.defaultVatRate || "20";
  document.getElementById("editor-discount-percentage").value = appSettings.defaultDiscount || "0";
  document.getElementById("editor-terms").value = appSettings.termsAndConditions || "";
  
  // Currency Indicators sync
  document.getElementById("rate-currency-indicator-1").textContent = appSettings.currency;
  document.getElementById("rate-currency-indicator-2").textContent = appSettings.currency;

  const urlParams = new URLSearchParams(window.location.search);
  const loadId = urlParams.get("id");

  if (loadId) {
    const loaded = getRecentQuotes().find(qt => qt.id === loadId);
    if (loaded) {
      currentQuoteId = loaded.id;
      document.getElementById("editor-quote-num").value = loaded.quoteNum || "";
      document.getElementById("editor-quote-date").value = loaded.quoteDate || "";
      document.getElementById("editor-expiry-date").value = loaded.expiryDate || "";
      document.getElementById("editor-customer-name").value = loaded.customerName || "";
      document.getElementById("editor-customer-address").value = loaded.customerAddress || "";
      document.getElementById("editor-labour-cost").value = loaded.labour || "0";
      document.getElementById("editor-materials-cost").value = loaded.materials || "0";
      document.getElementById("editor-vat-percentage").value = loaded.vat !== undefined ? loaded.vat : "20";
      document.getElementById("editor-discount-percentage").value = loaded.discount !== undefined ? loaded.discount : "0";
      document.getElementById("editor-terms").value = loaded.termsAndConditions || "";
      
      quoteItems = loaded.items && loaded.items.length > 0 ? loaded.items : [...QUOTE_DEMO_ITEMS];
    } else {
      setupNewQuote();
    }
  } else {
    setupNewQuote();
  }

  renderEditorRows();
  syncQuoteValues();
}

function setupNewQuote() {
  currentQuoteId = Date.now().toString();
  
  // Auto-number prefix pulled from settings
  document.getElementById("editor-quote-num").value = appSettings.nextQuoteNumber || "2001";
  
  // Set default dates
  const today = new Date();
  const formatToday = today.toISOString().split("T")[0];
  document.getElementById("editor-quote-date").value = formatToday;
  
  // Expiry in 30 days
  const exprDate = new Date();
  exprDate.setDate(today.getDate() + 30);
  document.getElementById("editor-expiry-date").value = exprDate.toISOString().split("T")[0];
  
  document.getElementById("editor-customer-name").value = "";
  document.getElementById("editor-customer-address").value = "";
  document.getElementById("editor-labour-cost").value = "0";
  document.getElementById("editor-materials-cost").value = "0";
  document.getElementById("editor-terms").value = appSettings.termsAndConditions || "1. Quotation remains valid for 30 days.\n2. 50% deposit due on acceptance, balance immediately on plastering Completion.";
  
  quoteItems = [...QUOTE_DEMO_ITEMS];
}

// Render inputs in Left Panel
function renderEditorRows() {
  const container = document.getElementById("editor-rows-container");
  container.innerHTML = "";

  quoteItems.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "flex gap-2 items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl animate-fade-in";
    row.id = `editor-row-${index}`;
    row.innerHTML = `
      <div class="flex-grow min-w-0">
        <input type="text" value="${item.description.replace(/"/g, '&quot;')}" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none" placeholder="e.g. Backing coat skim plastering" oninput="updateItemValue(${index}, 'description', this.value)" />
      </div>
      <div class="w-14">
        <input type="number" value="${item.qty}" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1 py-1 text-xs text-center font-bold" min="0.1" step="0.1" oninput="updateItemValue(${index}, 'qty', this.value)" />
      </div>
      <div class="w-20 relative">
        <span class="absolute left-1.5 top-1.5 text-[10px] text-slate-400 font-bold">${appSettings.currency}</span>
        <input type="number" value="${item.price}" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-4 pr-1 py-1 text-xs font-bold" min="0" step="0.01" oninput="updateItemValue(${index}, 'price', this.value)" />
      </div>
      <button onclick="deleteQuoteRow(${index})" class="p-1 px-2.5 bg-red-100 hover:bg-red-500 text-red-650 hover:text-white rounded-lg text-xs font-bold transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
      </button>
    `;
    container.appendChild(row);
  });
}

function addQuoteRow() {
  quoteItems.push({ description: "", qty: 1, price: 0 });
  renderEditorRows();
  syncQuoteValues();
}

function deleteQuoteRow(index) {
  quoteItems.splice(index, 1);
  renderEditorRows();
  syncQuoteValues();
}

function updateItemValue(index, prop, value) {
  if (prop === 'qty') {
    quoteItems[index].qty = Math.max(0.1, parseFloat(value) || 0);
  } else if (prop === 'price') {
    quoteItems[index].price = Math.max(0, parseFloat(value) || 0);
  } else {
    quoteItems[index].description = value;
  }
  
  syncQuoteValues();
}

// Live calculation & alignment of client paper simulator
function syncQuoteValues() {
  loadSettings();
  
  const quoteNum = document.getElementById("editor-quote-num").value;
  const quoteDate = document.getElementById("editor-quote-date").value;
  const expiryDate = document.getElementById("editor-expiry-date").value;
  const custName = document.getElementById("editor-customer-name").value;
  const custAdd = document.getElementById("editor-customer-address").value;
  const costLabour = parseFloat(document.getElementById("editor-labour-cost").value) || 0;
  const costMaterials = parseFloat(document.getElementById("editor-materials-cost").value) || 0;
  const vatRate = parseFloat(document.getElementById("editor-vat-percentage").value) || 0;
  const discountRate = parseFloat(document.getElementById("editor-discount-percentage").value) || 0;
  const rawTerms = document.getElementById("editor-terms").value;

  // Render on paper preview
  document.getElementById("paper-company-name").textContent = appSettings.companyName;
  document.getElementById("paper-vat-no").textContent = appSettings.vatNumber ? `VAT Registered No: ${appSettings.vatNumber}` : "NOT VAT registered";
  
  document.getElementById("paper-quote-num").textContent = `#QT-${quoteNum}`;
  document.getElementById("paper-quote-date").textContent = formatDate(quoteDate);
  document.getElementById("paper-expiry-date").textContent = formatDate(expiryDate);

  // Address blocks
  document.getElementById("paper-from-name").textContent = appSettings.companyName;
  document.getElementById("paper-from-address").textContent = appSettings.companyAddress;
  document.getElementById("paper-from-contact").textContent = `${appSettings.companyEmail} | ${appSettings.companyPhone}`;

  document.getElementById("paper-customer-name").textContent = custName || "(No Name Provided)";
  document.getElementById("paper-customer-address").textContent = custAdd || "(No Property Address Specfied)";
  
  // Paper Logo
  const paperLogoBox = document.getElementById("paper-logo-preview");
  if (appSettings.companyLogo) {
    paperLogoBox.innerHTML = `<img src="${appSettings.companyLogo}" class="object-contain block" style="max-height: 48px; max-width: 160px; width: auto; height: 48px;" alt="Branding Company Logo" referrerPolicy="no-referrer" />`;
    paperLogoBox.style.display = "flex";
  } else {
    paperLogoBox.innerHTML = "";
    paperLogoBox.style.display = "none";
  }

  // Map Table
  const tableBody = document.getElementById("paper-table-body");
  tableBody.innerHTML = "";

  let itemsSubtotal = 0;

  quoteItems.forEach((item) => {
    const itemTotal = item.qty * item.price;
    itemsSubtotal += itemTotal;

    const row = document.createElement("tr");
    row.className = "border-b border-slate-100 hover:bg-slate-50/50";
    row.innerHTML = `
      <td class="py-3 pl-1 font-medium text-slate-800 pr-4 leading-normal">${item.description || '<span class="text-slate-300 italic">(Empty description)</span>'}</td>
      <td class="py-3 text-center text-slate-500 font-semibold">${item.qty}</td>
      <td class="py-3 text-right text-slate-500 font-mono">${formatCurrency(item.price)}</td>
      <td class="py-3 pr-1 text-right font-mono font-bold text-slate-800">${formatCurrency(itemTotal)}</td>
    `;
    tableBody.appendChild(row);
  });

  // Flat Costs Visibility
  const laborRow = document.getElementById("paper-labor-row");
  const materialsRow = document.getElementById("paper-materials-row");

  document.getElementById("paper-labor-val").textContent = formatCurrency(costLabour);
  document.getElementById("paper-materials-val").textContent = formatCurrency(costMaterials);

  if (costLabour > 0) laborRow.style.display = "flex";
  else laborRow.style.display = "none";

  if (costMaterials > 0) materialsRow.style.display = "flex";
  else materialsRow.style.display = "none";

  // Calculations
  const combinedTotal = itemsSubtotal + costLabour + costMaterials;
  const discountAmount = combinedTotal * (discountRate / 100);
  const netSubtotal = combinedTotal - discountAmount;
  const vatAmount = netSubtotal * (vatRate / 100);
  const grandTotal = netSubtotal + vatAmount;

  document.getElementById("paper-subtotal").textContent = formatCurrency(itemsSubtotal);
  document.getElementById("paper-combined-total").textContent = formatCurrency(combinedTotal);
  
  // Discount line
  const discountRow = document.getElementById("paper-discount-row");
  if (discountRate > 0) {
    document.getElementById("paper-discount-label").textContent = `Vol Discount (${discountRate}%):`;
    document.getElementById("paper-discount-val").textContent = `-${formatCurrency(discountAmount)}`;
    discountRow.style.display = "flex";
  } else {
    discountRow.style.display = "none";
  }

  // VAT line
  const vatRow = document.getElementById("paper-vat-row");
  if (vatRate > 0) {
    document.getElementById("paper-vat-label").textContent = `VAT Component (${vatRate}%):`;
    document.getElementById("paper-vat-val").textContent = formatCurrency(vatAmount);
    vatRow.style.display = "flex";
  } else {
    vatRow.style.display = "none";
  }

  document.getElementById("paper-grand-total").textContent = formatCurrency(grandTotal);
  
  // Terms footer
  document.getElementById("paper-terms").textContent = rawTerms || "1. Quotation stands valid for 30 calendar days from issued date.";

  autoSaveCurrentQuoteDraft({
    id: currentQuoteId,
    quoteNum,
    quoteDate,
    expiryDate,
    customerName: custName,
    customerAddress: custAdd,
    labour: costLabour,
    materials: costMaterials,
    vat: vatRate,
    discount: discountRate,
    termsAndConditions: rawTerms,
    items: quoteItems,
    itemsCount: quoteItems.length,
    totalAmount: grandTotal,
    timestamp: Date.now()
  });
}

function formatDate(dateString) {
  if (!dateString) return "(Not specified)";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`; // UK layout DD/MM/YYYY
}

// Auto Save Tracker
function autoSaveCurrentQuoteDraft(payload) {
  let list = getRecentQuotes();
  list = list.filter(item => item.id !== payload.id);
  
  if (list.length >= 15) {
    list.pop();
  }
  
  list.unshift(payload);
  saveRecentQuotes(list);
}

// Clear current draft work state and create new
function createNewQuoteDraft() {
  if (confirm("Clear current progress and draft an entirely new quotation? All items will be wiped.")) {
    setupNewQuote();
    loadSettings();
    document.getElementById("editor-quote-num").value = appSettings.nextQuoteNumber;

    renderEditorRows();
    syncQuoteValues();
    alert("New empty quotation workspace active!");
  }
}

// Side dropdown mobile triggers
function toggleMobileMenu() {
  const menu = document.getElementById("mobile-nav-menu");
  menu.classList.toggle("hidden");
}

// Logo selection & Base64 storage
function previewEditorLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    appSettings.companyLogo = e.target.result;
    saveSettingsToStorage();
    updateEditorLogoPreview();
    syncQuoteValues();
  };
  reader.readAsDataURL(file);
}

function removeEditorLogo() {
  appSettings.companyLogo = "";
  saveSettingsToStorage();
  updateEditorLogoPreview();
  syncQuoteValues();
}

function updateEditorLogoPreview() {
  const previewDiv = document.getElementById("editor-logo-preview");
  const removeBtn = document.getElementById("remove-logo-btn");
  if (!previewDiv) return;
  
  if (appSettings.companyLogo) {
    previewDiv.innerHTML = `<img src="${appSettings.companyLogo}" class="w-full h-full object-contain" alt="Branding Company Logo" referrerPolicy="no-referrer" />`;
    if (removeBtn) removeBtn.classList.remove("hidden");
  } else {
    previewDiv.innerHTML = `<span class="text-[10px] text-slate-400 font-bold">No Logo</span>`;
    if (removeBtn) removeBtn.classList.add("hidden");
  }
}

function updateBrandSetting(key, val) {
  appSettings[key] = val;
  saveSettingsToStorage();
  syncQuoteValues();
}

document.addEventListener("DOMContentLoaded", () => {
  initQuotePage();
});
