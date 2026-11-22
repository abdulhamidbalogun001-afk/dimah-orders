
// ======================================
// DIMAH ORDERS
// Business Management System
// ======================================

const STORAGE_KEY = "dimah_orders_v1";

// Demo data for first-time visitors
const demoOrders = [
  {
    id: "DMH-1001",
    customer: "Aisha Bello",
    phone: "08012345678",
    product: "Custom Two-Piece",
    amount: 85000,
    paid: 85000,
    status: "Completed",
    date: "2026-11-20",
    delivery: "2026-11-25"
  },
  {
    id: "DMH-1002",
    customer: "Daniel James",
    phone: "08023456789",
    product: "Corporate Shirt",
    amount: 45000,
    paid: 20000,
    status: "Processing",
    date: "2026-11-21",
    delivery: "2026-11-28"
  },
  {
    id: "DMH-1003",
    customer: "Mary Johnson",
    phone: "08034567890",
    product: "Native Outfit",
    amount: 120000,
    paid: 0,
    status: "Pending",
    date: "2026-11-22",
    delivery: "2026-12-02"
  }
];

// ======================================
// DATA STORAGE
// ======================================

function loadOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(demoOrders)
      );
      return [...demoOrders];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load orders:", error);
    return [];
  }
}

let orders = loadOrders();

function saveOrders() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(orders)
    );
  } catch (error) {
    alert("Unable to save. Your browser storage may be full.");
    console.error(error);
  }
}

// ======================================
// HELPER FUNCTIONS
// ======================================

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(date) {
  if (!date) return "Not set";

  return new Date(date + "T00:00:00").toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function statusClass(status) {
  return status.toLowerCase();
}

function statusBadge(status) {
  return `<span class="status ${statusClass(status)}">
    ${escapeHTML(status)}
  </span>`;
}

function getBalance(order) {
  return Math.max(0, order.amount - order.paid);
}

// ======================================
// DASHBOARD STATISTICS
// ======================================

function updateDashboard() {
  const total = orders.length;

  const pending = orders.filter(
    order => order.status === "Pending"
  ).length;

  const completed = orders.filter(
    order => order.status === "Completed"
  ).length;

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.paid),
    0
  );

  document.getElementById("totalOrders").textContent = total;

  document.getElementById("pendingOrders").textContent = pending;

  document.getElementById("completedOrders").textContent = completed;

  document.getElementById("totalRevenue").textContent =
    formatCurrency(revenue);
}

// ======================================
// RECENT ORDERS
// ======================================

function renderRecentOrders() {
  const container = document.getElementById("recentOrders");
  const empty = document.getElementById("recentEmpty");

  const recent = [...orders]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5);

  empty.style.display = recent.length ? "none" : "block";

  container.innerHTML = recent.map(order => `
    <tr>
      <td>${escapeHTML(order.id)}</td>
      <td>${escapeHTML(order.customer)}</td>
      <td>${escapeHTML(order.product)}</td>
      <td>${formatCurrency(order.amount)}</td>
      <td>${statusBadge(order.status)}</td>
    </tr>
  `).join("");
}

// ======================================
// ALL ORDERS
// ======================================

function renderOrders() {
  const container = document.getElementById("ordersTable");
  const empty = document.getElementById("ordersEmpty");

  const search = document.getElementById("searchInput")
    .value.toLowerCase().trim();

  const status = document.getElementById("statusFilter").value;

  const filtered = orders.filter(order => {
    const matchesSearch = [
      order.id,
      order.customer,
      order.phone,
      order.product
    ].some(value => String(value).toLowerCase().includes(search));

    const matchesStatus =
      status === "All" || order.status === status;

    return matchesSearch && matchesStatus;
  });

  empty.style.display = filtered.length ? "none" : "block";

  container.innerHTML = filtered.map(order => `
    <tr>
      <td>${escapeHTML(order.id)}</td>
      <td>${escapeHTML(order.customer)}</td>
      <td>${escapeHTML(order.product)}</td>
      <td>${formatCurrency(order.amount)}</td>
      <td>${statusBadge(order.status)}</td>
      <td>${formatDate(order.date)}</td>
      <td>
        <select class="action-select"
          data-order-id="${escapeHTML(order.id)}"
          aria-label="Update status for ${escapeHTML(order.id)}">
          <option value="">Update</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
        </select>
      </td>
    </tr>
  `).join("");
}

// ======================================
// CUSTOMERS
// ======================================

