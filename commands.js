/* =========================================
   COMMANDS.JS - Halaman Linux Commands
   Daftar isi:
    1. Data perintah (tambah/ubah perintah cukup di sini)
    2. Membuat kartu perintah
    3. Menyorot kartu dari pencarian Ctrl+K
    4. Simulator terminal
    5. Misi latihan
   ========================================= */

// Kategori: kunci -> nama yang tampil
const CATEGORIES = {
  nav: "Navigasi",
  file: "File & Folder",
  view: "Baca File",
  perm: "Hak Akses",
};

/* =====================================================
   1. DATA PERINTAH (8 perintah paling dasar)
   id = penanda unik, cmd = nama perintah, cat = kategori,
   desc = fungsi singkat, example = contoh, note = catatan (opsional),
   danger = true kalau perlu hati-hati, sim = bisa dicoba di simulator
   ===================================================== */
window.COMMANDS = [
  { id: "pwd", cmd: "pwd", cat: "nav", desc: "Menampilkan folder tempat kamu berada.", example: "pwd", sim: true },
  { id: "ls", cmd: "ls", cat: "nav", desc: "Melihat isi folder. Tambah -la untuk file tersembunyi dan detail.", example: "ls -la", sim: true },
  { id: "cd", cmd: "cd", cat: "nav", desc: "Pindah folder. cd .. naik satu level, cd ~ kembali ke home.", example: "cd Documents", sim: true },
  { id: "mkdir", cmd: "mkdir", cat: "file", desc: "Membuat folder baru. Pakai -p untuk folder bertingkat.", example: "mkdir -p proyek/web", sim: true },
  { id: "touch", cmd: "touch", cat: "file", desc: "Membuat file kosong.", example: "touch catatan.txt", sim: true },
  { id: "cat", cmd: "cat", cat: "view", desc: "Menampilkan isi file.", example: "cat catatan.txt", sim: true },
  { id: "rm", cmd: "rm", cat: "file", desc: "Menghapus file secara permanen, tanpa Recycle Bin.", example: "rm catatan.txt", note: "rm -r menghapus folder beserta isinya. Cek dulu sebelum menekan Enter.", danger: true, sim: true },
  { id: "sudo", cmd: "sudo", cat: "perm", desc: "Menjalankan perintah sebagai admin (root), misalnya untuk install aplikasi.", example: "sudo apt update", note: "Pakai seperlunya: dengan sudo, perintah bisa mengubah apa pun di sistem.", danger: true },
];

