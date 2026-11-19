/* =========================================
   DISTROS.JS - Frontend Developer 3
   Carousel distro (looping): berpindah HANYA lewat tombol
   (atau swipe horizontal / panah keyboard).
   Scroll mouse dan swipe vertikal tetap menggulir halaman.
   ========================================= */

// Untuk menambah / mengubah distro, cukup edit daftar ini.
// logo: taruh gambar di assets/distros/<slug>.png (kalau tidak ada, tampil huruf awal)
// link: ganti placeholder "taro link ... disini" dengan URL panduan instalasi.
// tags: [basis/keluarga, package manager, kegunaan]
const distros = [
  { slug: "debian", name: "Debian", desc: "Distro induk yang sangat stabil dan dibangun independen. Menjadi dasar bagi Ubuntu, Kali, dan banyak distro lain.", tags: ["Independen", "apt", "Server"], link: "https://www.debian.org/distrib/" },
  { slug: "ubuntu", name: "Ubuntu", desc: "Distro paling populer untuk pemula. Mudah dipakai, komunitas besar, dan rilis LTS yang stabil.", tags: ["Berbasis Debian", "apt", "Pemula"], link: "https://ubuntu.com/download" },
  { slug: "mint", name: "Linux Mint", desc: "Tampilan mirip Windows klasik, ramah pemula, dan siap pakai tanpa banyak pengaturan.", tags: ["Berbasis Ubuntu", "apt", "Pemula"], link: "https://linuxmint.com/download.php" },
  { slug: "kali", name: "Kali Linux", desc: "Distro khusus keamanan siber dan penetration testing dengan ratusan tools bawaan.", tags: ["Berbasis Debian", "apt", "Keamanan Siber"], link: "https://www.kali.org/get-kali/" },
  { slug: "parrot", name: "Parrot OS", desc: "Alternatif Kali untuk keamanan siber, forensik, dan privasi dengan tampilan yang ringan.", tags: ["Berbasis Debian", "apt", "Keamanan Siber"], link: "https://www.parrotsec.org/download/" },
  { slug: "mx", name: "MX Linux", desc: "Ringan, stabil, dan kaya alat bantu. Cocok untuk laptop lama.", tags: ["Berbasis Debian", "apt", "Ringan"], link: "https://mxlinux.org/download-links/" },
  { slug: "popos", name: "Pop!_OS", desc: "Dibuat System76, nyaman untuk developer dan gamer, serta mendukung GPU NVIDIA dengan baik.", tags: ["Berbasis Ubuntu", "apt", "Developer"], link: "https://pop.system76.com/" },
  { slug: "elementary", name: "elementary OS", desc: "Desktop yang bersih dan elegan, terinspirasi gaya macOS dengan fokus pada kesederhanaan.", tags: ["Berbasis Ubuntu", "apt", "Desain"], link: "https://elementary.io/" },
  { slug: "zorin", name: "Zorin OS", desc: "Dirancang agar pengguna Windows mudah berpindah, dengan tampilan modern dan rapi.", tags: ["Berbasis Ubuntu", "apt", "Pemula"], link: "https://zorin.com/os/download/" },
  { slug: "fedora", name: "Fedora", desc: "Disponsori Red Hat dan sering memuat teknologi terbaru lebih dulu. Favorit developer.", tags: ["Keluarga Red Hat", "dnf", "Developer"], link: "https://fedoraproject.org/" },
  { slug: "centos", name: "CentOS Stream", desc: "Distro bergaya enterprise yang menjadi tahap sebelum RHEL. CentOS Linux klasik sudah dihentikan.", tags: ["Keluarga Red Hat", "dnf", "Server"], link: "https://www.centos.org/download/" },
  { slug: "rocky", name: "Rocky Linux", desc: "Pengganti CentOS Linux yang kompatibel dengan RHEL, ditujukan untuk server produksi.", tags: ["Keluarga RHEL", "dnf", "Server"], link: "https://rockylinux.org/download" },
  { slug: "almalinux", name: "AlmaLinux", desc: "Distro gratis yang kompatibel dengan RHEL dan didukung komunitas, cocok untuk server.", tags: ["Keluarga RHEL", "dnf", "Server"], link: "https://almalinux.org/get-almalinux/" },
  { slug: "arch", name: "Arch Linux", desc: "Minimalis dan rolling release. Kamu menyusun sistem sendiri dari nol, cocok untuk belajar mendalam.", tags: ["Independen", "pacman", "Mahir"], link: "https://archlinux.org/download/" },
  { slug: "manjaro", name: "Manjaro", desc: "Rasa Arch yang lebih mudah dipasang, lengkap dengan installer grafis dan driver otomatis.", tags: ["Berbasis Arch", "pacman", "Menengah"], link: "https://manjaro.org/products/download/x86" },
  { slug: "garuda", name: "Garuda Linux", desc: "Berbasis Arch dengan tampilan modern dan konfigurasi siap pakai untuk gaming. Performa tinggi tanpa setup yang rumit.", tags: ["Berbasis Arch", "pacman", "Gaming"], link: "https://garudalinux.org/editions" },
  { slug: "cachy", name: "CachyOS", desc: "Arch yang dioptimalkan untuk kecepatan lewat kernel dan paket khusus, tetap dengan installer grafis yang mudah.", tags: ["Berbasis Arch", "pacman", "Performa"], link: "https://cachyos.org/download/" },
  { slug: "alpine", name: "Alpine Linux", desc: "Sangat kecil, ringan, dan fokus pada keamanan. Jadi favorit untuk container Docker.", tags: ["Independen", "apk", "Container"], link: "https://www.alpinelinux.org/downloads/" },
  { slug: "gentoo", name: "Gentoo", desc: "Paket dikompilasi dari source code sesuai kebutuhan, untuk kontrol dan optimasi maksimal.", tags: ["Independen", "portage", "Mahir"], link: "https://www.gentoo.org/downloads/" },
  { slug: "void", name: "Void Linux", desc: "Independen, ringan, dan memakai sistem init runit. Cocok untuk yang ingin sistem sederhana dengan kontrol penuh.", tags: ["Independen", "xbps", "Mahir"], link: "https://voidlinux.org/download/" },
];

