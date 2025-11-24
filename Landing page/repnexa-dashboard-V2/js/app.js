// Sidebar collapse toggle
const sidebarToggle = document.getElementById("sidebarToggle");
const layout = document.getElementById("layout");
if (sidebarToggle && layout) {
  sidebarToggle.addEventListener("click", () => {
    layout.classList.toggle("sidebar-collapsed");
  });
}

// Simple SPA-style navigation between dashboard views
const navButtons = document.querySelectorAll(".side-nav-item");
const views = document.querySelectorAll(".dashboard-view");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetView = btn.getAttribute("data-view");

    // Active state on nav
    navButtons.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    /*
    // Show only selected view
    views.forEach((view) => {
      if (view.getAttribute("data-view") === targetView) {
        view.classList.add("is-active");
      } else {
        view.classList.remove("is-active");
      }
    });
    */

    // Show only selected view
    views.forEach((view) => {
      const isTarget = view.getAttribute("data-view") === targetView;

      if (isTarget) {
        // Lazy-load external HTML if this view has a URL and hasn't been loaded yet
        const url = view.getAttribute("data-view-url");
        if (url && !view.dataset.loaded) {
          fetch(url)
            .then((res) => {
              if (!res.ok) {
                // Turn HTTP errors (404, 500, etc.) into real errors for catch()
                throw new Error(`HTTP ${res.status} for ${url}`);
              }
              return res.text();
            })
            .then((html) => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");

              // Try to extract just the inner dashboard content:
              // 1) Prefer the inner .dashboard-view inside the fetched file
              // 2) Fallback: main.dashboard-main
              // 3) Last resort: entire body/html
              let content = "";

              const innerView = doc.querySelector("section.dashboard-view");
              if (innerView) {
                content = innerView.innerHTML;
              } else {
                const main = doc.querySelector("main.dashboard-main");
                if (main) {
                  content = main.innerHTML;
                } else if (doc.body) {
                  content = doc.body.innerHTML;
                } else {
                  content = html;
                }
              }

              // Inject content into the existing shell section in index.html
              view.innerHTML = content;
              view.dataset.loaded = "true";
            })
            .catch((err) => {
              console.error("Failed to load view:", url, err);
              view.innerHTML =
                '<article class="table-card"><div class="card-header"><div class="card-title">Error</div></div><p style="padding:16px;">Failed to load this view.</p></article>';
            });
        }

        // Finally, show this view
        view.classList.add("is-active");
      } else {
        view.classList.remove("is-active");
      }
    });
  });
});

// -------------------------
// Phase 1 behaviours
// -------------------------

// Grade pill filter for Doctor Coverage dashboard
const coverageGradePills = document.querySelectorAll(".pill-grade");

coverageGradePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const grade = pill.dataset.grade; // "all", "A", "B", "C"
    const targetTableSelector = pill.dataset.targetTable;
    const table = document.querySelector(targetTableSelector);
    if (!table) return;

    // Toggle pill state
    const siblings = pill.parentElement.querySelectorAll(".pill-grade");
    siblings.forEach((p) => p.classList.remove("is-active"));
    pill.classList.add("is-active");

    // Filter rows by data-grade
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const rowGrade = row.getAttribute("data-grade");
      if (grade === "all" || rowGrade === grade) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
});

// Funnel stage filter for New Doctor Activation dashboard
const funnelSteps = document.querySelectorAll(".funnel-step");

funnelSteps.forEach((step) => {
  step.addEventListener("click", () => {
    const stage = step.dataset.stage; // "new", "visited-once", "visited-multi"
    const targetTableSelector = step.dataset.targetTable;
    const table = document.querySelector(targetTableSelector);
    if (!table) return;

    // Active state on steps
    const siblings = step.parentElement.querySelectorAll(".funnel-step");
    siblings.forEach((s) => s.classList.remove("is-active"));
    step.classList.add("is-active");

    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const rowStage = row.getAttribute("data-stage");
      row.style.display = rowStage === stage ? "" : "none";
    });
  });
});

// Default funnel state
if (funnelSteps.length > 0) {
  funnelSteps[0].click();
}

// Line chart caption updates
const doctorSelect = document.getElementById("doctor-line-select");
const doctorCaption = document.getElementById("doctor-line-caption");
if (doctorSelect && doctorCaption) {
  doctorSelect.addEventListener("change", () => {
    doctorCaption.textContent = "Selected doctor: " + doctorSelect.value;
  });
}

