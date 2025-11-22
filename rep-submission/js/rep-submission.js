// -----------------------------
// Mock master data & rep data
// -----------------------------

const currentRep = {
  name: "Rep 03 – S. Perera",
  defaultTerritory: "Colombo North",
};

const masterProducts = [
  { id: "P1", name: "Prod A" },
  { id: "P2", name: "Prod B" },
  { id: "P3", name: "Prod C" },
  { id: "P4", name: "Prod F" },
  { id: "P5", name: "Prod H" },
];

const masterDoctors = [
  {
    id: "D001",
    name: "Dr. A Kumar",
    speciality: "Cardiology",
    grade: "A",
    locations: ["Colombo North", "Kandy"],
    status: "Active",
  },
  {
    id: "D002",
    name: "Dr. B Fernando",
    speciality: "Endocrinology",
    grade: "A",
    locations: ["Colombo South"],
    status: "Active",
  },
  {
    id: "D003",
    name: "Dr. C Jayasinghe",
    speciality: "GP",
    grade: "B",
    locations: ["Kandy"],
    status: "Active",
  },
  {
    id: "D004",
    name: "Dr. D Nuwan",
    speciality: "GP",
    grade: "C",
    locations: ["Galle"],
    status: "Retired",
  },
  {
    id: "D005",
    name: "Dr. New A1",
    speciality: "Cardiology",
    grade: "A",
    locations: ["Negombo"],
    status: "Active",
  },
];

const masterChemists = [
  {
    id: "C001",
    name: "HealthPlus Pharmacy",
    location: "Colombo North",
    channel: "Retail",
  },
  {
    id: "C002",
    name: "CityCare Chemist",
    location: "Kandy",
    channel: "Retail",
  },
  {
    id: "C003",
    name: "Central Hospital Pharmacy",
    location: "Colombo South",
    channel: "Hospital",
  },
];

// -----------------------------
// Utility helpers
// -----------------------------

function formatTodayForInput() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-nav-item");
  const views = document.querySelectorAll(".view");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-view-target");
      if (!target) return;

      tabButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      views.forEach((view) => {
        if (view.getAttribute("data-view") === target) {
          view.classList.add("is-active");
          view.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          view.classList.remove("is-active");
        }
      });
    });
  });
}

function setDefaultDatesAndRep() {
  const todayValue = formatTodayForInput();
  const todayText = new Date().toLocaleDateString("en-LK", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const headerDate = document.getElementById("current-date-text");
  if (headerDate) headerDate.textContent = todayText;

  const repName = document.getElementById("rep-name-text");
  if (repName) repName.textContent = currentRep.name;

  const dateInputs = ["#dcr-date", "#chemist-date", "#expense-date"];

  dateInputs.forEach((selector) => {
    const input = document.querySelector(selector);
    if (input && !input.value) {
      input.value = todayValue;
    }
  });

  // Set default territory
  const territorySelects = document.querySelectorAll(".territory-select");
  territorySelects.forEach((sel) => {
    Array.from(sel.options).forEach((opt) => {
      if (opt.textContent === currentRep.defaultTerritory) {
        sel.value = opt.textContent;
      }
    });
  });
}

// Summary counters
function updateSummaryCounts() {
  const doctorsCount = document.querySelectorAll(
    "#doctor-visits-list .visit-row"
  ).length;
  const chemistsCount = document.querySelectorAll(
    "#chemist-visits-list .chemist-row"
  ).length;
  const expenseCount = document.querySelectorAll(
    "#expense-rows .expense-row"
  ).length;

  const doctorSpan = document.getElementById("summary-doctors-count");
  const chemistSpan = document.getElementById("summary-chemists-count");
  const expenseSpan = document.getElementById("summary-expenses-count");

  if (doctorSpan) doctorSpan.textContent = doctorsCount;
  if (chemistSpan) chemistSpan.textContent = chemistsCount;
  if (expenseSpan) expenseSpan.textContent = expenseCount;

  const dcrCountLabel = document.getElementById("dcr-doctor-count-label");
  if (dcrCountLabel) {
    dcrCountLabel.textContent =
      doctorsCount === 1 ? "(1 today)" : `(${doctorsCount} today)`;
  }

  const chemistCountLabel = document.getElementById("chemist-count-label");
  if (chemistCountLabel) {
    chemistCountLabel.textContent =
      chemistsCount === 1 ? "(1 today)" : `(${chemistsCount} today)`;
  }
}

// -----------------------------
// Template cloning helper
// -----------------------------

function cloneTemplate(templateId) {
  const template = document.getElementById(templateId);
  if (!template) return null;
  const clone = template.cloneNode(true);
  clone.removeAttribute("id");
  clone.classList.remove("block-template");
  return clone;
}

// -----------------------------
// Autocomplete helpers
// -----------------------------

function setupDoctorAutocomplete(rowElement) {
  const input = rowElement.querySelector(".doctor-search-input");
  const list = rowElement.querySelector(".autocomplete-list");
  if (!input || !list) return;

  function closeList() {
    list.innerHTML = "";
    list.classList.remove("is-visible");
  }

  function applyDoctor(doc) {
    input.value = doc.name;

    const gradeEl = rowElement.querySelector('[data-field="grade"]');
    const locEl = rowElement.querySelector('[data-field="location"]');
    const statusEl = rowElement.querySelector('[data-field="status"]');

    if (gradeEl) {
      gradeEl.textContent = `Grade: ${doc.grade}`;
      gradeEl.dataset.grade = doc.grade;
    }
    if (locEl) {
      const locText =
        doc.locations.length > 1
          ? `${doc.locations[0]} (+${doc.locations.length - 1} more)`
          : doc.locations[0] || "—";
      locEl.textContent = `Location: ${locText}`;
    }
    if (statusEl) {
      statusEl.textContent = `Status: ${doc.status}`;
    }

    closeList();
  }

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      closeList();
      return;
    }

    const matches = masterDoctors.filter((doc) =>
      (doc.name + doc.id).toLowerCase().includes(query)
    );

    if (!matches.length) {
      closeList();
      return;
    }

    list.innerHTML = "";
    matches.slice(0, 6).forEach((doc) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "autocomplete-item";

      const main = document.createElement("div");
      main.className = "autocomplete-main";
      main.textContent = doc.name;

      const sub = document.createElement("div");
      sub.className = "autocomplete-sub";
      const locText = doc.locations.join(", ");
      sub.textContent = `Grade ${doc.grade} · ${doc.speciality} · ${locText}`;

      btn.appendChild(main);
      btn.appendChild(sub);

      btn.addEventListener("click", () => applyDoctor(doc));
      list.appendChild(btn);
    });

    list.classList.add("is-visible");
  });

  input.addEventListener("blur", () => {
    // Small delay so click on item still works
    setTimeout(closeList, 150);
  });
}