const track = document.getElementById("carouselTrack");
const viewport = document.getElementById("carouselViewport");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const counter = document.getElementById("carouselCounter");
const carousel = document.getElementById("distroCarousel");

const N = distros.length;
const CLONES = 2; // jumlah card duplikat di tiap ujung supaya looping mulus
let pos = CLONES; // posisi di daftar yang sudah ditambah duplikat
let busy = false; // true selama animasi geser berjalan
let timer;

// ---------- Membuat card dari data ----------
function makeCard(d, isClone) {
  const card = document.createElement("article");
  card.className = "distro-card";
  if (isClone) card.dataset.clone = "true";

  // Pembungkus isi card. Sekarang <div> biasa (bukan link),
  // jadi logo dan nama distro tidak lagi membuka halaman instalasi.
  const link = document.createElement("div");
  link.className = "distro-link";

  const logo = document.createElement("div");
  logo.className = "distro-logo";
  const initial = document.createElement("span");
  initial.className = "distro-initial";
  initial.textContent = d.name.charAt(0);
  const img = document.createElement("img");
  img.onload = () => initial.remove();   // gambar ada → huruf dihapus
  img.onerror = () => img.remove();      // gambar belum ada → huruf tetap
  img.src = `assets/distros/${d.slug}.png`;
  img.alt = `Logo ${d.name}`;
  logo.append(initial, img);

  const text = document.createElement("div");
  text.className = "distro-text";
  const name = document.createElement("h2");
  name.className = "distro-name";
  name.textContent = d.name;
  const desc = document.createElement("p");
  desc.className = "distro-desc";
  desc.textContent = d.desc;
  const tags = document.createElement("div");
  tags.className = "distro-tags";
  d.tags.forEach((t) => {
    const s = document.createElement("span");
    s.textContent = t;
    tags.appendChild(s);
  });

  // Hanya tulisan ini yang menjadi link ke panduan instalasi.
  const cta = document.createElement("a");
  cta.className = "distro-cta";
  cta.href = d.link;
  cta.target = "_blank";
  cta.rel = "noopener noreferrer";
  cta.setAttribute("aria-label", `Buka panduan instalasi ${d.name}`);
  cta.textContent = "Lihat panduan instalasi →";
  // Kalau card belum di tengah, klik hanya menggeser card (link tidak terbuka).
  cta.addEventListener("click", (e) => {
    if (cards.indexOf(card) !== pos) e.preventDefault();
  });

  text.append(name, desc, tags, cta);

  link.append(logo, text);

  const inner = document.createElement("div");
  inner.className = "distro-inner";
  inner.appendChild(link);
  card.appendChild(inner);

  // Klik card samping = geser ke card itu
  card.addEventListener("click", () => {
    const idx = cards.indexOf(card);
    if (idx !== pos) go(idx - pos);
  });

  return card;
}

