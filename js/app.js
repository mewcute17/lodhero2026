(function () {
  const entries = window.PATCH_ENTRIES || [];
  const CATEGORY_ALL = "all";
  const CHANGE_ALL = "all";

  const categories = [
    { id: CATEGORY_ALL, label: "All" },
    { id: "unit", label: "Units" },
    { id: "ability", label: "Abilities" },
    { id: "ai", label: "AI" },
    { id: "drop", label: "Drops" },
  ];

  const changes = [
    { id: CHANGE_ALL, label: "All" },
    { id: "buff", label: "Buff" },
    { id: "nerf", label: "Nerf" },
    { id: "rework", label: "Rework" },
    { id: "neutral", label: "Neutral" },
  ];

  const qEl = document.getElementById("q");
  const clearEl = document.getElementById("clear");
  const categoryChips = document.getElementById("category-chips");
  const changeChips = document.getElementById("change-chips");
  const resultsEl = document.getElementById("results");
  const emptyEl = document.getElementById("empty");
  const countEl = document.getElementById("result-count");

  let category = CATEGORY_ALL;
  let change = CHANGE_ALL;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function highlight(text, query) {
    const t = escapeHtml(text);
    const q = query.trim();
    if (!q) return t;
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      const re = new RegExp("(" + safe + ")", "gi");
      return t.replace(re, "<mark>$1</mark>");
    } catch {
      return t;
    }
  }

  function badgeClassCat(cat) {
    const map = {
      unit: "badge-cat-unit",
      ability: "badge-cat-ability",
      ai: "badge-cat-ai",
      drop: "badge-cat-drop",
    };
    return map[cat] || "";
  }

  function badgeClassChange(ch) {
    const map = {
      buff: "badge-change-buff",
      nerf: "badge-change-nerf",
      rework: "badge-change-rework",
      neutral: "badge-change-neutral",
    };
    return map[ch] || "badge-change-neutral";
  }

  function labelCat(cat) {
    const c = categories.find((x) => x.id === cat);
    return c ? c.label : cat;
  }

  function labelChange(ch) {
    const c = changes.find((x) => x.id === ch);
    return c ? c.label : ch;
  }

  function matchesQuery(entry, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    const blob = [
      entry.name,
      entry.summary,
      entry.detail,
      entry.patch,
      labelCat(entry.category),
      labelChange(entry.change),
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  }

  function filterEntries() {
    const query = qEl.value;
    return entries.filter((e) => {
      if (category !== CATEGORY_ALL && e.category !== category) return false;
      if (change !== CHANGE_ALL && e.change !== change) return false;
      return matchesQuery(e, query);
    });
  }

  function renderChips(container, items, selected, onSelect) {
    container.innerHTML = "";
    items.forEach((item) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = item.label;
      b.setAttribute("aria-pressed", item.id === selected ? "true" : "false");
      b.addEventListener("click", () => onSelect(item.id));
      container.appendChild(b);
    });
  }

  function render() {
    const list = filterEntries();
    const query = qEl.value;

    countEl.textContent =
      list.length === entries.length
        ? "Showing all " + list.length + " entries."
        : "Showing " + list.length + " of " + entries.length + " entries.";

    resultsEl.innerHTML = "";
    if (list.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    list.forEach((e) => {
      const li = document.createElement("li");
      li.className = "card";
      li.innerHTML =
        '<div class="card-top">' +
        "<h2 class=\"card-title\">" +
        highlight(e.name, query) +
        "</h2>" +
        '<span class="patch">Patch ' +
        highlight(e.patch, query) +
        "</span>" +
        '<div class="badges">' +
        '<span class="badge ' +
        badgeClassCat(e.category) +
        '">' +
        escapeHtml(labelCat(e.category)) +
        "</span>" +
        '<span class="badge ' +
        badgeClassChange(e.change) +
        '">' +
        escapeHtml(labelChange(e.change)) +
        "</span>" +
        "</div>" +
        "</div>" +
        '<p class="card-body">' +
        highlight(e.summary, query) +
        "</p>" +
        (e.detail
          ? '<p class="detail-line">' + highlight(e.detail, query) + "</p>"
          : "");
      resultsEl.appendChild(li);
    });
  }

  function setCategory(id) {
    category = id;
    renderChips(categoryChips, categories, category, setCategory);
    render();
  }

  function setChange(id) {
    change = id;
    renderChips(changeChips, changes, change, setChange);
    render();
  }

  qEl.addEventListener("input", render);
  qEl.addEventListener("search", render);
  clearEl.addEventListener("click", () => {
    qEl.value = "";
    setCategory(CATEGORY_ALL);
    setChange(CHANGE_ALL);
    render();
  });

  renderChips(categoryChips, categories, category, setCategory);
  renderChips(changeChips, changes, change, setChange);
  render();
})();