(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svgIcon(name) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(ns, "use");
    use.setAttribute("href", `#${name}`);
    svg.appendChild(use);
    return svg;
  }

  const COMMANDS = window.COMMANDS;

  /* =====================================================
     2. MEMBUAT KARTU PERINTAH
     ===================================================== */
  const grid = $("#cmdGrid");

  function makeCard(c) {
    const card = el("article", `cmd-card reveal${c.danger ? " is-danger" : ""}`);
    card.id = `cmd-${c.id}`;
    card.dataset.cat = c.cat;

    const top = el("div", "cmd-card-top");
    top.append(el("code", "cmd-name", c.cmd), el("span", "cmd-cat", CATEGORIES[c.cat]));

    const line = el("div", "cmd-line");
    const copy = el("button", "copy-btn");
    copy.type = "button";
    copy.dataset.copy = c.example;
    copy.setAttribute("aria-label", `Salin ${c.example}`);
    copy.appendChild(svgIcon("i-copy"));
    line.append(el("code", "", c.example), copy);

    card.append(top, el("p", "cmd-desc", c.desc), line);

    if (c.note) {
      const note = el("p", "cmd-note");
      note.append(svgIcon("i-alert"), el("span", "", c.note));
      card.appendChild(note);
    }

    if (c.sim) {
      const tryBtn = el("button", "cmd-try");
      tryBtn.type = "button";
      tryBtn.append("Coba di simulator", svgIcon("i-arrow-right"));
      tryBtn.addEventListener("click", () => tryInSimulator(c.example));
      card.appendChild(tryBtn);
    }
    return card;
  }

  COMMANDS.forEach((c) => grid.appendChild(makeCard(c)));
  if (typeof window.observeReveal === "function") window.observeReveal(grid);
  $$("[data-total-commands]").forEach((node) => (node.textContent = COMMANDS.length));

  /* =====================================================
     3. MENYOROT KARTU DARI PENCARIAN CTRL+K (script.js)
     ===================================================== */
  window.showCommand = (id) => {
    const card = document.getElementById(`cmd-${id}`);
    if (!card) return;
    card.classList.add("is-visible");
    card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    card.classList.remove("is-flash");
    void card.offsetWidth;
    card.classList.add("is-flash");
  };

  // Kalau halaman dibuka dengan alamat #cmd-xxx, langsung sorot kartunya
  if (location.hash.startsWith("#cmd-")) {
    setTimeout(() => window.showCommand(location.hash.slice(5)), 300);
  }

  /* =====================================================
     4. SIMULATOR TERMINAL
     File system tiruan (bukan komputer sungguhan, jadi aman dicoba)
     ===================================================== */
  const termOut = $("#termOutput");
  const termInput = $("#termInput");
  const termPrompt = $("#termPrompt");
  const termScreen = $("#termScreen");
  const USER = "tux";
  const HOST = "abyssal";

  const file = (content) => ({ type: "file", content });
  const dir = (children = {}) => ({ type: "dir", children });

  function freshFileSystem() {
    return dir({
      home: dir({
        tux: dir({
          Documents: dir({
            "tugas.txt": file("Tugas Linux minggu ini:\n1. Pelajari perintah dasar\n2. Selesaikan misi di simulator\n3. Install Linux di VirtualBox"),
          }),
          Downloads: dir({ "linux.iso": file("(ini file ISO tiruan)") }),
          Pictures: dir(),
          "catatan.txt": file("Selamat datang di simulator terminal Abyssal Byte!\nKetik help untuk melihat perintah yang bisa dicoba."),
          ".rahasia": file("Kamu menemukan file tersembunyi. Mantap!"),
        }),
      }),
      etc: dir({ hostname: file(HOST) }),
      tmp: dir(),
      usr: dir({ bin: dir() }),
      var: dir({ log: dir() }),
    });
  }

  let root = freshFileSystem();
  let cwd = ["home", "tux"];
  let history = [];
  let historyIndex = 0;

  const homePath = ["home", "tux"];

  function pathText(parts) {
    const full = `/${parts.join("/")}`;
    const home = `/${homePath.join("/")}`;
    if (full === home) return "~";
    if (full.startsWith(`${home}/`)) return `~${full.slice(home.length)}`;
    return full;
  }

  // Mengubah teks path (misal "../Documents") menjadi array folder
  function resolve(path) {
    if (!path || path === "~") return [...homePath];
    let parts;
    if (path.startsWith("/")) parts = [];
    else if (path.startsWith("~")) {
      parts = [...homePath];
      path = path.slice(1);
    } else parts = [...cwd];

    path.split("/").forEach((piece) => {
      if (!piece || piece === ".") return;
      if (piece === "..") parts.pop();
      else parts.push(piece);
    });
    return parts;
  }

  function getNode(parts) {
    let node = root;
    for (const part of parts) {
      if (node.type !== "dir" || !node.children[part]) return null;
      node = node.children[part];
    }
    return node;
  }

  function print(text, cls) {
    String(text).split("\n").forEach((line) => termOut.appendChild(el("div", cls || "", line)));
  }

  function printPromptLine(command) {
    const line = el("div");
    line.append(el("span", "t-prompt", `${USER}@${HOST}:${pathText(cwd)}$ `), el("span", "t-cmd", command));
    termOut.appendChild(line);
  }

  function updatePrompt() {
    termPrompt.textContent = `${USER}@${HOST}:${pathText(cwd)}$`;
  }

  const SIM_HELP = [
    "Perintah yang bisa dicoba di simulator:",
    "  pwd, ls [-a] [-l], cd <folder>, mkdir <nama>, touch <nama>",
    "  cat <file>, rm [-r] <nama>, echo <teks>, whoami, hostname",
    "  uname [-a], date, history, man <perintah>, clear, help",
    "Tips: tekan Tab untuk melengkapi nama, panah atas untuk perintah sebelumnya.",
  ].join("\n");

  // Setiap perintah = satu fungsi. Mengembalikan true kalau berhasil.
  const handlers = {
    help: () => print(SIM_HELP, "t-out"),
    pwd: () => print(`/${cwd.join("/")}`, "t-out"),
    whoami: () => print(USER, "t-out"),
    hostname: () => print(HOST, "t-out"),
    date: () => print(new Date().toString(), "t-out"),
    clear: () => termOut.replaceChildren(),
    history: () => print(history.map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`).join("\n") || "(belum ada)", "t-out"),
    echo: (args) => print(args.join(" "), "t-out"),

    uname: (args) => print(args.includes("-a") ? `Linux ${HOST} 7.0.0-abyssal #1 SMP x86_64 GNU/Linux` : "Linux", "t-out"),

    ls: (args) => {
      const flags = args.filter((a) => a.startsWith("-")).join("");
      const target = args.find((a) => !a.startsWith("-"));
      const node = getNode(resolve(target));
      if (!node) return print(`ls: tidak bisa mengakses '${target}': Tidak ada file atau folder seperti itu`, "t-err"), false;
      if (node.type === "file") return print(target, "t-out"), true;

      let names = Object.keys(node.children).sort();
      if (!flags.includes("a")) names = names.filter((n) => !n.startsWith("."));
      if (names.length === 0) return true;

      if (flags.includes("l")) {
        names.forEach((name) => {
          const child = node.children[name];
          const isDir = child.type === "dir";
          const size = isDir ? 4096 : child.content.length;
          const line = el("div", "t-out");
          line.append(`${isDir ? "drwxr-xr-x" : "-rw-r--r--"} 1 ${USER} ${USER} ${String(size).padStart(5)} Nov 19 10:00 `, el("span", isDir ? "t-dir" : "", name));
          termOut.appendChild(line);
        });
      } else {
        const line = el("div", "t-out");
        names.forEach((name, i) => {
          line.append(el("span", node.children[name].type === "dir" ? "t-dir" : "", name));
          if (i < names.length - 1) line.append("  ");
        });
        termOut.appendChild(line);
      }
      return true;
    },

    cd: (args) => {
      const target = resolve(args[0]);
      const node = getNode(target);
      if (!node) return print(`cd: ${args[0]}: Tidak ada folder seperti itu`, "t-err"), false;
      if (node.type !== "dir") return print(`cd: ${args[0]}: Bukan sebuah folder`, "t-err"), false;
      cwd = target;
      updatePrompt();
      return true;
    },

    mkdir: (args) => {
      const makeParents = args.includes("-p");
      const names = args.filter((a) => !a.startsWith("-"));
      if (names.length === 0) return print("mkdir: nama folder belum diisi", "t-err"), false;
      let ok = true;
      names.forEach((name) => {
        const parts = resolve(name);
        const last = parts.pop();
        let parent = root;
        for (const part of parts) {
          if (!parent.children[part]) {
            if (!makeParents) {
              print(`mkdir: tidak bisa membuat '${name}': Folder induk tidak ada (coba pakai -p)`, "t-err");
              ok = false;
              return;
            }
            parent.children[part] = dir();
          }
          parent = parent.children[part];
        }
        if (parent.children[last]) {
          if (!makeParents) {
            print(`mkdir: '${name}' sudah ada`, "t-err");
            ok = false;
          }
          return;
        }
        parent.children[last] = dir();
      });
      return ok;
    },

    touch: (args) => {
      if (args.length === 0) return print("touch: nama file belum diisi", "t-err"), false;
      args.forEach((name) => {
        const parts = resolve(name);
        const last = parts.pop();
        const parent = getNode(parts);
        if (parent && parent.type === "dir" && !parent.children[last]) parent.children[last] = file("");
      });
      return true;
    },

    cat: (args) => {
      if (args.length === 0) return print("cat: nama file belum diisi", "t-err"), false;
      const node = getNode(resolve(args[0]));
      if (!node) return print(`cat: ${args[0]}: Tidak ada file seperti itu`, "t-err"), false;
      if (node.type === "dir") return print(`cat: ${args[0]}: Itu folder, bukan file`, "t-err"), false;
      if (node.content) print(node.content, "t-out");
      return true;
    },

    rm: (args) => {
      const recursive = args.some((a) => /^-\w*r/.test(a));
      const name = args.find((a) => !a.startsWith("-"));
      if (!name) return print("rm: nama file belum diisi", "t-err"), false;
      const parts = resolve(name);
      const last = parts.pop();
      const parent = getNode(parts);
      const node = parent && parent.type === "dir" ? parent.children[last] : null;
      if (!node) return print(`rm: tidak bisa menghapus '${name}': Tidak ada file atau folder seperti itu`, "t-err"), false;
      if (node.type === "dir" && !recursive) return print(`rm: '${name}' adalah folder (pakai rm -r)`, "t-err"), false;
      delete parent.children[last];
      return true;
    },

    man: (args) => {
      const found = COMMANDS.find((c) => c.cmd === args[0] || c.id === args[0]);
      if (!args[0]) return print("man: mau buka manual perintah apa? Contoh: man ls", "t-err"), false;
      if (!found) return print(`Tidak ada manual untuk ${args[0]} di simulator ini`, "t-err"), false;
      print(`${found.cmd.toUpperCase()}\n  ${found.desc}\n  Contoh: ${found.example}`, "t-out");
      return true;
    },

    sudo: () => print("sudo dinonaktifkan di simulator. Di Linux asli, sudo menjalankan perintah sebagai admin.", "t-warn"),
  };

  // Memecah teks perintah: 'echo "halo dunia"' -> ["echo", "halo dunia"]
  function splitArgs(text) {
    const matches = text.match(/"[^"]*"|'[^']*'|\S+/g) || [];
    return matches.map((m) => m.replace(/^["']|["']$/g, ""));
  }

  function run(command) {
    const text = command.trim();
    printPromptLine(text);
    if (!text) return;

    history.push(text);
    historyIndex = history.length;

    const [name, ...args] = splitArgs(text);
    const handler = handlers[name];
    let ok = false;

    if (handler) {
      const result = handler(args);
      ok = result !== false;
    } else {
      print(`${name}: belum tersedia di simulator. Ketik help untuk melihat perintah yang bisa dicoba.`, "t-err");
    }

    checkMissions(name, args, ok);
    termScreen.scrollTop = termScreen.scrollHeight;
  }

  // Tab untuk melengkapi nama perintah atau file
  function autocomplete() {
    const value = termInput.value;
    const parts = value.split(" ");
    const current = parts[parts.length - 1];
    let options;

    if (parts.length === 1) {
      options = Object.keys(handlers).filter((h) => h.startsWith(current));
    } else {
      const slash = current.lastIndexOf("/");
      const base = slash >= 0 ? current.slice(0, slash + 1) : "";
      const partial = slash >= 0 ? current.slice(slash + 1) : current;
      const folder = getNode(resolve(base || "."));
      if (!folder || folder.type !== "dir") return;
      options = Object.keys(folder.children)
        .filter((n) => n.startsWith(partial) && (partial.startsWith(".") || !n.startsWith(".")))
        .map((n) => base + n + (folder.children[n].type === "dir" ? "/" : ""));
    }

    if (options.length === 1) {
      parts[parts.length - 1] = options[0];
      termInput.value = parts.join(" ") + (options[0].endsWith("/") ? "" : " ");
    } else if (options.length > 1) {
      printPromptLine(value);
      print(options.join("  "), "t-out");
      termScreen.scrollTop = termScreen.scrollHeight;
    }
  }

  termInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      run(termInput.value);
      termInput.value = "";
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyIndex > 0) historyIndex -= 1;
      termInput.value = history[historyIndex] || "";
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex < history.length) historyIndex += 1;
      termInput.value = history[historyIndex] || "";
    } else if (event.key === "Tab") {
      event.preventDefault();
      autocomplete();
    } else if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      handlers.clear();
    }
  });

  // Klik di mana saja dalam terminal = fokus ke kolom ketik
  termScreen.addEventListener("click", () => {
    if (!window.getSelection().toString()) termInput.focus({ preventScroll: true });
  });

  // Tombol saran perintah di bawah terminal
  $$("[data-sim]").forEach((btn) => btn.addEventListener("click", () => tryInSimulator(btn.dataset.sim, false)));

  function tryInSimulator(command, scroll = true) {
    if (scroll) $("#simulator").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    termInput.value = command;
    termInput.focus({ preventScroll: true });
  }

  function resetSimulator() {
    root = freshFileSystem();
    cwd = [...homePath];
    history = [];
    historyIndex = 0;
    termOut.replaceChildren();
    print("Selamat datang di simulator terminal Abyssal Byte!", "t-out");
    print("Ketik help untuk melihat perintah, atau selesaikan misi di samping.", "t-out");
    updatePrompt();
    missions.forEach((m) => (m.done = false));
    renderMissions();
  }

  $("#termReset").addEventListener("click", () => {
    resetSimulator();
    termInput.focus({ preventScroll: true });
  });

  /* =====================================================
     5. MISI LATIHAN
     ===================================================== */
  const missions = [
    { text: "Cek posisimu sekarang", hint: "pwd", test: (n) => n === "pwd" },
    { text: "Lihat isi folder", hint: "ls", test: (n) => n === "ls" },
    { text: "Masuk ke folder Documents", hint: "cd Documents", test: () => cwd[cwd.length - 1] === "Documents" },
    { text: "Baca isi tugas.txt", hint: "cat tugas.txt", test: (n, a) => n === "cat" && a.some((x) => x.endsWith("tugas.txt")) },
    { text: "Buat folder bernama latihan", hint: "mkdir latihan", test: (n, a) => n === "mkdir" && a.some((x) => x.endsWith("latihan")) },
    { text: "Temukan file tersembunyi di home", hint: "ls -a ~", test: (n, a) => n === "ls" && a.some((x) => x.startsWith("-") && x.includes("a")) },
  ];

  const missionList = $("#missionList");
  const missionBar = $("#missionBar");
  const missionCount = $("#missionCount");

  function renderMissions() {
    missionList.replaceChildren();
    missions.forEach((m) => {
      const li = el("li", m.done ? "is-done" : "");
      const box = el("span", "mission-check");
      box.appendChild(svgIcon("i-check"));
      const text = el("div");
      text.append(el("b", "", m.text));
      const hint = el("button", "mission-hint", m.hint);
      hint.type = "button";
      hint.title = "Isi otomatis ke terminal";
      hint.addEventListener("click", () => tryInSimulator(m.hint, false));
      text.appendChild(hint);
      li.append(box, text);
      missionList.appendChild(li);
    });
    const done = missions.filter((m) => m.done).length;
    missionCount.textContent = `${done}/${missions.length}`;
    missionBar.style.width = `${(done / missions.length) * 100}%`;
  }

  function checkMissions(name, args, ok) {
    if (!ok) return;
    let changed = false;
    missions.forEach((m) => {
      if (!m.done && m.test(name, args)) {
        m.done = true;
        changed = true;
      }
    });
    if (!changed) return;
    renderMissions();
    if (missions.every((m) => m.done)) {
      print("Semua misi selesai! Kamu siap mencoba terminal Linux sungguhan.", "t-ok");
    }
  }

  resetSimulator();
})();
