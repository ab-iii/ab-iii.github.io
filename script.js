// ==============================
// Global state
// ==============================

// All products loaded from JSON (never mutated)
let allProducts = [];

// Products after applying filters (category, bought)
let filteredProducts = [];

// Pagination state for infinite scroll
let page = 0;
const PAGE_SIZE = 10;

// ==============================
// Initial data load
// ==============================

fetch("data/products.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    const toggleBought = document.getElementById("toggle-bought");
    if (toggleBought) {
    toggleBought.checked = false;   // ✅ force default
    }
    initCategoryFilter();
    setupControls();  
    applyFilters();          // initial render (bought hidden)
    setupInfiniteScroll();
  });

// ==============================
// UI initialization
// ==============================

/**
 * Populate the category <select> based on product categories
 */
function initCategoryFilter() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(allProducts.map(p => p.category))];

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

/**
 * Attach listeners to controls (category + bought checkbox)
 */
function setupControls() {
  document
    .getElementById("categoryFilter")
    .addEventListener("change", applyFilters);

  document
    .getElementById("toggle-bought")
    .addEventListener("change", applyFilters);
}

// ==============================
// Filtering + sorting
// ==============================

/**
 * Apply all active filters and reset the list
 */
function applyFilters() {
  const selectedCategory =
    document.getElementById("categoryFilter")?.value || "all";
  const showBought =
    document.getElementById("toggle-bought")?.checked || false;

  filteredProducts = allProducts.filter(p => {
    if (!showBought && p.bought) return false;
    if (selectedCategory !== "all" && p.category !== selectedCategory)
      return false;
    return true;
  });

  resetList();
}

/**
 * Sort filtered products by a given key
 */
function sortBy(key) {
  filteredProducts.sort((a, b) =>
    a[key] > b[key] ? 1 : -1
  );
  resetList();
}

// ==============================
// Rendering
// ==============================

/**
 * Render the next page of products
 */
function loadMore() {
  const start = page * PAGE_SIZE;
  const next = filteredProducts.slice(start, start + PAGE_SIZE);
  page++;
  render(next);
}

/**
 * Render a list of product objects into the DOM
 */
function render(list) {
  const container = document.getElementById("product-list");

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";

    // Visually mark bought products
    if (p.bought) {
      div.classList.add("bought");
    }

    // Open product link in new tab
    div.onclick = () => window.open(p.link, "_blank");

    div.innerHTML = `
      <div class="image-wrapper">
        <svg class="overlay-icon" viewBox="0 0 150 150" aria-hidden="true">
          <circle cx="75" cy="75" r="50" />
        </svg>
        <img
          src="${p.image}"
          alt="${p.name}"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/150'"
        />
      </div>

      <div class="product-info">
        <strong>${p.name}</strong>
        <span class="price">${p.currency} ${p.price}</span>
        <span>${p.category}</span>
      </div>
    `;

    container.appendChild(div);
  });
}

/**
 * Clear list and restart pagination
 */
function resetList() {
  page = 0;
  document.getElementById("product-list").innerHTML = "";
  loadMore();
}

// ==============================
// Infinite scroll
// ==============================

/**
 * Load more products when the sentinel becomes visible
 */
function setupInfiniteScroll() {
  const sentinel = document.getElementById("sentinel");

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  });

  observer.observe(sentinel);
}


