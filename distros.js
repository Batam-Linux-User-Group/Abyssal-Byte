/* =========================================
   DISTROS.JS - Frontend Developer 3
   Carousel distro (looping): berpindah HANYA lewat tombol
   (atau swipe horizontal / panah keyboard).
   Scroll mouse dan swipe vertikal tetap menggulir halaman.
   ========================================= */

// Halaman instalasi (dikerjakan Frontend 5). Sesuaikan nama file-nya.
const INSTALL_PAGE = "installation.html";

// Untuk menambah / mengubah distro, cukup edit daftar ini.
// logo: taruh gambar di assets/distros/<slug>.png (kalau tidak ada, tampil huruf awal)
const distros = [
  { slug: "ubuntu", name: "Ubuntu", desc: "Distro paling populer untuk pemula. Mudah dipakai, komunitas besar, dan rilis LTS yang stabil.", tags: ["Berbasis Debian", "apt", "Pemula"] },
  { slug: "debian", name: "Debian", desc: "Distro induk yang sangat stabil. Menjadi dasar bagi Ubuntu, Kali, dan banyak distro lain.", tags: ["Independen", "apt", "Server"] },
  { slug: "arch", name: "Arch Linux", desc: "Minimalis dan rolling release. Kamu menyusun sistem sendiri dari nol, cocok untuk belajar mendalam.", tags: ["Independen", "pacman", "Mahir"] },
  { slug: "kali", name: "Kali Linux", desc: "Distro khusus keamanan siber dan penetration testing dengan ratusan tools bawaan.", tags: ["Berbasis Debian", "apt", "Keamanan Siber"] },
  { slug: "fedora", name: "Fedora", desc: "Disponsori Red Hat dan sering memuat teknologi terbaru lebih dulu. Favorit developer.", tags: ["Independen", "dnf", "Developer"] },
  { slug: "centos", name: "CentOS Stream", desc: "Distro bergaya enterprise yang menjadi tahap sebelum RHEL. CentOS Linux klasik sudah dihentikan.", tags: ["Keluarga RHEL", "dnf", "Server"] },
  { slug: "mint", name: "Linux Mint", desc: "Tampilan mirip Windows klasik, ramah pemula, dan siap pakai tanpa banyak pengaturan.", tags: ["Berbasis Ubuntu", "apt", "Pemula"] },
  { slug: "opensuse", name: "openSUSE", desc: "Dikenal dengan YaST dan dukungan snapshot Btrfs. Tersedia Leap (stabil) dan Tumbleweed (rolling).", tags: ["Independen", "zypper", "Server / Desktop"] },
  { slug: "zorin", name: "Zorin OS", desc: "Dirancang agar pengguna Windows mudah berpindah, dengan tampilan modern dan rapi.", tags: ["Berbasis Ubuntu", "apt", "Pemula"] },
  { slug: "manjaro", name: "Manjaro", desc: "Rasa Arch yang lebih mudah dipasang, lengkap dengan installer grafis dan driver otomatis.", tags: ["Berbasis Arch", "pacman", "Menengah"] },
  { slug: "popos", name: "Pop!_OS", desc: "Dibuat System76, nyaman untuk developer dan gamer, serta mendukung GPU NVIDIA dengan baik.", tags: ["Berbasis Ubuntu", "apt", "Developer"] },
  { slug: "elementary", name: "elementary OS", desc: "Desktop yang bersih dan elegan, terinspirasi gaya macOS dengan fokus pada kesederhanaan.", tags: ["Berbasis Ubuntu", "apt", "Desktop"] },
  { slug: "rocky", name: "Rocky Linux", desc: "Pengganti CentOS Linux yang kompatibel dengan RHEL, ditujukan untuk server produksi.", tags: ["Keluarga RHEL", "dnf", "Server"] },
  { slug: "almalinux", name: "AlmaLinux", desc: "Distro gratis yang kompatibel dengan RHEL dan didukung komunitas, cocok untuk server.", tags: ["Keluarga RHEL", "dnf", "Server"] },
  { slug: "alpine", name: "Alpine Linux", desc: "Sangat ringan dan aman, populer sebagai basis container Docker.", tags: ["Independen", "apk", "Container"] },
  { slug: "gentoo", name: "Gentoo", desc: "Paket dikompilasi dari source code sesuai kebutuhan, untuk kontrol dan optimasi maksimal.", tags: ["Independen", "portage", "Mahir"] },
  { slug: "slackware", name: "Slackware", desc: "Salah satu distro tertua yang masih aktif, sederhana dan setia pada filosofi Unix.", tags: ["Independen", "pkgtools", "Mahir"] },
  { slug: "parrot", name: "Parrot OS", desc: "Alternatif Kali untuk keamanan siber, forensik, dan privasi dengan tampilan yang ringan.", tags: ["Berbasis Debian", "apt", "Keamanan Siber"] },
  { slug: "tails", name: "Tails", desc: "Sistem live yang fokus pada privasi dan anonimitas, semua lalu lintas lewat jaringan Tor.", tags: ["Berbasis Debian", "Live USB", "Privasi"] },
  { slug: "mx", name: "MX Linux", desc: "Ringan, stabil, dan kaya alat bantu. Cocok untuk laptop lama.", tags: ["Berbasis Debian", "apt", "Ringan"] },
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

  const link = document.createElement("a");
  link.className = "distro-link";
  link.href = `${INSTALL_PAGE}#${d.slug}`;
  link.setAttribute("aria-label", `Buka panduan instalasi ${d.name}`);

  const logo = document.createElement("div");
  logo.className = "distro-logo";
  const initial = document.createElement("span");
  initial.className = "distro-initial";
  initial.textContent = d.name.charAt(0);
  const img = document.createElement("img");
  img.src = `assets/distros/${d.slug}.png`;
  img.alt = `Logo ${d.name}`;
  img.onerror = () => img.remove(); // kalau gambar belum ada, huruf awal tampil
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
  const cta = document.createElement("span");
  cta.className = "distro-cta";
  cta.textContent = "Lihat panduan instalasi →";
  text.append(name, desc, tags, cta);

  link.append(logo, text);

  const inner = document.createElement("div");
  inner.className = "distro-inner";
  inner.appendChild(link);
  card.appendChild(inner);

  // Klik card samping = geser ke card itu (bukan buka halaman)
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
    c.querySelector(".distro-link").tabIndex = i === pos ? 0 : -1;
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