function setupChemistAutocomplete(rowElement) {
  const input = rowElement.querySelector(".chemist-search-input");
  const list = rowElement.querySelector(".autocomplete-list");
  if (!input || !list) return;

  function closeList() {
    list.innerHTML = "";
    list.classList.remove("is-visible");
  }

  function applyChemist(chemist) {
    input.value = chemist.name;

    const locEl = rowElement.querySelector('[data-field="location"]');
    const channelEl = rowElement.querySelector('[data-field="channel"]');

    if (locEl) locEl.textContent = `Location: ${chemist.location}`;
    if (channelEl) channelEl.textContent = `Channel: ${chemist.channel}`;

    closeList();
  }

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      closeList();
      return;
    }

    const matches = masterChemists.filter((chem) =>
      (chem.name + chem.id).toLowerCase().includes(query)
    );

    if (!matches.length) {
      closeList();
      return;
    }

    list.innerHTML = "";
    matches.slice(0, 6).forEach((chem) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "autocomplete-item";

      const main = document.createElement("div");
      main.className = "autocomplete-main";
      main.textContent = chem.name;

      const sub = document.createElement("div");
      sub.className = "autocomplete-sub";
      sub.textContent = `${chem.location} · ${chem.channel}`;

      btn.appendChild(main);
      btn.appendChild(sub);

      btn.addEventListener("click", () => applyChemist(chem));
      list.appendChild(btn);
    });

    list.classList.add("is-visible");
  });

  input.addEventListener("blur", () => {
    setTimeout(closeList, 150);
  });
}

// -----------------------------
// Product helper
// -----------------------------

function populateProductSelect(selectElement) {
  if (!selectElement) return;
  selectElement.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select product";
  selectElement.appendChild(placeholder);

  masterProducts.forEach((prod) => {
    const opt = document.createElement("option");
    opt.value = prod.name;
    opt.textContent = prod.name;
    selectElement.appendChild(opt);
  });
}

function populateProductMultiSelect(selectElement) {
  if (!selectElement) return;
  selectElement.innerHTML = "";
  masterProducts.forEach((prod) => {
    const opt = document.createElement("option");
    opt.value = prod.name;
    opt.textContent = prod.name;
    selectElement.appendChild(opt);
  });
}

// -----------------------------
// DCR – Doctor visits & missed
// -----------------------------

function addDoctorVisitRow() {
  const container = document.getElementById("doctor-visits-list");
  const template = cloneTemplate("template-doctor-visit");
  if (!container || !template) return;

  const removeBtn = template.querySelector(".visit-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      container.removeChild(template);
      if (!container.children.length) {
        addDoctorVisitRow();
      } else {
        updateSummaryCounts();
      }
    });
  }

  setupDoctorAutocomplete(template);
  container.appendChild(template);
  updateSummaryCounts();
}