const repLineSelect = document.getElementById("rep-line-select");
const repLineCaption = document.getElementById("rep-line-caption");
if (repLineSelect && repLineCaption) {
  repLineSelect.addEventListener("change", () => {
    repLineCaption.textContent = "Selected rep: " + repLineSelect.value;
  });
}

// Rep expense filter
const repExpenseFilter = document.getElementById("rep-expense-filter");
const repExpenseTable = document.getElementById("table-rep-expenses");

if (repExpenseFilter && repExpenseTable) {
  repExpenseFilter.addEventListener("change", () => {
    const value = repExpenseFilter.value; // 'all' or 'Rep 01' etc
    const rows = repExpenseTable.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const rowRep = row.getAttribute("data-rep");
      if (value === "all" || rowRep === value) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
}

// -------------------------
// Phase 2 – Raw data views
// -------------------------

// Generic text search filter for tables (simple contains on row text)
function setupSearchFilter(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;

  const rows = table.querySelectorAll("tbody tr");

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? "" : "none";
    });
  });
}

// Attach simple search filters to data tables
setupSearchFilter("product-data-search", "data-table-products");
setupSearchFilter("chemist-data-search", "data-table-chemists");
setupSearchFilter("visit-data-search", "data-table-visits");

// Doctor master – combined grade + search filter
let doctorDataCurrentGrade = "all";

function filterDoctorsData() {
  const table = document.getElementById("data-table-doctors");
  const searchInput = document.getElementById("doctor-data-search");
  if (!table) return;

  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const rows = table.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const rowGrade = row.getAttribute("data-grade");
    const matchesGrade =
      doctorDataCurrentGrade === "all" || rowGrade === doctorDataCurrentGrade;

    const text = row.textContent.toLowerCase();
    const matchesSearch = query === "" || text.includes(query);

    row.style.display = matchesGrade && matchesSearch ? "" : "none";
  });
}

// Wire up doctor search
const doctorDataSearch = document.getElementById("doctor-data-search");
if (doctorDataSearch) {
  doctorDataSearch.addEventListener("input", filterDoctorsData);
}

// Wire up doctor grade pills
const doctorDataGradePills = document.querySelectorAll(".pill-data-grade");
if (doctorDataGradePills.length > 0) {
  doctorDataGradePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const grade = pill.dataset.grade || "all";

      // Toggle active state
      const siblings = pill.parentElement.querySelectorAll(".pill-data-grade");
      siblings.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");

      // Update grade and refilter
      doctorDataCurrentGrade = grade;
      filterDoctorsData();
    });
  });

  // Initial filter to respect defaults
  filterDoctorsData();
}

// -------------------------
// Phase 3 – Admin master data UI
// -------------------------

function setupAdminFormToggle(openButtonId, cardId) {
  const openButton = document.getElementById(openButtonId);
  const card = document.getElementById(cardId);
  if (!openButton || !card) return;

  const cancelButtons = card.querySelectorAll(".btn-cancel");
  const form = card.querySelector("form");

  const close = () => {
    card.classList.remove("is-visible");
  };

  openButton.addEventListener("click", () => {
    card.classList.add("is-visible");
  });

  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      close();
    });
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      // Prototype behaviour: just close the panel on "save"
      close();
    });
  }
}

// Attach toggles for admin forms
setupAdminFormToggle("btn-open-doctor-form", "doctor-form-card");
setupAdminFormToggle("btn-open-chemist-form", "chemist-form-card");
setupAdminFormToggle("btn-open-product-form", "product-form-card");

// Wire "Edit" buttons to open the forms and pre-fill the name field
function setupAdminEditButtons(selector, cardId, inputId, dataAttr) {
  const card = document.getElementById(cardId);
  const input = document.getElementById(inputId);
  if (!card || !input) return;

  const buttons = document.querySelectorAll(selector);
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute(dataAttr) || "";
      input.value = name;
      card.classList.add("is-visible");
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

setupAdminEditButtons(
  ".admin-doctor-edit",
  "doctor-form-card",
  "doctor-name-input",
  "data-doctor-name"
);
setupAdminEditButtons(
  ".admin-chemist-edit",
  "chemist-form-card",
  "chemist-name-input",
  "data-chemist-name"
);
setupAdminEditButtons(
  ".admin-product-edit",
  "product-form-card",
  "product-name-input",
  "data-product-name"
);

// Simple search filters for admin tables (reuse Phase 2 helper)
setupSearchFilter("admin-doctor-search", "admin-table-doctors");
setupSearchFilter("admin-chemist-search", "admin-table-chemists");
setupSearchFilter("admin-product-search", "admin-table-products");
