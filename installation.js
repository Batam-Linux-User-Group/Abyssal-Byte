/* =========================================
   INSTALLATION.JS - Halaman Linux Installation
   Daftar isi:
    1. Bantu pilih cara install
    2. Checklist persiapan (tersimpan di browser)
   ========================================= */

(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  /* =====================================================
     1. BANTU PILIH CARA INSTALL
     Dua jawaban -> satu rekomendasi
     ===================================================== */
  const answers = { windows: null, tujuan: null };
  const result = $("#pickerResult");

  const RECOMMEND = {
    "ya-coba": { method: "vm", text: "Pakai <b>Virtual Machine</b> (atau WSL). Paling aman, Windows tetap utuh." },
    "ya-harian": { method: "dual", text: "Pilih <b>Dual Boot</b>. Windows tetap ada, Linux jalan dengan performa penuh." },
    "tidak-coba": { method: "live", text: "Mulai dari <b>Live USB</b>. Coba dulu tanpa mengubah apa pun." },
    "tidak-harian": { method: "full", text: "Pilih <b>Install Penuh</b>. Jangan lupa backup semua data dulu." },
  };

  $$("[data-question]").forEach((group) => {
    $$(".chip", group).forEach((chip) => {
      chip.setAttribute("aria-pressed", "false");
      chip.addEventListener("click", () => {
        answers[group.dataset.question] = chip.dataset.answer;
        $$(".chip", group).forEach((c) => {
          const on = c === chip;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", String(on));
        });
        showRecommendation();
      });
    });
  });

  function showRecommendation() {
    if (!answers.windows || !answers.tujuan) {
      result.textContent = "Tinggal satu pertanyaan lagi.";
      return;
    }
    const pick = RECOMMEND[`${answers.windows}-${answers.tujuan}`];
    // Teks rekomendasi berasal dari data di atas (bukan input pengguna), jadi aman dipakai sebagai HTML
    result.innerHTML = `Rekomendasi: ${pick.text}`;
    $$(".method").forEach((card) => card.classList.toggle("is-picked", card.dataset.method === pick.method));
  }

  /* =====================================================
     2. CHECKLIST PERSIAPAN
     Disimpan di localStorage supaya tidak hilang saat halaman ditutup
     ===================================================== */
  const STORAGE_KEY = "abyssal-install-checklist";
  const boxes = $$("#prepList input[type='checkbox']");
  const ring = $("#prepRing");
  const percentText = $("#prepPercent");
  const status = $(".prep-status");
  const title = $("#prepTitle");
  const text = $("#prepText");

  function loadChecked() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveChecked() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boxes.filter((b) => b.checked).map((b) => b.value)));
    } catch (e) {
      /* browser memblokir penyimpanan, abaikan */
    }
  }

  function updateStatus() {
    const done = boxes.filter((b) => b.checked).length;
    const percent = Math.round((done / boxes.length) * 100);
    ring.style.setProperty("--p", percent);
    percentText.textContent = `${percent}%`;
    status.classList.toggle("is-ready", done === boxes.length);

    if (done === boxes.length) {
      title.textContent = "Siap install!";
      text.textContent = "Semua persiapan beres. Lanjut ke langkah instalasi di bawah.";
    } else if (done === 0) {
      title.textContent = "Belum siap";
      text.textContent = "Selesaikan semua persiapan sebelum mulai.";
    } else {
      title.textContent = `${boxes.length - done} lagi`;
      text.textContent = "Sedikit lagi. Jangan lewatkan backup data.";
    }
  }

  const saved = loadChecked();
  boxes.forEach((box) => {
    box.checked = saved.includes(box.value);
    box.addEventListener("change", () => {
      saveChecked();
      updateStatus();
    });
  });

  $("#prepReset").addEventListener("click", () => {
    boxes.forEach((box) => (box.checked = false));
    saveChecked();
    updateStatus();
  });

  updateStatus();
})();