function addMissedDoctorRow() {
  const container = document.getElementById("missed-doctors-list");
  const template = cloneTemplate("template-missed-doctor");
  if (!container || !template) return;

  const removeBtn = template.querySelector(".missed-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      container.removeChild(template);
    });
  }

  setupDoctorAutocomplete(template);
  container.appendChild(template);
}

function setupDcrSection() {
  // Initial row
  addDoctorVisitRow();

  const addDoctorBtn = document.getElementById("btn-add-doctor-visit");
  if (addDoctorBtn) {
    addDoctorBtn.addEventListener("click", () => addDoctorVisitRow());
  }

  const addMissedBtn = document.getElementById("btn-add-missed-doctor");
  if (addMissedBtn) {
    addMissedBtn.addEventListener("click", () => addMissedDoctorRow());
  }

  const submitBtn = document.getElementById("btn-submit-dcr");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      alert(
        "DCR submitted (prototype). In production this will save to server."
      );
    });
  }
}

// -----------------------------
// Chemist section
// -----------------------------

function addChemistProductRow(container) {
  const template = cloneTemplate("template-chemist-product-row");
  if (!container || !template) return;

  const productSelect = template.querySelector(".chemist-product-select");
  populateProductSelect(productSelect);

  const removeBtn = template.querySelector(".chemist-product-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      container.removeChild(template);
    });
  }

  container.appendChild(template);
}

function addChemistVisitRow() {
  const container = document.getElementById("chemist-visits-list");
  const template = cloneTemplate("template-chemist-visit");
  if (!container || !template) return;

  const productsContainer = template.querySelector(".chemist-product-rows");
  const addProductBtn = template.querySelector(".chemist-add-product");
  if (productsContainer && addProductBtn) {
    addProductBtn.addEventListener("click", () =>
      addChemistProductRow(productsContainer)
    );
    // Start with one product row for convenience
    addChemistProductRow(productsContainer);
  }

  const removeBtn = template.querySelector(".chemist-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      container.removeChild(template);
      if (!container.children.length) {
        addChemistVisitRow();
      } else {
        updateSummaryCounts();
      }
    });
  }

  setupChemistAutocomplete(template);
  container.appendChild(template);
  updateSummaryCounts();
}

function setupChemistSection() {
  addChemistVisitRow();

  const addChemistBtn = document.getElementById("btn-add-chemist-visit");
  if (addChemistBtn) {
    addChemistBtn.addEventListener("click", () => addChemistVisitRow());
  }

  const submitBtn = document.getElementById("btn-submit-chemist");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      alert(
        "Chemist report submitted (prototype). In production this will save to server."
      );
    });
  }
}

// -----------------------------
// Expenses section
// -----------------------------

function recalcExpenseTotal() {
  const rows = document.querySelectorAll(".expense-row");
  let total = 0;
  rows.forEach((row) => {
    const input = row.querySelector(".expense-amount");
    if (!input) return;
    const value = parseFloat(input.value);
    if (!isNaN(value) && value > 0) {
      total += value;
    }
  });

  const totalEl = document.getElementById("expense-total-value");
  if (totalEl) {
    const formatted = total.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    totalEl.textContent = `LKR ${formatted}`;
  }
}

function addExpenseRow() {
  const container = document.getElementById("expense-rows");
  const template = cloneTemplate("template-expense-row");
  if (!container || !template) return;

  const removeBtn = template.querySelector(".expense-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      container.removeChild(template);
      recalcExpenseTotal();
      if (!container.children.length) {
        addExpenseRow();
      } else {
        updateSummaryCounts();
      }
    });
  }

  const amountInput = template.querySelector(".expense-amount");
  if (amountInput) {
    amountInput.addEventListener("input", () => {
      // Ensure only numbers; browser already restricts, we just re-calc
      recalcExpenseTotal();
    });
  }

  container.appendChild(template);
  updateSummaryCounts();
}

function setupExpensesSection() {
  addExpenseRow();

  const addBtn = document.getElementById("btn-add-expense-row");
  if (addBtn) {
    addBtn.addEventListener("click", () => addExpenseRow());
  }

  const mileageInput = document.getElementById("mileage-km");
  if (mileageInput) {
    mileageInput.addEventListener("input", () => {
      const raw = mileageInput.value;
      const cleaned = raw.replace(/[^0-9.]/g, "");
      if (cleaned !== raw) {
        mileageInput.value = cleaned;
      }
    });
  }

  const submitBtn = document.getElementById("btn-submit-expenses");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      alert(
        "Expenses submitted (prototype). In production this will save to server."
      );
    });
  }
}

// -----------------------------
// Init
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {
  setDefaultDatesAndRep();
  setupTabs();
  setupDcrSection();
  setupChemistSection();
  setupExpensesSection();
  updateSummaryCounts();
});
