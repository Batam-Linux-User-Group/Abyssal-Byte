/* =========================================
   ABOUT.JS - Frontend Developer 2
   Semua interaksi di halaman About Linux (about.html).

   Daftar isi:
    1. Animasi terminal mengetik (hero)
    2. Garis progres baca + tombol kembali ke atas
    3. Animasi muncul saat di-scroll
    4. Angka berjalan (counter)
    5. Sub-navigasi yang mengikuti posisi scroll
    6. Diagram lapisan sistem Linux
    7. Timeline sejarah: filter era + garis kuning
    8. Tab karakteristik
    9. Simulator hak akses file (chmod)
   10. Tombol salin perintah
   11. Kuis
   12. Pencarian di halaman

   Semua kode dibungkus (() => { ... })(); supaya nama variabel
   di sini tidak bentrok dengan variabel di script.js
   (misalnya "sidebar" dan "menuToggle").
   ========================================= */

(() => {
  // Kalau pengguna mengaktifkan "kurangi animasi" di perangkatnya, animasi dimatikan
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fungsi bantu singkat untuk mengambil elemen
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  // Membuat elemen HTML beserta class dan teksnya
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* =====================================================
     1. ANIMASI TERMINAL MENGETIK
     ===================================================== */
  const terminal = $("#alTerminal");
  const PROMPT = "abyssal@byte:~$ ";
  const terminalScript = [
    { cmd: "whoami", out: ["tux"] },
    { cmd: "uname -o", out: ["GNU/Linux"] },
    {
      cmd: "cat about-linux.txt",
      out: [
        "Kernel open source buatan Linus Torvalds (1991)",
        "Lisensi : GNU GPL v2",
        "Dipakai : server, Android, cloud, superkomputer",
      ],
    },
    { cmd: 'echo "Selamat belajar!"', out: ["Selamat belajar!"] },
  ];

  async function runTerminal() {
    if (!terminal) return;
    terminal.textContent = "";
    const cursor = el("span", "al-cursor");

    for (const step of terminalScript) {
      // Baris perintah: prompt + teks yang diketik huruf per huruf
      const line = el("div");
      const cmd = el("span", "al-t-cmd");
      line.append(el("span", "al-t-prompt", PROMPT), cmd, cursor);
      terminal.appendChild(line);

      if (!reduceMotion) await sleep(500);
      for (const char of step.cmd) {
        cmd.textContent += char;
        if (!reduceMotion) await sleep(45 + Math.random() * 70);
      }
      if (!reduceMotion) await sleep(300);

      // Hasil perintah
      step.out.forEach((text) => terminal.appendChild(el("div", "al-t-out", text)));
    }

    // Prompt terakhir dengan kursor berkedip
    const last = el("div");
    last.append(el("span", "al-t-prompt", PROMPT), cursor);
    terminal.appendChild(last);
  }

  runTerminal();

  /* =====================================================
     2. GARIS PROGRES BACA + TOMBOL KEMBALI KE ATAS
     ===================================================== */
  const progressBar = $("#alProgress");
  const toTopBtn = $("#alToTop");

  function updateProgress() {
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - doc.clientHeight;
    const ratio = maxScroll > 0 ? doc.scrollTop / maxScroll : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
    toTopBtn.classList.toggle("is-show", doc.scrollTop > 600);
  }

  toTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* =====================================================
     3. ANIMASI MUNCUL SAAT DI-SCROLL
     IntersectionObserver = "pengamat" yang memberi tahu
     kapan sebuah elemen masuk ke layar.
     ===================================================== */
  const revealItems = $$(".al-reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        let order = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const item = entry.target;
          // Muncul bergantian sedikit demi sedikit (efek stagger)
          setTimeout(() => item.classList.add("is-visible"), order * 90);
          order += 1;
          revealObserver.unobserve(item);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* =====================================================
     4. ANGKA BERJALAN (COUNTER)
     ===================================================== */
  function animateCount(node) {
    const target = Number(node.dataset.count);
    const from = Number(node.dataset.from || 0);
    const suffix = node.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // pelan di akhir (ease-out)
      node.textContent = Math.round(from + (target - from) * eased) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const counters = $$("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((node) => countObserver.observe(node));
  }

  /* =====================================================
     5. SUB-NAVIGASI MENGIKUTI POSISI SCROLL (SCROLLSPY)
     ===================================================== */
  const subnav = $("#alSubnav");
  const subLinks = $$("a", subnav);
  const spySections = subLinks.map((link) => $(link.getAttribute("href")));
  let currentSpy = null;

  function updateScrollSpy() {
    const offset = 180; // kira-kira tinggi topbar + sub-navigasi
    let current = spySections[0];
    spySections.forEach((section) => {
      if (section.getBoundingClientRect().top - offset <= 0) current = section;
    });
    if (current === currentSpy) return;
    currentSpy = current;

    subLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${current.id}`;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "true");
        // Di HP, geser sub-navigasi supaya tombol aktif kelihatan
        const left = link.offsetLeft - (subnav.clientWidth - link.offsetWidth) / 2;
        subnav.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /* =====================================================
     6. DIAGRAM LAPISAN SISTEM LINUX
     ===================================================== */
  const layerData = [
    {
      title: "Aplikasi & Pengguna",
      desc: "Lapisan paling atas yang langsung kamu pakai: browser, editor kode, pemutar musik, game, dan tampilan desktop seperti GNOME atau KDE Plasma.",
      chips: ["Firefox", "VS Code", "LibreOffice", "GNOME"],
    },
    {
      title: "Shell & Utilitas GNU",
      desc: "Penerjemah perintah. Shell (misalnya Bash) menerima perintah yang kamu ketik, lalu meneruskannya ke kernel. Banyak perintah dasar seperti ls, cp, dan grep berasal dari proyek GNU.",
      chips: ["bash", "zsh", "ls", "grep"],
    },
    {
      title: "Kernel Linux",
      desc: "Jantung sistem. Kernel mengatur CPU, membagi memori, menjalankan driver perangkat, mengelola file system, dan menjaga agar program tidak saling ganggu.",
      chips: ["scheduler", "driver", "ext4", "network stack"],
    },
    {
      title: "Hardware",
      desc: "Perangkat fisik komputer. Aplikasi tidak boleh mengakses hardware secara langsung; semua permintaan harus lewat kernel (disebut system call).",
      chips: ["CPU", "RAM", "SSD", "kartu jaringan"],
    },
  ];

  const layerButtons = $$(".al-layer");
  const layerDetail = $("#alLayerDetail");

  function showLayer(index) {
    const data = layerData[index];
    layerButtons.forEach((btn) => {
      const active = Number(btn.dataset.layer) === index;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    const chips = el("div", "al-chips");
    data.chips.forEach((chip) => chips.appendChild(el("span", "", chip)));
    layerDetail.replaceChildren(el("h4", "", data.title), el("p", "", data.desc), chips);

    // Mainkan ulang animasi kecil setiap ganti lapisan
    layerDetail.classList.remove("is-swapping");
    void layerDetail.offsetWidth;
    layerDetail.classList.add("is-swapping");
  }

  layerButtons.forEach((btn) => {
    btn.addEventListener("click", () => showLayer(Number(btn.dataset.layer)));
  });

  /* =====================================================
     7. TIMELINE SEJARAH: FILTER ERA + GARIS KUNING
     ===================================================== */
  const timeline = $("#alTimeline");
  const timelineFill = $("#alTimelineFill");
  const events = $$(".al-event");
  const filterButtons = $$(".al-filter button");
  let activeFilter = "all";

  function applyFilter(era) {
    activeFilter = era;
    let visibleIndex = 0;

    events.forEach((event) => {
      const show = era === "all" || event.dataset.era === era;
      event.classList.toggle("is-hidden", !show);
      event.classList.toggle("is-first", show && visibleIndex === 0);
      // Atur ulang posisi kiri/kanan supaya tetap selang-seling
      if (show) {
        event.dataset.side = visibleIndex % 2 === 0 ? "left" : "right";
        visibleIndex += 1;
      }
    });

    filterButtons.forEach((btn) => {
      const active = btn.dataset.filter === era;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    updateTimelineFill();
  }

  function updateTimelineFill() {
    const box = timeline.getBoundingClientRect();
    const trigger = window.innerHeight * 0.6; // titik 60% dari atas layar
    const filled = Math.min(Math.max(trigger - box.top, 0), box.height);
    timelineFill.style.height = `${filled}px`;

    // Titik di garis menyala kuning kalau sudah dilewati
    events.forEach((event) => {
      if (event.classList.contains("is-hidden")) return;
      event.classList.toggle("is-passed", event.getBoundingClientRect().top + 28 < trigger);
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });

  /* =====================================================
     8. TAB KARAKTERISTIK
     Bisa diklik, dan bisa juga pakai tombol panah keyboard.
     ===================================================== */
  const tabs = $$(".al-tab");
  const tabPanels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  function selectTab(index, moveFocus) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      tabPanels[i].classList.toggle("is-active", active);
    });

    // Di layar kecil daftar tab bisa digeser; pastikan tab aktif terlihat
    const list = tabs[index].parentElement;
    if (list.scrollWidth > list.clientWidth) {
      const left = tabs[index].offsetLeft - (list.clientWidth - tabs[index].offsetWidth) / 2;
      list.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
    }
    if (moveFocus) tabs[index].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(index, false));
    tab.addEventListener("keydown", (event) => {
      const last = tabs.length - 1;
      let next = null;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") next = index === last ? 0 : index + 1;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = last;
      if (next !== null) {
        event.preventDefault();
        selectTab(next, true);
      }
    });
  });

  /* =====================================================
     9. SIMULATOR HAK AKSES FILE (CHMOD)
     r = 4, w = 2, x = 1. Angka tiap kelompok dijumlahkan.
     Contoh: rwx = 4+2+1 = 7, r-x = 4+0+1 = 5, r-- = 4.
     ===================================================== */
  const permBoxes = $$(".al-perm input[type='checkbox']");
  const permSymbolic = $("#permSymbolic");
  const permOctal = $("#permOctal");
  const permCmd = $("#permCmd");
  const permExplain = $("#permExplain");
  const permWarn = $("#permWarn");
  const presetButtons = $$(".al-presets button");

  const whoLabel = { u: "Owner", g: "Group", o: "Others" };
  const actionLabel = { 4: "membaca", 2: "menulis", 1: "menjalankan" };

  // Mengubah daftar kata jadi kalimat: ["a","b","c"] -> "a, b, dan c"
  function joinWords(words) {
    if (words.length <= 1) return words.join("");
    if (words.length === 2) return `${words[0]} dan ${words[1]}`;
    return `${words.slice(0, -1).join(", ")}, dan ${words[words.length - 1]}`;
  }

  function updatePermission() {
    const total = { u: 0, g: 0, o: 0 };
    permBoxes.forEach((box) => {
      if (box.checked) total[box.dataset.who] += Number(box.dataset.bit);
    });

    const symbol = ["u", "g", "o"]
      .map((who) => {
        const n = total[who];
        return (n & 4 ? "r" : "-") + (n & 2 ? "w" : "-") + (n & 1 ? "x" : "-");
      })
      .join("");
    const octal = `${total.u}${total.g}${total.o}`;

    permSymbolic.textContent = `-${symbol}`;
    permOctal.textContent = octal;
    permCmd.textContent = `chmod ${octal} tugas.sh`;

    // Penjelasan dalam bahasa manusia
    const sentences = ["u", "g", "o"].map((who) => {
      const actions = [4, 2, 1].filter((bit) => total[who] & bit).map((bit) => actionLabel[bit]);
      if (actions.length === 0) return `${whoLabel[who]} tidak punya akses sama sekali.`;
      if (actions.length === 1 && actions[0] === "membaca") return `${whoLabel[who]} hanya bisa membaca.`;
      return `${whoLabel[who]} bisa ${joinWords(actions)}.`;
    });
    permExplain.textContent = sentences.join(" ");

    // Peringatan kalau "others" boleh menulis
    permWarn.hidden = !(total.o & 2);

    presetButtons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.preset === octal));
  }

  permBoxes.forEach((box) => box.addEventListener("change", updatePermission));

  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const digits = btn.dataset.preset.split("").map(Number); // "754" -> [7, 5, 4]
      const order = { u: 0, g: 1, o: 2 };
      permBoxes.forEach((box) => {
        box.checked = Boolean(digits[order[box.dataset.who]] & Number(box.dataset.bit));
      });
      updatePermission();
    });
  });

  updatePermission();

  /* =====================================================
     10. TOMBOL SALIN PERINTAH
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

  $$(".al-copy").forEach((btn) => {
    const icon = $("use", btn);
    const originalLabel = btn.getAttribute("aria-label");

    btn.addEventListener("click", async () => {
      const ok = await copyText(btn.dataset.copy);
      if (!ok) return;
      btn.classList.add("is-copied");
      btn.setAttribute("aria-label", "Perintah tersalin");
      icon.setAttribute("href", "#i-check");
      setTimeout(() => {
        btn.classList.remove("is-copied");
        btn.setAttribute("aria-label", originalLabel);
        icon.setAttribute("href", "#i-copy");
      }, 1500);
    });
  });

  /* =====================================================
     11. KUIS
     answer = urutan jawaban benar (dimulai dari 0)
     ===================================================== */
  const quizData = [
    {
      q: "Siapa yang pertama kali membuat kernel Linux?",
      options: ["Richard Stallman", "Linus Torvalds", "Bill Gates", "Andrew S. Tanenbaum"],
      answer: 1,
      explain: "Linus Torvalds membuat kernel Linux pada 1991 saat kuliah di Universitas Helsinki. Stallman adalah pendiri proyek GNU, sedangkan Tanenbaum pembuat MINIX.",
    },
    {
      q: "Bagian inti sistem operasi yang menghubungkan aplikasi dengan hardware disebut...",
      options: ["Shell", "Kernel", "Distro", "Desktop environment"],
      answer: 1,
      explain: "Kernel adalah inti sistem operasi. Shell hanya penerjemah perintah, distro adalah paket lengkapnya, dan desktop environment adalah tampilan grafisnya.",
    },
    {
      q: "Pada tahun berapa Linus pertama kali mengumumkan proyek Linux?",
      options: ["1969", "1983", "1991", "2004"],
      answer: 2,
      explain: "Linus mengumumkannya pada 25 Agustus 1991 di newsgroup comp.os.minix. Tahun 1969 adalah lahirnya Unix, 1983 proyek GNU, dan 2004 rilis pertama Ubuntu.",
    },
    {
      q: "Kernel Linux dirilis dengan lisensi...",
      options: ["MIT License", "GNU GPL versi 2", "Freeware", "Shareware"],
      answer: 1,
      explain: "Sejak 1992 kernel Linux memakai GNU GPL versi 2, yang menjamin siapa pun boleh memakai, mengubah, dan membagikan kodenya.",
    },
    {
      q: "Karakteristik Linux yang membuat Tugas.txt dan tugas.txt dianggap file berbeda adalah...",
      options: ["Multiuser", "Portabel", "Case-sensitive", "Multitasking"],
      answer: 2,
      explain: "Linux bersifat case-sensitive, artinya huruf besar dan huruf kecil dianggap berbeda.",
    },
    {
      q: "Izin file -rwxr-xr-- jika ditulis dalam angka (oktal) adalah...",
      options: ["755", "754", "644", "777"],
      answer: 1,
      explain: "rwx = 4+2+1 = 7, r-x = 4+0+1 = 5, r-- = 4+0+0 = 4. Jadi hasilnya 754. Coba buktikan di simulator hak akses!",
    },
    {
      q: "Apa nama maskot penguin Linux?",
      options: ["Tux", "Gnu", "Beastie", "Duke"],
      answer: 0,
      explain: "Tux digambar oleh Larry Ewing pada 1996. Gnu adalah maskot proyek GNU, Beastie maskot BSD, dan Duke maskot Java.",
    },
    {
      q: "Manakah yang BUKAN distribusi Linux?",
      options: ["Ubuntu", "Fedora", "FreeBSD", "Debian"],
      answer: 2,
      explain: "FreeBSD memang sistem operasi mirip Unix, tapi kernelnya bukan Linux. Ubuntu, Fedora, dan Debian semuanya distro Linux.",
    },
  ];

  const quizBox = $("#alQuiz");
  const LETTERS = ["A", "B", "C", "D"];
  const BEST_KEY = "al-quiz-best";
  let quizIndex = 0;
  let quizScore = 0;

  // localStorage dibungkus try/catch karena bisa diblokir di beberapa browser
  function getBestScore() {
    try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBestScore(score) {
    try {
      if (score > getBestScore()) localStorage.setItem(BEST_KEY, String(score));
    } catch (e) {
      /* abaikan */
    }
  }

  function renderQuestion() {
    const data = quizData[quizIndex];
    const total = quizData.length;

    const top = el("div", "al-quiz-top");
    const counter = el("span");
    counter.append("Soal ", el("b", "", String(quizIndex + 1)), ` dari ${total}`);
    top.append(counter, el("span", "", `Skor: ${quizScore}`));

    const bar = el("div", "al-quiz-bar");
    const barFill = el("span");
    barFill.style.width = `${(quizIndex / total) * 100}%`;
    bar.appendChild(barFill);

    const question = el("h3", "al-quiz-q", data.q);
    const options = el("div", "al-options");
    const actions = el("div", "al-quiz-actions");
    const nextBtn = el("button", "primary-button", quizIndex === total - 1 ? "Lihat Hasil →" : "Soal Berikutnya →");
    nextBtn.type = "button";
    nextBtn.disabled = true;
    actions.appendChild(nextBtn);

    data.options.forEach((text, i) => {
      const option = el("button", "al-option");
      option.type = "button";
      option.append(el("kbd", "", LETTERS[i]), el("span", "", text));
      option.addEventListener("click", () => checkAnswer(i, options, nextBtn, actions));
      options.appendChild(option);
    });

    nextBtn.addEventListener("click", () => {
      quizIndex += 1;
      if (quizIndex < total) renderQuestion();
      else renderResult();
    });

    quizBox.replaceChildren(top, bar, question, options, actions);
  }

  function checkAnswer(chosen, optionsBox, nextBtn, actions) {
    const data = quizData[quizIndex];
    const buttons = $$(".al-option", optionsBox);
    const correct = chosen === data.answer;
    if (correct) quizScore += 1;

    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === data.answer) btn.classList.add("is-correct");
      else if (i === chosen) btn.classList.add("is-wrong");
      else btn.classList.add("is-dim");
    });

    const feedback = el("div", `al-feedback ${correct ? "ok" : "no"}`);
    feedback.append(el("b", "", correct ? "Benar!" : `Kurang tepat. Jawabannya: ${data.options[data.answer]}`), data.explain);
    actions.before(feedback);

    $(".al-quiz-top span:last-child", quizBox).textContent = `Skor: ${quizScore}`;
    nextBtn.disabled = false;
    nextBtn.focus({ preventScroll: true });
  }

  function renderResult() {
    const total = quizData.length;
    const percent = Math.round((quizScore / total) * 100);
    saveBestScore(quizScore);

    let title = "Nggak apa-apa, coba lagi ya!";
    let message = "Scroll ke atas dan baca lagi pelan-pelan. Kamu pasti bisa.";
    if (quizScore === total) {
      title = "Sempurna!";
      message = "Kamu sudah paham banget soal Linux. Siap presentasi!";
    } else if (quizScore >= 6) {
      title = "Mantap!";
      message = "Tinggal sedikit lagi untuk jadi master Linux.";
    } else if (quizScore >= 4) {
      title = "Lumayan!";
      message = "Coba baca ulang bagian yang masih ragu, lalu ulangi kuisnya.";
    }

    const ring = el("div", "al-score-ring");
    ring.style.setProperty("--p", 0);
    const ringText = el("span", "", String(quizScore));
    ringText.appendChild(el("small", "", `/${total}`));
    ring.appendChild(ringText);

    const text = el("div");
    const actions = el("div", "al-quiz-actions");
    const retry = el("button", "primary-button", "Ulangi Kuis ↻");
    retry.type = "button";
    retry.addEventListener("click", () => {
      quizIndex = 0;
      quizScore = 0;
      renderQuestion();
    });
    const reread = el("a", "al-ghost-btn", "Baca Lagi dari Awal");
    reread.href = "#pengertian";
    actions.append(retry, reread);

    text.append(
      el("h3", "", title),
      el("p", "", `Skor kamu ${quizScore} dari ${total} (${percent}%). ${message}`),
      el("p", "", `Skor terbaikmu: ${getBestScore()} dari ${total}`),
      actions
    );

    const result = el("div", "al-result");
    result.append(ring, text);
    quizBox.replaceChildren(result);

    // Isi lingkaran skor secara bertahap
    requestAnimationFrame(() => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / 900, 1);
        ring.style.setProperty("--p", percent * (reduceMotion ? 1 : t));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  renderQuestion();

  /* =====================================================
     12. PENCARIAN DI HALAMAN
     Memakai kolom search di topbar (Ctrl + K dari script.js).
     Kartu yang tidak cocok dibuat redup, Enter = lompat ke hasil pertama.
     ===================================================== */
  const searchInput = $("#searchInput");
  const searchables = $$(".al-searchable");
  const searchCount = el("span", "al-search-count");
  searchCount.setAttribute("aria-live", "polite");
  searchInput.insertAdjacentElement("afterend", searchCount);
  let searchMatches = [];

  // Huruf kecil semua supaya "LINUX" dan "linux" dianggap sama
  const normalize = (text) => text.toLowerCase().replace(/\s+/g, " ").trim();

  // Untuk tombol tab, teks panelnya ikut dicari
  function searchText(node) {
    if (node.classList.contains("al-tab")) {
      const panel = document.getElementById(node.getAttribute("aria-controls"));
      return normalize(node.textContent + " " + panel.textContent);
    }
    return normalize(node.textContent);
  }

  function clearSearch() {
    searchMatches = [];
    searchables.forEach((node) => node.classList.remove("al-search-dim"));
    searchCount.textContent = "";
  }

  searchInput.addEventListener("input", () => {
    const keyword = normalize(searchInput.value);
    if (keyword.length < 2) {
      clearSearch();
      return;
    }
    if (activeFilter !== "all") applyFilter("all"); // tampilkan semua event dulu

    searchMatches = searchables.filter((node) => searchText(node).includes(keyword));
    searchables.forEach((node) => node.classList.toggle("al-search-dim", !searchMatches.includes(node)));
    searchCount.textContent = `${searchMatches.length} hasil`;
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchInput.value = "";
      // Picu event "input" supaya script.js & pencarian ini sama-sama direset
      searchInput.dispatchEvent(new Event("input"));
      return;
    }
    if (event.key !== "Enter" || searchMatches.length === 0) return;
    event.preventDefault();

    let target = searchMatches[0];
    if (target.classList.contains("al-tab")) {
      selectTab(tabs.indexOf(target), false);
      target = tabPanels[tabs.indexOf(target)];
    }
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    const flashTarget = target.querySelector(".al-event-card") || target;
    flashTarget.classList.remove("al-search-flash");
    void flashTarget.offsetWidth;
    flashTarget.classList.add("al-search-flash");
  });

  /* =====================================================
     Semua fungsi yang bergantung pada posisi scroll
     dijalankan bersama (maksimal 1x per frame supaya ringan)
     ===================================================== */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      updateScrollSpy();
      updateTimelineFill();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
