let allProducts = [];
let filteredProducts = [];
let page = 0;
const PAGE_SIZE = 10;

fetch("data/products.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    filteredProducts = data;
    initCategoryFilter();
    loadMore();
    setupInfiniteScroll();
  });

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

function loadMore() {
  const start = page * PAGE_SIZE;
  const next = filteredProducts.slice(start, start + PAGE_SIZE);
  page++;
  render(next);
}

function render(list) {
  const container = document.getElementById("product-list");

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.onclick = () => window.open(p.link, "_blank");

    div.innerHTML = `
    <div class="image-wrapper">
      <svg class="overlay-icon">
      <circle>
      </svg>
      <img src="${p.image}"
           alt="${p.name}"
           loading="lazy"
           onerror="this.src='https://via.placeholder.com/80'" />
    <div>
      <div class="product-info">
        <strong>${p.name}</strong>
        <span class="price">${p.currency} ${p.price}</span>
        <span>${p.category}</span>
      </div>
    
    `;

    container.appendChild(div);
  });
}

function setupInfiniteScroll() {
  const sentinel = document.getElementById("sentinel");

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  });

  observer.observe(sentinel);
}

function sortBy(key) {
  filteredProducts.sort((a, b) =>
    a[key] > b[key] ? 1 : -1
  );
  resetList();
}

function filterByCategory() {
  const selected = document.getElementById("categoryFilter").value;

  filteredProducts =
    selected === "all"
      ? allProducts
      : allProducts.filter(p => p.category === selected);

  resetList();
}

function resetList() {
  page = 0;
  document.getElementById("product-list").innerHTML = "";
  loadMore();
}