function renderCustomers() {
  const container = document.getElementById("customersTable");
  const empty = document.getElementById("customersEmpty");

  const customers = {};

  orders.forEach(order => {
    const key = order.phone;

    if (!customers[key]) {
      customers[key] = {
        name: order.customer,
        phone: order.phone,
        count: 0,
        spent: 0
      };
    }

    customers[key].count++;
    customers[key].spent += Number(order.paid);
  });

  const list = Object.values(customers);

  empty.style.display = list.length ? "none" : "block";

  container.innerHTML = list.map(customer => `
    <tr>
      <td>${escapeHTML(customer.name)}</td>
      <td>${escapeHTML(customer.phone)}</td>
      <td>${customer.count}</td>
      <td>${formatCurrency(customer.spent)}</td>
    </tr>
  `).join("");
}

// ======================================
// PAYMENTS
// ======================================

function renderPayments() {
  const container = document.getElementById("paymentsTable");
  const empty = document.getElementById("paymentsEmpty");

  empty.style.display = orders.length ? "none" : "block";

  container.innerHTML = orders.map(order => `
    <tr>
      <td>${escapeHTML(order.id)}</td>
      <td>${escapeHTML(order.customer)}</td>
      <td>${formatCurrency(order.amount)}</td>
      <td>${formatCurrency(order.paid)}</td>
      <td>${formatCurrency(getBalance(order))}</td>
    </tr>
  `).join("");
}

// ======================================
// REFRESH ALL DATA
// ======================================

function refreshApp() {
  updateDashboard();
  renderRecentOrders();
  renderOrders();
  renderCustomers();
  renderPayments();
}

// ======================================
// CREATE ORDER
// ======================================

const modal = document.getElementById("orderModal");
const form = document.getElementById("orderForm");

function openModal() {
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  form.reset();
  document.getElementById("amountPaid").value = "0";
}

document.getElementById("addOrderBtn")
  .addEventListener("click", openModal);

document.getElementById("closeModal")
  .addEventListener("click", closeModal);

document.getElementById("cancelModal")
  .addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

form.addEventListener("submit", event => {
  event.preventDefault();

  const customer = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const product = document.getElementById("productName").value.trim();

  const amount = Number(document.getElementById("orderAmount").value);
  const paid = Number(document.getElementById("amountPaid").value);

  const status = document.getElementById("orderStatus").value;
  const delivery = document.getElementById("deliveryDate").value;

  if (!customer || !phone || !product) {
    alert("Please complete all required fields.");
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Enter a valid order amount.");
    return;
  }

  if (!Number.isFinite(paid) || paid < 0 || paid > amount) {
    alert("Amount paid must be between zero and the order total.");
    return;
  }

  const newOrder = {
    id: "DMH-" + Date.now().toString().slice(-8),
    customer,
    phone,
    product,
    amount,
    paid,
    status,
    date: new Date().toISOString().slice(0, 10),
    delivery
  };

  orders.unshift(newOrder);

  saveOrders();
  refreshApp();
  closeModal();

  alert("Order created successfully!");
});

// ======================================
// UPDATE ORDER STATUS
// ======================================

document.getElementById("ordersTable")
  .addEventListener("change", event => {

    const select = event.target;

    if (!select.matches(".action-select")) return;

    const id = select.dataset.orderId;
    const newStatus = select.value;

    const order = orders.find(item => item.id === id);

    if (!order || !newStatus) return;

    order.status = newStatus;

    saveOrders();
    refreshApp();
  });

// ======================================
// SEARCH AND FILTER
// ======================================

document.getElementById("searchInput")
  .addEventListener("input", renderOrders);

document.getElementById("statusFilter")
  .addEventListener("change", renderOrders);

// ======================================
// NAVIGATION
// ======================================

const pages = {
  overview: {
    title: "Overview",
    subtitle: "Here's what's happening with your business today."
  },
  orders: {
    title: "Orders",
    subtitle: "Manage and track your customer orders."
  },
  customers: {
    title: "Customers",
    subtitle: "Manage your customer relationships."
  },
  payments: {
    title: "Payments",
    subtitle: "Monitor payments and outstanding balances."
  }
};

function navigate(page) {
  if (!pages[page]) return;

  document.querySelectorAll(".page").forEach(section => {
    section.classList.add("hidden");
  });

  document.getElementById(page + "Page").classList.remove("hidden");

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });

  document.getElementById("pageTitle").textContent =
    pages[page].title;

  document.getElementById("pageSubtitle").textContent =
    pages[page].subtitle;

  document.getElementById("breadcrumbTitle").textContent =
    pages[page].title;

  document.getElementById("addOrderBtn").style.display =
    page === "overview" || page === "orders" ? "block" : "none";

  document.getElementById("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    navigate(button.dataset.page);
  });
});

// View all orders shortcut
document.getElementById("viewAllBtn")
  .addEventListener("click", () => navigate("orders"));

// Mobile sidebar
document.getElementById("menuBtn")
  .addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

// ======================================
// DATE AND INITIALIZATION
// ======================================

document.getElementById("todayDate").textContent =
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).toUpperCase();

refreshApp();
navigate("overview");

console.log("DIMAH ORDERS initialized successfully.");