// Urutan: [duplikat ujung belakang] + [distro asli] + [duplikat ujung depan]
distros.slice(-CLONES).forEach((d) => track.appendChild(makeCard(d, true)));
distros.forEach((d) => track.appendChild(makeCard(d, false)));
distros.slice(0, CLONES).forEach((d) => track.appendChild(makeCard(d, true)));

const cards = Array.from(track.children);

// ---------- Posisi & status ----------
function render(animate) {
  if (!animate) carousel.classList.add("no-anim");

  const card = cards[pos];
  const offset = card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
  track.style.transform = `translateX(${-offset}px)`;

  cards.forEach((c, i) => {
    c.classList.toggle("is-active", i === pos);
    c.setAttribute("aria-hidden", i === pos && !c.dataset.clone ? "false" : "true");
    // Hanya link di card aktif yang bisa difokus dengan keyboard (Tab)
    c.querySelector(".distro-cta").tabIndex = i === pos ? 0 : -1;
  });

  const real = (((pos - CLONES) % N) + N) % N;
  counter.innerHTML = `<b>${real + 1}</b> / ${N}`;

  if (!animate) {
    void track.offsetHeight; // paksa browser menerapkan posisi tanpa animasi
    carousel.classList.remove("no-anim");
  }
}

// Setelah animasi selesai: kalau sedang di card duplikat, loncat diam-diam
// ke card asli yang kembar dengannya (pengguna tidak melihat lompatannya).
function settle() {
  clearTimeout(timer);
  if (!busy) return;
  busy = false;
  if (pos < CLONES) {
    pos += N;
    render(false);
  } else if (pos >= CLONES + N) {
    pos -= N;
    render(false);
  }
}

function go(delta) {
  if (busy) return;
  busy = true;
  pos += delta;
  render(true);
  timer = setTimeout(settle, 800); // cadangan kalau transitionend tidak terpicu
}

track.addEventListener("transitionend", (e) => {
  if (e.target === track && e.propertyName === "transform") settle();
});

// ---------- Kontrol ----------
prevBtn.addEventListener("click", () => go(-1));
nextBtn.addEventListener("click", () => go(1));

// Panah keyboard (hanya saat carousel sedang fokus)
carousel.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") go(-1);
  if (e.key === "ArrowRight") go(1);
});

// Swipe horizontal di layar sentuh (swipe vertikal dibiarkan menggulir halaman)
let startX = 0;
let startY = 0;
viewport.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, { passive: true });

viewport.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    go(dx < 0 ? 1 : -1);
  }
}, { passive: true });

// Hitung ulang posisi saat ukuran jendela berubah
window.addEventListener("resize", () => render(false));

// Catatan: SENGAJA tidak ada listener "wheel", jadi scroll mouse
// tidak pernah menggeser carousel.
render(false);
