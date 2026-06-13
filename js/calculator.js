/**
 * Tradesman Toolkit - Plaster Calculator Logic (js/calculator.js)
 */

const PRESETS = {
  box: { length: 2.5, width: 2.0, height: 2.4, doors: 1, windows: 1, ceiling: true },
  double: { length: 4.0, width: 3.5, height: 2.4, doors: 1, windows: 1, ceiling: true },
  lounge: { length: 6.0, width: 4.5, height: 2.4, doors: 1, windows: 2, ceiling: true },
  hall: { length: 5.0, width: 1.8, height: 2.8, doors: 3, windows: 0, ceiling: true }
};

// Global counts
let doorsCount = 1;
let windowsCount = 1;

function initCalculatorPage() {
  loadSettings();
  
  // Pre-load default values on form fields
  document.getElementById("num-length").value = "4.0";
  document.getElementById("slide-length").value = "4.0";
  document.getElementById("num-width").value = "3.5";
  document.getElementById("slide-width").value = "3.5";
  document.getElementById("num-height").value = "2.4";
  document.getElementById("slide-height").value = "2.4";

  doorsCount = 1;
  windowsCount = 1;
  document.getElementById("num-doors").textContent = doorsCount;
  document.getElementById("num-windows").textContent = windowsCount;

  calculatePlasterMaterials();
}

// Sliders <---> Numeric matching sync
function syncDimension(type, val) {
  const numericInput = document.getElementById(`num-${type}`);
  const sliderInput = document.getElementById(`slide-${type}`);
  
  const cleanVal = parseFloat(val) || 0;
  
  numericInput.value = cleanVal;
  sliderInput.value = Math.min(sliderInput.max, cleanVal); // guard slide overflow
  
  calculatePlasterMaterials();
}

// Incrementors for deductions
function increment(type) {
  if (type === "doors") {
    doorsCount++;
    document.getElementById("num-doors").textContent = doorsCount;
  } else if (type === "windows") {
    windowsCount++;
    document.getElementById("num-windows").textContent = windowsCount;
  }
  calculatePlasterMaterials();
}

function decrement(type) {
  if (type === "doors") {
    doorsCount = Math.max(0, doorsCount - 1);
    document.getElementById("num-doors").textContent = doorsCount;
  } else if (type === "windows") {
    windowsCount = Math.max(0, windowsCount - 1);
    document.getElementById("num-windows").textContent = windowsCount;
  }
  calculatePlasterMaterials();
}

// Preset application
function applyPreset(code) {
  const preset = PRESETS[code];
  if (!preset) return;

  document.getElementById("num-length").value = preset.length;
  document.getElementById("slide-length").value = preset.length;
  
  document.getElementById("num-width").value = preset.width;
  document.getElementById("slide-width").value = preset.width;
  
  document.getElementById("num-height").value = preset.height;
  document.getElementById("slide-height").value = preset.height;

  document.getElementById("calc-ceiling").checked = preset.ceiling;

  doorsCount = preset.doors;
  windowsCount = preset.windows;
  document.getElementById("num-doors").textContent = doorsCount;
  document.getElementById("num-windows").textContent = windowsCount;

  calculatePlasterMaterials();
}

