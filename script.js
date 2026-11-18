/* ===== Konfigurasi ===== */
// Isi nomor WhatsApp toko dengan format internasional tanpa tanda +, contoh: "6281234567890".
// Jika dikosongkan, WhatsApp akan membuka dan pembeli memilih kontak sendiri.
const WA_NUMBER = "";

const IMG = {runner:"img/runner.webp", classic:"img/classic.webp", urban:"img/urban.webp", trail:"img/trail.webp"};

/* ===== Data produk (sesuai katalog) ===== */
const PRODUCTS = [
  {id:"runner", cat:"Sepatu lari", name:"Velora Runner", price:150000, sizes:[38,44], colorHint:"Pilih dari 3 warna",
   desc:"Ringan dan responsif untuk lari harian maupun olahraga santai.",
   spec:["Bahan mesh breathable, kaki tetap adem","Sol empuk dan anti-selip","Ukuran 38–44, 3 pilihan warna"],
   pb:"var(--p-runner)", w:"112%", r:"-8deg", alt:"Velora Runner, sepatu lari merah dan biru toska"},
  {id:"classic", cat:"Sneakers casual", name:"Velora Classic", price:110000, sizes:[38,44], colorHint:"Putih atau hitam",
   desc:"Desain bersih yang cocok dipadukan dengan outfit kuliah, kerja, dan nongkrong.",
   spec:["Upper kulit sintetis mudah dibersihkan","Insole empuk untuk dipakai seharian","Ukuran 38–44, warna putih dan hitam"],
   pb:"var(--p-classic)", w:"104%", r:"-6deg", alt:"Velora Classic, sneakers putih dengan aksen merah muda"},
  {id:"urban", cat:"Sepatu pria dan wanita", name:"Velora Urban Trek", price:100000, sizes:[38,44], colorHint:"Putih krem aksen hitam",
   desc:"Desain sporty dan modern dengan sol tebal bergerigi. Cocok untuk aktivitas sehari-hari maupun gaya kasual.",
   spec:["Material upper dengan desain sporty","Sol tebal dengan pola bergerigi","Warna putih krem dengan aksen hitam"],
   pb:"var(--p-urban)", w:"100%", r:"-4deg", alt:"Velora Urban Trek, sepatu sporty putih krem dengan sol tebal"},
  {id:"trail", cat:"Sepatu outdoor", name:"Velora Trail", price:170000, sizes:[39,45], colorHint:"Hitam atau hijau", dark:true,
   desc:"Kokoh untuk jalur berbatu dan tanah licin, nyaman untuk hiking maupun perjalanan jauh.",
   spec:["Sol bergerigi dengan cengkeraman kuat","Bagian depan diperkuat pelindung jari","Ukuran 39–45, warna hitam dan hijau"],
   pb:"var(--p-trail)", w:"70%", r:"-4deg", alt:"Velora Trail, sepatu hiking hitam bersol bergerigi"}
];
const rp = n => "Rp " + n.toLocaleString("id-ID");
const $ = s => document.querySelector(s);
const range = ([a,b]) => Array.from({length:b-a+1},(_,i)=>a+i);

/* ===== Render ===== */
$("#quick").innerHTML = PRODUCTS.map(p =>
  `<a href="#${p.id}"><img src="${IMG[p.id]}" alt=""><div><b>${p.name.replace("Velora ","")}</b><span>${rp(p.price)}</span></div></a>`).join("");

$("#items").innerHTML = PRODUCTS.map((p,i) => `
  <article class="item ${i%2?"flip":""} ${p.dark?"dark":""}" id="${p.id}" style="--pb:${p.pb};--w:${p.w};--r:${p.r}">
    <div class="arch"><img src="${IMG[p.id]}" alt="${p.alt}" loading="lazy"></div>
    <div>
      <p class="cat">${p.cat}</p>
      <h3>${p.name}</h3>
      <p class="desc">${p.desc}</p>
      <ul class="spec">${p.spec.map(s=>`<li>${s}</li>`).join("")}</ul>
      <div class="buy">
        <div class="price"><small>Harga</small><b>${rp(p.price)}</b></div>
        <button class="btn" type="button" data-order="${p.id}">Pesan sekarang</button>
      </div>
    </div>
  </article>`).join("");

$("#plist").innerHTML = PRODUCTS.map(p => `
  <div class="prow">
    <h3>${p.name}</h3>
    <div class="meta">${p.cat}, ukuran ${p.sizes[0]}–${p.sizes[1]}</div>
    <div class="pr">${rp(p.price)}</div>
    <button class="btn sm" type="button" data-order="${p.id}">Pesan sekarang</button>
  </div>`).join("");

/* ===== Scroll reveal ===== */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealGroups = [
    [".catalog .sec-head", () => "left"],
    [".item", i => i % 2 ? "right" : "left"],
    [".prices .sec-head", () => "left"],
    [".prow", i => i % 2 ? "right" : "left"]
  ];

  revealGroups.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.dataset.reveal = direction(index);
    });
  });

  const revealElements = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add("is-visible"));
  }
}

/* ===== Dialog pesanan ===== */
const dlg = $("#dlg"), fProd = $("#fProd"), fSize = $("#fSize"), fQty = $("#fQty"),
      fColor = $("#fColor"), fName = $("#fName"), fTotal = $("#fTotal"), toast = $("#toast");

fProd.innerHTML = PRODUCTS.map(p => `<option value="${p.id}">${p.name} (${rp(p.price)})</option>`).join("");
const cur = () => PRODUCTS.find(p => p.id === fProd.value);

function syncProduct(){
  const p = cur();
  fSize.innerHTML = range(p.sizes).map(s => `<option>${s}</option>`).join("");
  fColor.placeholder = p.colorHint;
  syncTotal();
}
function syncTotal(){
  const q = Math.max(1, Math.min(20, parseInt(fQty.value,10) || 1));
  fTotal.textContent = rp(cur().price * q);
}
function openOrder(id){
  fProd.value = id; syncProduct(); toast.textContent = "";
  dlg.showModal(); fSize.focus();
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-order]");
  if (b) openOrder(b.dataset.order);
});
fProd.addEventListener("change", syncProduct);
fQty.addEventListener("input", syncTotal);
$("#close").addEventListener("click", () => dlg.close());
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

$("#form").addEventListener("submit", e => {
  e.preventDefault();
  const p = cur(), q = Math.max(1, Math.min(20, parseInt(fQty.value,10) || 1));
  if (!fName.value.trim()){ toast.textContent = "Isi nama kamu dulu ya."; fName.focus(); return; }
  const msg = [
    "Halo Toko Velora, saya ingin memesan:",
    `Produk: ${p.name}`,
    `Ukuran: ${fSize.value}`,
    `Warna: ${fColor.value.trim() || "-"}`,
    `Jumlah: ${q} pasang`,
    `Total: ${rp(p.price*q)}`,
    `Nama: ${fName.value.trim()}`
  ].join("\n");
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener");
  toast.textContent = "WhatsApp dibuka di tab baru. Kirim pesannya untuk menyelesaikan pesanan.";
});
syncProduct();
