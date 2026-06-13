/**
 * Tradesman Toolkit - Global Javascript (js/main.js)
 * Manages Dark Mode, Local Storage Settings, Brand Settings, and UI Utilities.
 */

// Global state schema for Tradesman Settings
const DEFAULT_SETTINGS = {
  companyName: "JD Building & Plastering Ltd",
  companyLogo: "", // base64 string
  companyAddress: "123 Trades Road\nIndustrial Park\nLondon, UK, WC1A 1AA",
  companyEmail: "info@jdbuilding.co.uk",
  companyPhone: "07700 900077",
  vatNumber: "GB 123 4567 89",
  defaultVatRate: "20",
  defaultDiscount: "0",
  currency: "£",
  nextInvoiceNumber: "1001",
  nextQuoteNumber: "2001",
  termsAndConditions: "1. Quotations are valid for 30 days from date of issue.\n2. Payment terms: 50% deposit balance upon completion.\n3. All materials remain property of the contractor until paid in full."
};

// Set up App State
let appSettings = { ...DEFAULT_SETTINGS };

// Load settings from localStorage
function loadSettings() {
  const saved = localStorage.getItem("tradesman_settings");
  if (saved) {
    try {
      appSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Error parsing settings, reverting to default", e);
      appSettings = { ...DEFAULT_SETTINGS };
    }
  } else {
    // Save defaults to storage
    saveSettingsToStorage();
  }
}

// Save settings to localStorage
function saveSettingsToStorage() {
  localStorage.setItem("tradesman_settings", JSON.stringify(appSettings));
}

// Dark & Light Mode Controller
function initDarkMode() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const storedTheme = localStorage.getItem("theme");
  
  if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  
  updateThemeButton();
}

function toggleDarkMode() {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
  updateThemeButton();
}

function updateThemeButton() {
  const isDark = document.documentElement.classList.contains("dark");
  const themeIcons = document.querySelectorAll(".theme-icon");
  const themeTexts = document.querySelectorAll(".theme-text");
  
  themeIcons.forEach(icon => {
    if (isDark) {
      icon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'; // moon icon
    } else {
      icon.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'; // sun icon
    }
  });

  themeTexts.forEach(txt => {
    txt.textContent = isDark ? "Light Mode" : "Dark Mode";
  });
}

// Shared currency formatting helper
function formatCurrency(amount) {
  const value = parseFloat(amount) || 0;
  return `${appSettings.currency}${value.toFixed(2)}`;
}

// Generate automatic list storage keys
const RECENT_INVOICES_KEY = "tradesman_recent_invoices";
const RECENT_QUOTES_KEY = "tradesman_recent_quotes";

function getRecentInvoices() {
  const data = localStorage.getItem(RECENT_INVOICES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveRecentInvoices(invoices) {
  localStorage.setItem(RECENT_INVOICES_KEY, JSON.stringify(invoices));
}

function getRecentQuotes() {
  const data = localStorage.getItem(RECENT_QUOTES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveRecentQuotes(quotes) {
  localStorage.setItem(RECENT_QUOTES_KEY, JSON.stringify(quotes));
}

// Settings Export
function exportSettings() {
  const settingsStr = JSON.stringify(appSettings, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(settingsStr);
  
  const exportFileDefaultName = 'tradesman_settings_backup.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Settings Import
function importSettings(fileInputEvent, callback) {
  const file = fileInputEvent.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      appSettings = { ...DEFAULT_SETTINGS, ...parsed };
      saveSettingsToStorage();
      if (typeof callback === "function") callback(true, appSettings);
    } catch (err) {
      console.error("Error importing settings:", err);
      if (typeof callback === "function") callback(false, null);
    }
  };
  reader.readAsText(file);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  initDarkMode();
  
  // Attach dark mode listeners to potential targets
  const togglers = document.querySelectorAll(".theme-toggle");
  togglers.forEach(btn => {
    btn.addEventListener("click", toggleDarkMode);
  });
  
  // Create beautiful ad banner simulation style
  const style = document.createElement("style");
  style.textContent = `
    .adsense-placement {
      background: repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 10px, #e2e8f0 10px, #e2e8f0 20px);
      border: 2px dashed #94a3b8;
      transition: all 0.3s;
    }
    .dark .adsense-placement {
      background: repeating-linear-gradient(45deg, #1e293b, #1e293b 10px, #0f172a 10px, #0f172a 20px);
      border: 2px dashed #475569;
    }
  `;
  document.head.appendChild(style);
});

// Robust Iframe Print Trigger & Sandbox Fallback Guide
function triggerPrint() {
  const isIframe = window.self !== window.top;
  if (isIframe) {
    showIframePrintInstructionModal();
  } else {
    try {
      window.print();
    } catch (err) {
      console.warn("Direct window.print failed:", err);
      showIframePrintInstructionModal();
    }
  }
}

function showIframePrintInstructionModal() {
  if (document.getElementById("iframe-print-modal")) return;

  const modal = document.createElement("div");
  modal.id = "iframe-print-modal";
  modal.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 no-print";
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700 space-y-5 animate-fade-in relative text-slate-800 dark:text-slate-200">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2050/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="animate-bounce"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        </div>
        <div>
          <h4 class="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">Print & PDF Export</h4>
          <p class="text-[10px] text-slate-400 font-semibold uppercase">Workspace Sandbox Guide</p>
        </div>
      </div>
      
      <div class="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>Because this applet is previewed inside a secure sandbox iframe, direct system components such as the **system print window** or **Save to PDF** file saver are blocked by your browser's security filters.</p>
        
        <div class="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-slate-700 dark:text-slate-300">
          <p class="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 min-w-0">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>How to bypass and print instantly:</span>
          </p>
          <ol class="list-decimal list-inside space-y-1 pl-1 text-[11px] font-medium font-sans">
            <li>Click the <b class="text-indigo-600 dark:text-indigo-400">"Open in New Tab" (↗)</b> button at the top right of your workspace window.</li>
            <li>In the new tab, click <b class="text-indigo-600 dark:text-indigo-400">Print Document</b> or <b class="text-indigo-600 dark:text-indigo-400">Save as PDF</b> again.</li>
            <li>Select <b class="text-slate-900 dark:text-white">Save as PDF</b> under destination inside the print wizard.</li>
          </ol>
        </div>
      </div>

      <div class="flex space-x-3 pt-2">
        <button onclick="document.getElementById('iframe-print-modal').remove()" class="flex-grow bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center">
          Got it, Close
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}