// Core Math Calculations
function calculatePlasterMaterials() {
  loadSettings(); // refresh currencies
  
  const length = parseFloat(document.getElementById("num-length").value) || 0;
  const width = parseFloat(document.getElementById("num-width").value) || 0;
  const height = parseFloat(document.getElementById("num-height").value) || 0;
  const includeCeiling = document.getElementById("calc-ceiling").checked;

  const costBoard = parseFloat(document.getElementById("cost-board").value) || 0;
  const costBag = parseFloat(document.getElementById("cost-bag").value) || 0;
  const costBead = parseFloat(document.getElementById("cost-bead").value) || 0;

  // 1. Calculate Areas
  const wallsGrossArea = 2 * height * (length + width);
  const deductionsArea = (doorsCount * 2.0) + (windowsCount * 1.5);
  const wallsNetArea = Math.max(0, wallsGrossArea - deductionsArea);
  
  const ceilingArea = includeCeiling ? (length * width) : 0;
  const totalScopeArea = wallsNetArea + ceilingArea;

  // 2. Compute Sheet Requirements (standard 2.4x1.2 sheet covers 2.88m²)
  // Plasterboard is calculated on net total layout including ceiling, with premium 10% scrap margin
  const sheetsNeeded = Math.ceil((totalScopeArea / 2.88) * 1.1);

  // 3. Undercoat backing bonding coat (assumes ceilings do NOT get bonding backing, only boarding)
  // Standard 25kg bag of bonding coat covers 2.75 square metres
  const bondingBags = Math.ceil(wallsNetArea / 2.75);

  // 4. Skim multi-finish plaster coat (Two-layer cover for both boarded walls & dry ceiling skim)
  // Standard 25kg multi-finish bag covers 9.0 square metres
  const multiFinishBags = Math.ceil(totalScopeArea / 9.0);

  // 5. Angle Corner Beads (standard 2.4m steel beads)
  // standard room features 4 external corners + 3 beads per window (left, right, head)
  const angleBeadsNeeded = 4 + (windowsCount * 3);

  // 6. Value budget totals
  const totalBoardCost = sheetsNeeded * costBoard;
  const totalSkimCost = multiFinishBags * costBag;
  const totalBondingCost = bondingBags * costBag;
  const totalBeadCost = angleBeadsNeeded * costBead;
  const totalMaterialsCost = totalBoardCost + totalSkimCost + totalBondingCost + totalBeadCost;

  // Render on simulator dashboard
  document.getElementById("out-total-sqm").innerHTML = `${totalScopeArea.toFixed(1)}<span class="text-xs text-slate-400 font-sans font-medium pl-0.5">m²</span>`;
  document.getElementById("output-dimensions-tag").textContent = `Room configuration: ${length.toFixed(1)}m L × ${width.toFixed(1)}m W × ${height.toFixed(1)}m H (Gross wall area: ${wallsGrossArea.toFixed(1)}m² - Deductions: ${deductionsArea.toFixed(1)}m²)`;

  // Simulator Cards
  document.getElementById("out-boards").innerHTML = `${sheetsNeeded} <span class="text-xs text-slate-400 font-sans font-medium">Sheets</span>`;
  document.getElementById("out-board-math").textContent = `Area: ${totalScopeArea.toFixed(1)}m² / 2.88 × 10% Waste`;
  
  document.getElementById("out-skim-bags").innerHTML = `${multiFinishBags} <span class="text-xs text-slate-400 font-sans font-medium">Bags</span>`;
  document.getElementById("out-bonding-bags").innerHTML = `${bondingBags} <span class="text-xs text-slate-400 font-sans font-medium">Bags</span>`;
  document.getElementById("out-beads").innerHTML = `${angleBeadsNeeded} <span class="text-xs text-slate-450 font-sans text-slate-400 font-medium">Beads</span>`;

  // Price List Table
  document.getElementById("txt-board-count").textContent = sheetsNeeded;
  document.getElementById("txt-board-unit").textContent = formatCurrency(costBoard);
  document.getElementById("val-board-total").textContent = formatCurrency(totalBoardCost);

  document.getElementById("txt-skim-count").textContent = multiFinishBags;
  document.getElementById("txt-skim-unit").textContent = formatCurrency(costBag);
  document.getElementById("val-skim-total").textContent = formatCurrency(totalSkimCost);

  document.getElementById("txt-bonding-count").textContent = bondingBags;
  document.getElementById("txt-bonding-unit").textContent = formatCurrency(costBag);
  document.getElementById("val-bonding-total").textContent = formatCurrency(totalBondingCost);

  document.getElementById("txt-bead-count").textContent = angleBeadsNeeded;
  document.getElementById("txt-bead-unit").textContent = formatCurrency(costBead);
  document.getElementById("val-bead-total").textContent = formatCurrency(totalBeadCost);

  document.getElementById("val-budget-total").textContent = formatCurrency(totalMaterialsCost);

  // Time stamp sync
  const now = new Date();
  document.getElementById("current-timestamp").textContent = `Calculated live: ${now.toLocaleDateString("en-GB")} • ${now.toLocaleTimeString("en-GB", {hour:'2-digit', minute:'2-digit'})}`;
}

// Side dropdown mobile triggers
function toggleMobileMenu() {
  const menu = document.getElementById("mobile-nav-menu");
  menu.classList.toggle("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  initCalculatorPage();
});
