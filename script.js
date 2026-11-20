/* =========================================
   SCRIPT.JS
   Dipakai SEMUA halaman.

   Daftar isi:
    1. Status halaman (mana yang sudah jadi / belum)
    2. Notifikasi kecil (toast)
    3. Link ke halaman yang belum jadi
    4. Sidebar (bisa disembunyikan)
    5. Menu sidebar yang aktif
    6. Pencarian (Ctrl + K)
    7. Animasi muncul saat di-scroll
    8. Tombol salin & kembali ke atas
    9. Lain-lain (tahun di footer)

   Semua kode dibungkus (() => { ... })(); supaya nama variabel
   di sini tidak bentrok dengan file JS lain (distros.js, about.js).
   ========================================= */

(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = reduceMotion ? "auto" : "smooth";

  // Membuat elemen HTML beserta class dan teksnya
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* =====================================================
     1. STATUS HALAMAN
     Kalau halaman Commands / Installation sudah selesai dibuat,
     cukup ubah "ready: false" menjadi "ready: true".
     ===================================================== */
  const PAGES = {
    "commands.html": { name: "Commands", ready: true },
    "installation.html": { name: "Installation", ready: true },
  };

  const currentPage = location.pathname.split("/").pop() || "index.html";

  // "about.html#sejarah" -> "about.html", "#team" -> halaman saat ini
  function pageOf(href) {
    const path = href.split("#")[0].split("?")[0];
    return path === "" ? currentPage : path.split("/").pop();
  }

  function notReadyPage(href) {
    const page = PAGES[pageOf(href)];
    return page && !page.ready ? page : null;
  }

  /* =====================================================
     2. NOTIFIKASI KECIL (TOAST)
     ===================================================== */
  const toastWrap = el("div", "toast-wrap");
  toastWrap.setAttribute("role", "status");
  toastWrap.setAttribute("aria-live", "polite");
  document.body.appendChild(toastWrap);

  function toast(message) {
    toastWrap.replaceChildren(); // satu notifikasi saja dalam satu waktu
    const item = el("div", "toast", message);
    toastWrap.appendChild(item);
    setTimeout(() => {
      item.classList.add("is-leaving");
      setTimeout(() => item.remove(), 300);
    }, 3200);
  }

  /* =====================================================
     3. LINK KE HALAMAN YANG BELUM JADI
     Diberi label "Segera" dan tidak membuka halaman kosong (404).
     ===================================================== */
  $$("a[href]").forEach((link) => {
    if (!notReadyPage(link.getAttribute("href"))) return;
    link.classList.add("is-soon");
    if (link.matches(".nav-link, .path-card")) {
      link.appendChild(el("span", "nav-soon", "Segera"));
    }
    const cta = $(".path-cta span", link);
    if (cta) cta.textContent = "Segera hadir";
  });

  // Pakai "event delegation" supaya link yang dibuat belakangan
  // (misalnya kartu distro dari distros.js) juga ikut tertangani
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const page = notReadyPage(link.getAttribute("href"));
    if (!page) return;
    event.preventDefault();
    toast(`Halaman ${page.name} sedang disiapkan tim kami. Nantikan ya!`);
  });

  /* =====================================================
     4. SIDEBAR
     - Laptop: tombol ☰ menyembunyikan/menampilkan sidebar (diingat browser)
     - HP & tablet: tombol ☰ membuka sidebar sebagai menu geser.
       Class "open"-nya diubah oleh kode asli Zull di bagian paling bawah file;
       kode di sini hanya menyesuaikan latar gelap & keterangan tombol.
     ===================================================== */
  const sidebar = $("#sidebar");
  const menuToggle = $("#menuToggle");
  const root = document.documentElement;
  const isDesktop = window.matchMedia("(min-width: 961px)");
  const NAV_KEY = "abyssal-nav-hidden";
  const backdrop = el("div", "sidebar-backdrop");
  backdrop.hidden = true;
  document.body.appendChild(backdrop);

  // Menyesuaikan latar gelap, scroll, dan keterangan tombol dengan kondisi sidebar
  function syncSidebar() {
    const open = !isDesktop.matches && sidebar.classList.contains("open");
    backdrop.hidden = !open;
    document.body.classList.toggle("no-scroll", open);
    const visible = isDesktop.matches ? !root.classList.contains("nav-hidden") : open;
    const label = visible ? "Sembunyikan menu" : "Tampilkan menu";
    menuToggle.setAttribute("aria-expanded", String(visible));
    menuToggle.setAttribute("aria-label", label);
    menuToggle.title = label;
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    syncSidebar();
  }

  // Sembunyikan / tampilkan sidebar di laptop
  function setNavHidden(hidden) {
    root.classList.toggle("nav-hidden", hidden);
    try {
      localStorage.setItem(NAV_KEY, hidden ? "1" : "0");
    } catch (e) {
      /* abaikan */
    }
    // Beri tahu elemen lain (misalnya carousel distro) bahwa lebar konten berubah
    setTimeout(() => window.dispatchEvent(new Event("resize")), 320);
  }

  menuToggle.addEventListener("click", () => {
    if (isDesktop.matches) setNavHidden(!root.classList.contains("nav-hidden"));
    // Tunggu kode Zull selesai mengubah class "open", baru disesuaikan
    setTimeout(() => {
      if (isDesktop.matches) sidebar.classList.remove("open"); // class "open" hanya untuk HP
      syncSidebar();
    }, 0);
  });
  backdrop.addEventListener("click", closeSidebar);
  $$(".nav-link, .nav-sublink", sidebar).forEach((link) =>
    link.addEventListener("click", () => {
      if (!isDesktop.matches) setTimeout(closeSidebar, 0);
    })
  );

  // Submenu Home: tombol panah membuka/menutup Distributions & Our Team
  const dashArrow = $("#navDashArrow");
  const DASH_KEY = "abyssal-nav-dashboard";

  function syncDashArrow() {
    const open = root.classList.contains("nav-dash-open");
    dashArrow.setAttribute("aria-expanded", String(open));
    dashArrow.setAttribute("aria-label", open ? "Tutup submenu Home" : "Buka submenu Home");
  }

  if (dashArrow) {
    dashArrow.addEventListener("click", () => {
      const open = !root.classList.contains("nav-dash-open");
      root.classList.toggle("nav-dash-open", open);
      try {
        localStorage.setItem(DASH_KEY, open ? "1" : "0");
      } catch (e) {
        /* abaikan */
      }
      syncDashArrow();
    });
    syncDashArrow();
  }
  // Kalau layar berubah ukuran (HP <-> laptop), tutup menu geser
  isDesktop.addEventListener("change", closeSidebar);
  syncSidebar();

  /* =====================================================
     5. MENU SIDEBAR YANG AKTIF
     Mengikuti halaman yang dibuka & bagian yang sedang dilihat.
     ===================================================== */
  const navLinks = $$(".nav-menu .nav-link, .nav-menu .nav-sublink");
  // Menu utama untuk halaman ini (tanpa tanda #)
  const pageLink = navLinks.find((a) => pageOf(a.getAttribute("href")) === currentPage && !a.hash);
  // Submenu yang menunjuk ke bagian di halaman ini (misalnya #distros, #team)
  const sectionLinks = $$(".nav-menu .nav-sublink").filter(
    (a) => pageOf(a.getAttribute("href")) === currentPage && document.getElementById(a.hash.slice(1))
  );

  function updateActiveNav() {
    let activeSub = null;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    sectionLinks.forEach((link) => {
      const section = document.getElementById(link.hash.slice(1));
      if (section.getBoundingClientRect().top <= 160 || atBottom) activeSub = link;
    });

    navLinks.forEach((link) => {
      const on = link.classList.contains("nav-sublink") ? link === activeSub : link === pageLink;
      link.classList.toggle("active", on);
      if (on) link.setAttribute("aria-current", link.classList.contains("nav-sublink") ? "location" : "page");
      else link.removeAttribute("aria-current");
    });
  }

  let navTicking = false;
  window.addEventListener("scroll", () => {
    if (navTicking) return;
    navTicking = true;
    requestAnimationFrame(() => {
      updateActiveNav();
      navTicking = false;
    });
  }, { passive: true });
  updateActiveNav();

  /* =====================================================
     6. PENCARIAN (CTRL + K)
     Daftar di bawah ini yang bisa dicari. Tambahkan baris baru
     kalau ada halaman/materi baru.
     ===================================================== */
  const SEARCH_ITEMS = [
    { title: "Home", desc: "Halaman utama website", href: "index.html", group: "Halaman", keywords: "dashboard beranda utama awal" },
    { title: "About Linux", desc: "Pengertian, sejarah, fungsi, dan keunggulan", href: "about.html", group: "Halaman", keywords: "tentang materi" },
    { title: "Distributions", desc: "20 distro Linux populer", href: "index.html#distros", group: "Halaman", keywords: "distro distribusi pilih download unduh" },
    { title: "Commands", desc: "8 perintah dasar terminal Linux", href: "commands.html", group: "Halaman", keywords: "perintah terminal cli bash command pwd ls cd mkdir touch cat rm sudo" },
    { title: "Installation", desc: "Panduan instalasi Linux", href: "installation.html", group: "Halaman", keywords: "install pasang instalasi panduan iso usb" },
    { title: "Our Team", desc: "Kelompok 3 Abyssal Byte", href: "index.html#team", group: "Halaman", keywords: "tim kelompok anggota abyssal byte" },
    { title: "Apa itu Linux?", desc: "Kernel, GNU/Linux, dan distro", href: "about.html#pengertian", group: "Materi", keywords: "pengertian kernel gnu open source definisi" },
    { title: "Sejarah Linux", desc: "Dari Unix 1969 sampai Linux 7", href: "about.html#sejarah", group: "Materi", keywords: "history linus torvalds stallman minix 1991 tahun timeline" },
    { title: "Fungsi Linux", desc: "Apa saja yang dikerjakan Linux", href: "about.html#fungsi", group: "Materi", keywords: "proses memori file jaringan hardware driver" },
    { title: "Karakteristik Linux", desc: "Open source, multiuser, multitasking, dll.", href: "about.html#karakteristik", group: "Materi", keywords: "ciri khas portabel case sensitive shell" },
    { title: "Simulator chmod", desc: "Atur hak akses file r, w, x", href: "about.html#simulator", group: "Materi", keywords: "permission izin hak akses rwx 755 644 777 keamanan" },
    { title: "Keunggulan Linux", desc: "Kenapa banyak yang memilih Linux", href: "about.html#keunggulan", group: "Materi", keywords: "kelebihan gratis aman stabil ringan" },
    { title: "Linux vs Windows vs macOS", desc: "Perbandingan singkat", href: "about.html#perbandingan", group: "Materi", keywords: "banding perbandingan windows mac" },
    { title: "Kuis Linux", desc: "Cek pemahamanmu", href: "about.html#kuis", group: "Materi", keywords: "quiz latihan soal tes" },
    { title: "Simulator Terminal", desc: "Latihan perintah langsung di browser", href: "commands.html#simulator", group: "Materi", keywords: "latihan coba terminal praktik" },
    { title: "Tips Terminal", desc: "Shortcut dan kebiasaan aman", href: "commands.html#tips", group: "Materi", keywords: "shortcut tab ctrl c history aman" },
    { title: "Cara Install Linux", desc: "Live USB, virtual machine, dual boot", href: "installation.html#cara", group: "Materi", keywords: "virtualbox vm dual boot live usb wsl" },
    { title: "Checklist Persiapan", desc: "Yang perlu disiapkan sebelum install", href: "installation.html#persiapan", group: "Materi", keywords: "backup iso flashdisk spesifikasi persiapan" },
    { title: "Langkah Instalasi", desc: "Dari download ISO sampai update", href: "installation.html#langkah", group: "Materi", keywords: "langkah step rufus bios uefi partisi" },
    { title: "Tombol Boot Menu", desc: "Tombol boot tiap merek laptop", href: "installation.html#boot", group: "Materi", keywords: "bios f12 f2 esc asus acer lenovo hp dell" },
    { title: "FAQ Instalasi", desc: "Pertanyaan yang sering muncul", href: "installation.html#faq", group: "Materi", keywords: "faq tanya data hilang windows" },
  ];

  // Ikon kecil untuk tiap hasil pencarian
  const ICON_PATHS = {
    Halaman: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
    Materi: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
    Distro: "M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    Perintah: "M4 17l6-6-6-6M12 19h8",
    search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  };
  const SVG_NS = "http://www.w3.org/2000/svg";

  function makeIcon(group) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", ICON_PATHS[group] || ICON_PATHS.Halaman);
    svg.appendChild(path);
    return svg;
  }

  // Kalau ada data distro (distros.js) atau data perintah (commands.js), ikut bisa dicari
  function allSearchItems() {
    const items = [...SEARCH_ITEMS];
    if (Array.isArray(window.COMMANDS)) {
      window.COMMANDS.forEach((c) => {
        items.push({
          title: c.cmd,
          desc: c.desc,
          href: `commands.html#cmd-${c.id}`,
          group: "Perintah",
          keywords: `${c.cat} ${c.example}`,
          command: c.id,
        });
      });
    }
    if (typeof distros !== "undefined" && Array.isArray(distros)) {
      distros.forEach((d) => {
        items.push({
          title: d.name.trim(),
          desc: d.desc,
          href: "index.html#distros",
          group: "Distro",
          keywords: d.tags.join(" "),
          distro: d.slug,
        });
      });
    }
    return items;
  }

  // Membuat jendela pencarian (dibuat lewat JS supaya tidak perlu ditulis di tiap halaman)
  const modal = el("div", "search-modal");
  modal.id = "searchModal";
  modal.hidden = true;

  const dialog = el("div", "search-dialog");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", "Pencarian");

  const field = el("div", "search-field");
  const searchInput = el("input");
  searchInput.id = "searchInput";
  searchInput.type = "search";
  searchInput.placeholder = "Cari materi, distro, atau halaman...";
  searchInput.autocomplete = "off";
  searchInput.setAttribute("role", "combobox");
  searchInput.setAttribute("aria-controls", "searchResults");
  searchInput.setAttribute("aria-expanded", "true");
  searchInput.setAttribute("aria-label", "Kata kunci pencarian");
  const escHint = el("kbd", "", "Esc");
  field.append(makeIcon("search"), searchInput, escHint);

  const resultList = el("ul", "search-results");
  resultList.id = "searchResults";
  resultList.setAttribute("role", "listbox");

  const foot = el("div", "search-foot");
  [["↑ ↓", "pilih"], ["Enter", "buka"], ["Esc", "tutup"]].forEach(([key, label]) => {
    const span = el("span");
    span.append(el("kbd", "", key), label);
    foot.appendChild(span);
  });

  const modalBackdrop = el("div", "search-backdrop");
  dialog.append(field, resultList, foot);
  modal.append(modalBackdrop, dialog);
  document.body.appendChild(modal);

  let results = [];
  let activeIndex = 0;
  let lastFocus = null;

  const normalize = (text) => text.toLowerCase().replace(/\s+/g, " ").trim();

  function findItems(query) {
    const words = normalize(query).split(" ").filter(Boolean);
    const items = allSearchItems();
    if (words.length === 0) return items.filter((item) => item.group === "Halaman");

    return items
      .map((item) => {
        const haystack = normalize(`${item.title} ${item.desc} ${item.keywords || ""}`);
        if (!words.every((word) => haystack.includes(word))) return null;
        const title = normalize(item.title);
        const score = title.startsWith(words[0]) ? 3 : title.includes(words[0]) ? 2 : 1;
        return { item, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((result) => result.item);
  }

  function renderResults() {
    results = findItems(searchInput.value);
    activeIndex = 0;
    resultList.replaceChildren();

    if (results.length === 0) {
      resultList.appendChild(el("li", "search-empty", `Tidak ada hasil untuk "${searchInput.value}". Coba kata lain, misalnya "kernel" atau "ubuntu".`));
      searchInput.removeAttribute("aria-activedescendant");
      return;
    }

    // Kelompokkan hasil: Halaman, Materi, Distro
    const groups = [...new Set(results.map((item) => item.group))];
    groups.forEach((group) => {
      resultList.appendChild(el("li", "search-group", group));
      results.forEach((item, index) => {
        if (item.group !== group) return;
        const li = el("li", "search-item");
        li.id = `search-item-${index}`;
        li.setAttribute("role", "option");
        const icon = el("span", "search-ic");
        icon.appendChild(makeIcon(item.group));
        const text = el("span", "search-text");
        text.append(el("b", "", item.title), el("small", "", item.desc));
        li.append(icon, text);
        if (notReadyPage(item.href)) li.appendChild(el("span", "nav-soon", "Segera"));
        li.addEventListener("mousemove", () => setActive(index));
        li.addEventListener("click", () => openItem(item));
        resultList.appendChild(li);
      });
    });
    setActive(0);
  }

  function setActive(index) {
    activeIndex = index;
    $$(".search-item", resultList).forEach((li) => {
      const on = li.id === `search-item-${index}`;
      li.classList.toggle("is-active", on);
      li.setAttribute("aria-selected", String(on));
      if (on) {
        li.scrollIntoView({ block: "nearest" });
        searchInput.setAttribute("aria-activedescendant", li.id);
      }
    });
  }

  function openSearch() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    searchInput.value = "";
    renderResults();
    searchInput.focus();
  }

  function closeSearch() {
    modal.hidden = true;
    // Kosongkan kata kunci supaya menu yang diredupkan kode Zull kembali normal
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  // Membuka hasil pencarian yang dipilih
  function openItem(item) {
    const page = notReadyPage(item.href);
    if (page) {
      closeSearch();
      toast(`Halaman ${page.name} sedang disiapkan tim kami. Nantikan ya!`);
      return;
    }

    const hash = item.href.includes("#") ? item.href.split("#")[1] : "";
    if (pageOf(item.href) !== currentPage) {
      location.href = item.href;
      return;
    }

    // Masih di halaman yang sama: cukup gulir ke bagiannya
    closeSearch();
    const target = hash ? document.getElementById(hash) : null;
    if (target) {
      target.scrollIntoView({ behavior: scrollBehavior, block: "start" });
      history.replaceState(null, "", `#${hash}`);
    } else {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    }
    if (item.distro && typeof window.showDistro === "function") {
      setTimeout(() => window.showDistro(item.distro), 450);
    }
    if (item.command && typeof window.showCommand === "function") {
      window.showCommand(item.command);
    }
  }

  searchInput.addEventListener("input", renderResults);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setActive((activeIndex + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setActive((activeIndex - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      openItem(results[activeIndex]);
    }
  });

  modalBackdrop.addEventListener("click", closeSearch);
  $$("[data-search-open]").forEach((btn) => btn.addEventListener("click", openSearch));

  // Shortcut keyboard: Ctrl + K (atau tombol /) untuk mencari, Esc untuk menutup
  document.addEventListener("keydown", (event) => {
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (modal.hidden) openSearch();
      else closeSearch();
    } else if (event.key === "/" && !typing && modal.hidden) {
      event.preventDefault();
      openSearch();
    } else if (event.key === "Escape") {
      if (!modal.hidden) closeSearch();
      else if (sidebar.classList.contains("open")) closeSidebar();
    }
  });

  /* =====================================================
     7. ANIMASI MUNCUL SAAT DI-SCROLL
     Elemen ber-class "reveal" muncul pelan-pelan saat masuk layar.
     ===================================================== */
  const revealObserver = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver((entries) => {
        let order = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const item = entry.target;
          setTimeout(() => item.classList.add("is-visible"), order * 80);
          order += 1;
          revealObserver.unobserve(item);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" })
    : null;

  // Bisa dipanggil lagi oleh file JS lain untuk elemen yang dibuat belakangan
  window.observeReveal = (root = document) => {
    $$(".reveal:not(.is-visible)", root).forEach((item) => {
      if (revealObserver) revealObserver.observe(item);
      else item.classList.add("is-visible");
    });
  };
  window.observeReveal();

  /* =====================================================
     8. TOMBOL SALIN & KEMBALI KE ATAS
     ===================================================== */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Cadangan untuk browser lama / saat dibuka langsung dari file
      const area = el("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      area.remove();
      return ok;
    }
  }

  // Semua tombol .copy-btn[data-copy] (termasuk yang dibuat belakangan)
  document.addEventListener("click", async (event) => {
    const btn = event.target.closest(".copy-btn[data-copy]");
    if (!btn) return;
    const ok = await copyText(btn.dataset.copy);
    if (!ok) return;
    const icon = $("use", btn);
    btn.classList.add("is-copied");
    if (icon) icon.setAttribute("href", "#i-check");
    toast(`Tersalin: ${btn.dataset.copy}`);
    setTimeout(() => {
      btn.classList.remove("is-copied");
      if (icon) icon.setAttribute("href", "#i-copy");
    }, 1500);
  });

  const toTop = $("#toTop");
  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: scrollBehavior }));
    const updateToTop = () => toTop.classList.toggle("is-show", window.scrollY > 600);
    window.addEventListener("scroll", updateToTop, { passive: true });
    updateToTop();
  }

  /* =====================================================
     9. LAIN-LAIN
     ===================================================== */
  // Tahun di footer selalu tahun sekarang
  $$("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();


/* ###################################################################
   KODE ASLI (Zull)
   Kode di bawah ini adalah script.js awal buatan Zull dan sengaja tidak
   dihapus. Diletakkan paling bawah karena membutuhkan kolom pencarian
   (#searchInput) yang dibuat oleh kode di atas.
   ################################################################### */

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// Menandai menu yang sedang dipilih
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    if (link.closest(".nav-menu")) link.classList.add("active");
    if (window.innerWidth <= 760) sidebar.classList.remove("open");
  });
});

// Shortcut Ctrl + K untuk menuju kolom pencarian
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("searchInput").focus();
  }
});

// Pencarian sederhana pada judul dan tautan dashboard
document.getElementById("searchInput").addEventListener("input", (event) => {
  const keyword = event.target.value.toLowerCase().trim();
  document.querySelectorAll(".news-item, .quick-link, .nav-menu .nav-link").forEach((item) => {
    item.style.opacity = !keyword || item.textContent.toLowerCase().includes(keyword) ? "1" : ".25";
  });
});
