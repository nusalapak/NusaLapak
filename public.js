import { sb, state, view, ui, esc, rupiah, safeUrl, waLink, toast, spinner, errBox, notice, begin, show, loadAuth, navigate, renderNav } from './core.js';
import { ADMIN_WA } from './config.js';

// Warna papan nama toko (dipilih tetap berdasarkan slug)
const tones = [
  ['bg-kunyit', 'text-ink'],
  ['bg-sambal', 'text-white'],
  ['bg-pandan', 'text-white'],
  ['bg-ink', 'text-white'],
];
const toneOf = (slug) => tones[[...String(slug)].reduce((a, c) => a + c.charCodeAt(0), 0) % tones.length];
const initialOf = (name) => (String(name).trim()[0] || '?').toUpperCase();

// =====================================================
// HALAMAN UTAMA  (#/)
// =====================================================
export async function renderHome() {
  const v = begin();
  const daftarWa = waLink(ADMIN_WA, 'Halo Admin NusaLapak, saya ingin mendaftarkan usaha saya agar punya etalase digital. Mohon info paket & caranya ya.');

  show(v, `
    <section class="bg-kunyit border-b-2 border-ink">
      <div class="max-w-5xl mx-auto px-4 py-12 lg:py-20 grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-center">
        <div>
          <h1 class="font-display text-[2.6rem] sm:text-6xl lg:text-7xl font-extrabold leading-[0.95]">
            Katalog jualanmu, satu link. Pesanan masuk ke WhatsApp.
          </h1>
          <p class="mt-5 text-base sm:text-lg max-w-xl text-ink/80 leading-relaxed">
            NusaLapak membuatkan etalase produk atau menu untuk usaha kecilmu. Pelanggan memilih,
            menekan pesan, dan daftar belanjanya langsung tersusun rapi di chat WhatsApp kamu.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="${esc(daftarWa)}" target="_blank" rel="noopener" class="${ui.btnWa} text-base px-6 py-3">Daftarkan usahamu lewat WhatsApp</a>
            <a href="#daftar-toko" data-scroll class="${ui.btnLight} text-base px-6 py-3">Lihat toko yang sudah jalan</a>
          </div>
        </div>

        <div class="nota-wrap" aria-label="Contoh pesanan yang masuk ke WhatsApp penjual">
          <div class="bg-white px-5 pt-5 pb-3 text-sm">
            <div class="flex items-baseline justify-between gap-3">
              <span class="font-display font-extrabold text-xl">Pesanan baru</span>
              <span class="text-xs text-ink/50">Contoh tampilan</span>
            </div>
            <p class="text-xs text-ink/60 mt-0.5">untuk Warung Bu Sari</p>
            <div class="border-t-2 border-dashed border-ink/25 my-3"></div>
            <ul class="grid gap-1.5">
              <li class="flex justify-between gap-3"><span>1. Nasi goreng spesial x2</span><span class="tabular-nums">Rp 36.000</span></li>
              <li class="flex justify-between gap-3"><span>2. Es teh manis x2</span><span class="tabular-nums">Rp 10.000</span></li>
              <li class="flex justify-between gap-3"><span>3. Kerupuk x1</span><span class="tabular-nums">Rp 3.000</span></li>
            </ul>
            <div class="border-t-2 border-dashed border-ink/25 my-3"></div>
            <div class="flex justify-between font-extrabold text-base"><span>Total</span><span class="tabular-nums">Rp 49.000</span></div>
            <p class="text-xs text-ink/60 mt-3 leading-relaxed">Nama: Dewi<br>Catatan: sambalnya dipisah ya</p>
          </div>
          <div class="zigzag"></div>
          <span class="stamp">Terkirim ke WhatsApp</span>
        </div>
      </div>
    </section>

    <section class="max-w-5xl mx-auto px-4 py-16 grid lg:grid-cols-[.8fr_1.2fr] gap-8 lg:gap-14">
      <h2 class="font-display text-3xl sm:text-4xl font-extrabold leading-tight">Cukup satu link untuk semua dagangan</h2>
      <dl class="border-y-2 border-ink/10 divide-y-2 divide-ink/10">
        <div class="py-5">
          <dt class="font-display text-xl font-bold">Katalog yang rapi</dt>
          <dd class="mt-1 text-ink/70">Foto, harga, dan stok tampil di satu halaman yang enak dibuka dari HP.</dd>
        </div>
        <div class="py-5">
          <dt class="font-display text-xl font-bold">Pesanan sudah tersusun</dt>
          <dd class="mt-1 text-ink/70">Pelanggan tidak perlu mengetik daftar belanja. Item, jumlah, dan total ikut terkirim.</dd>
        </div>
        <div class="py-5">
          <dt class="font-display text-xl font-bold">Kelola sendiri kapan saja</dt>
          <dd class="mt-1 text-ink/70">Tambah, ubah, atau hapus produk lewat dasbor sederhana, tanpa perlu paham teknis.</dd>
        </div>
      </dl>
    </section>

    <section class="bg-white border-y-2 border-ink">
      <div class="max-w-5xl mx-auto px-4 py-16">
        <h2 class="font-display text-3xl sm:text-4xl font-extrabold">Tiga langkah sampai jualan</h2>
        <ol class="mt-10 grid sm:grid-cols-3 gap-10 sm:gap-6">
          ${[
            ['1', 'Hubungi admin', 'Kirim pesan lewat WhatsApp dan ceritakan usahamu.'],
            ['2', 'Lapak dibuatkan', 'Admin menyiapkan etalase dan akun dasbor untukmu.'],
            ['3', 'Isi produk, bagikan link', 'Pasang di bio Instagram, status WhatsApp, atau cetak jadi QR.'],
          ].map(([n, t, d]) => `
            <li>
              <div class="font-display text-8xl font-extrabold leading-none text-transparent" style="-webkit-text-stroke:2px #1B1A17">${n}</div>
              <h3 class="font-display text-xl font-bold mt-3">${t}</h3>
              <p class="text-ink/70 mt-1">${d}</p>
            </li>`).join('')}
        </ol>
      </div>
    </section>

    <section id="daftar-toko" class="max-w-5xl mx-auto px-4 py-16 scroll-mt-20">
      <h2 class="font-display text-3xl sm:text-4xl font-extrabold">Toko yang sudah buka</h2>
      <div id="store-list" class="mt-8">${spinner}</div>
    </section>

    <section class="bg-ink text-white">
      <div class="max-w-5xl mx-auto px-4 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <h2 class="font-display text-3xl sm:text-4xl font-extrabold leading-tight max-w-xl">Usahamu belum punya etalase online?</h2>
        <a href="${esc(daftarWa)}" target="_blank" rel="noopener" class="${ui.btnWa} text-base px-6 py-3 self-start md:self-auto" style="box-shadow:3px 3px 0 #FFC83D">Chat admin sekarang</a>
      </div>
    </section>
  `);

  document.getElementById('app').onclick = (e) => {
    const a = e.target.closest('[data-scroll]');
    if (a) {
      e.preventDefault();
      document.getElementById('daftar-toko')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { data, error } = await sb
    .from('stores')
    .select('name,slug,description')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (v !== view.id) return;
  const box = document.getElementById('store-list');
  if (error) return (box.innerHTML = `<p class="text-sm text-sambal">${esc(error.message)}</p>`);
  if (!data.length) {
    box.innerHTML = '<p class="text-ink/60">Belum ada toko yang aktif. Toko pertama akan muncul di sini.</p>';
    return;
  }
  box.innerHTML = `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${data
    .map((s) => {
      const [bg, fg] = toneOf(s.slug);
      return `
      <a href="#/lapak/${esc(s.slug)}" class="tile relative overflow-hidden rounded-xl border-2 border-ink ${bg} ${fg} p-5 min-h-[150px] flex flex-col justify-between">
        <span aria-hidden="true" class="absolute -right-1 -top-3 font-display text-8xl font-extrabold leading-none opacity-20 select-none">${esc(initialOf(s.name))}</span>
        <div class="relative">
          <div class="font-display text-2xl font-extrabold leading-tight">${esc(s.name)}</div>
          <p class="text-sm opacity-85 mt-1 line-clamp-2">${esc(s.description || 'Lihat menu dan produk kami.')}</p>
        </div>
        <span class="relative text-sm font-bold underline underline-offset-4 mt-4">Buka lapak</span>
      </a>`;
    })
    .join('')}</div>`;
}

// =====================================================
// ETALASE TOKO  (#/lapak/slug)
// =====================================================
export async function renderLapak(slug) {
  const v = begin();
  show(v, spinner);

  const { data: store, error } = await sb
    .from('stores')
    .select('id,name,slug,description,whatsapp,is_active')
    .eq('slug', slug)
    .maybeSingle();
  if (v !== view.id) return;
  if (error) return show(v, errBox(error.message));

  if (!store || !store.is_active) {
    let suspended = !!store && !store.is_active;
    if (!store) {
      const { data } = await sb.rpc('get_store_status', { p_slug: slug });
      suspended = !!(data && data.length && data[0].is_active === false);
    }
    if (v !== view.id) return;
    if (suspended) {
      return show(v, notice({
        title: 'Lapak sedang ditangguhkan',
        text: 'Lapak ini sementara tidak bisa dibuka. Hubungi pemilik toko langsung, atau coba lagi nanti.',
        cta: { href: '#/', label: 'Ke beranda' },
      }));
    }
    return show(v, notice({
      title: 'Lapak tidak ditemukan',
      text: 'Alamat yang kamu buka tidak cocok dengan toko mana pun. Periksa lagi link-nya.',
      cta: { href: '#/', label: 'Ke beranda' },
    }));
  }

  document.title = `${store.name} | NusaLapak`;

  const { data: products, error: pErr } = await supabaseProducts(store.id);
  if (v !== view.id) return;
  if (pErr) return show(v, errBox(pErr.message));

  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const cart = {};
  const mediaCls = 'w-[84px] h-[84px] sm:w-24 sm:h-24 shrink-0 rounded-lg border border-ink/10';

  const row = (p) => {
    const img = safeUrl(p.image_url);
    const id = esc(p.id);
    const media = img
      ? `<img src="${esc(img)}" alt="" loading="lazy" class="${mediaCls} object-cover bg-kunyit/30" onerror="this.removeAttribute('src')">`
      : `<div class="${mediaCls} bg-kunyit/40 flex items-center justify-center font-display text-3xl font-extrabold text-ink/40" aria-hidden="true">${esc(initialOf(p.name))}</div>`;
    const action = p.is_available
      ? `<div data-row="${id}">
           <button data-act="inc" data-id="${id}" data-add class="sticker inline-flex items-center rounded-md bg-ink text-white text-sm font-bold px-3 py-1.5">Tambah</button>
           <div data-step style="display:none" class="inline-flex items-center border-2 border-ink rounded-md overflow-hidden bg-white">
             <button data-act="dec" data-id="${id}" aria-label="Kurangi ${esc(p.name)}" class="w-8 h-8 font-bold hover:bg-kunyit">−</button>
             <span data-qty class="w-7 text-center text-sm font-bold tabular-nums">0</span>
             <button data-act="inc" data-id="${id}" aria-label="Tambah ${esc(p.name)}" class="w-8 h-8 font-bold hover:bg-kunyit">+</button>
           </div>
         </div>`
      : '<span class="text-sm font-bold text-sambal">Stok habis</span>';
    return `
    <article class="flex gap-3 bg-white border border-ink/15 rounded-xl p-3 ${p.is_available ? '' : 'opacity-60'}">
      ${media}
      <div class="min-w-0 flex-1 flex flex-col">
        <h3 class="font-bold leading-snug">${esc(p.name)}</h3>
        ${p.description ? `<p class="text-sm text-ink/60 line-clamp-2 mt-0.5">${esc(p.description)}</p>` : ''}
        <div class="mt-auto pt-2 flex items-center justify-between gap-2">
          <span class="price-tag">${rupiah(p.price)}</span>
          ${action}
        </div>
      </div>
    </article>`;
  };

  show(v, `
    <div class="bg-kunyit">
      <div class="awning"></div>
      <div class="awning-edge"></div>
      <div class="max-w-5xl mx-auto px-4 pt-6 pb-10">
        <h1 class="font-display text-4xl sm:text-6xl font-extrabold leading-[0.95]">${esc(store.name)}</h1>
        ${store.description ? `<p class="mt-3 max-w-2xl text-ink/80 leading-relaxed">${esc(store.description)}</p>` : ''}
        <a href="${esc(waLink(store.whatsapp, `Halo ${store.name}, saya mau tanya-tanya dulu ya.`))}" target="_blank" rel="noopener" class="${ui.btnWa} mt-5">Tanya penjual lewat WhatsApp</a>
      </div>
    </div>

    <section class="max-w-5xl mx-auto px-4 py-8 pb-52">
      <h2 class="font-display text-2xl font-extrabold mb-4">Menu dan produk</h2>
      ${products.length
        ? `<div class="grid sm:grid-cols-2 gap-3">${products.map(row).join('')}</div>`
        : '<p class="text-ink/60">Produk belum ditambahkan. Cek lagi nanti.</p>'}
    </section>

    <div id="cart-bar" class="hidden fixed bottom-0 inset-x-0 z-30 bg-ink text-white border-t-2 border-kunyit">
      <div class="max-w-5xl mx-auto p-3 grid gap-2">
        <p class="text-sm font-bold" id="cart-sum"></p>
        <div class="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input id="cust-name" maxlength="60" placeholder="Nama kamu" aria-label="Nama kamu" class="${ui.input}">
          <input id="cust-note" maxlength="150" placeholder="Catatan (opsional)" aria-label="Catatan pesanan" class="${ui.input}">
          <button data-act="order" class="${ui.btnWa} py-2.5" style="box-shadow:3px 3px 0 #FFC83D">Pesan via WhatsApp</button>
        </div>
      </div>
    </div>
  `);

  const entries = () => Object.entries(cart).filter(([, q]) => q > 0);
  const total = () => entries().reduce((a, [id, q]) => a + byId[id].price * q, 0);

  function sync() {
    const items = entries();
    document.querySelectorAll('[data-row]').forEach((r) => {
      const q = cart[r.dataset.row] || 0;
      r.querySelector('[data-add]').style.display = q > 0 ? 'none' : 'inline-flex';
      r.querySelector('[data-step]').style.display = q > 0 ? 'inline-flex' : 'none';
      r.querySelector('[data-qty]').textContent = q;
    });
    document.getElementById('cart-bar').classList.toggle('hidden', items.length === 0);
    document.getElementById('cart-sum').textContent =
      `${items.reduce((a, [, q]) => a + q, 0)} item, total ${rupiah(total())}`;
  }

  document.getElementById('app').onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    const id = b.dataset.id;
    if (act === 'inc') {
      cart[id] = Math.min((cart[id] || 0) + 1, 99);
      sync();
    } else if (act === 'dec') {
      cart[id] = Math.max((cart[id] || 0) - 1, 0);
      sync();
    } else if (act === 'order') {
      const items = entries();
      if (!items.length) return;
      const name = document.getElementById('cust-name').value.trim() || '-';
      const note = document.getElementById('cust-note').value.trim();
      const lines = items.map(([pid, q], i) => {
        const p = byId[pid];
        return `${i + 1}. ${p.name} x${q} = ${rupiah(p.price * q)}`;
      });
      const text =
        `Halo ${store.name}, saya ingin memesan:\n\n` +
        lines.join('\n') +
        `\n\nTotal: ${rupiah(total())}\n` +
        `Nama: ${name}\n` +
        (note ? `Catatan: ${note}\n` : '') +
        `\nTerima kasih!`;
      window.open(waLink(store.whatsapp, text), '_blank', 'noopener');
    }
  };
}

async function supabaseProducts(storeId) {
  return sb.from('products').select('*').eq('store_id', storeId).order('created_at', { ascending: true });
}

// =====================================================
// LOGIN & DAFTAR  (#/login)
// =====================================================
export async function renderLogin() {
  const v = begin();

  if (state.user) {
    const isSuper = state.profile?.role === 'superadmin';
    return show(v, notice({
      title: 'Kamu sudah masuk',
      text: `Masuk sebagai <b>${esc(state.user.email)}</b>.`,
      cta: { href: isSuper ? '#/superadmin' : '#/dashboard', label: 'Buka dasbor' },
    }));
  }

  let mode = 'login';

  function draw(msg = '') {
    const isLogin = mode === 'login';
    const tab = (m, label) => `
      <button data-act="mode" data-mode="${m}" class="flex-1 py-2 text-sm font-bold border-b-4 ${mode === m ? 'border-ink text-ink' : 'border-transparent text-ink/50 hover:text-ink'}">${label}</button>`;
    show(v, `
      <div class="max-w-sm mx-auto px-4 py-12">
        <div class="bg-white border-2 border-ink rounded-xl overflow-hidden" style="box-shadow:5px 5px 0 #1B1A17">
          <div class="awning"></div>
          <div class="p-6">
            <h1 class="font-display text-2xl font-extrabold">${isLogin ? 'Masuk ke NusaLapak' : 'Buat akun pemilik toko'}</h1>
            <div class="flex mt-4 mb-5 border-b border-ink/15">${tab('login', 'Masuk')}${tab('register', 'Daftar')}</div>
            ${msg ? `<div role="alert" class="mb-4 text-sm rounded-lg bg-kunyit/30 border border-kunyit-600 p-3">${esc(msg)}</div>` : ''}
            <form id="auth-form" class="grid gap-3">
              ${!isLogin ? `<div><label class="${ui.label}" for="f-name">Nama lengkap</label><input id="f-name" name="full_name" required maxlength="80" class="${ui.input}"></div>` : ''}
              <div><label class="${ui.label}" for="f-email">Email</label><input id="f-email" name="email" type="email" required autocomplete="email" class="${ui.input}"></div>
              <div><label class="${ui.label}" for="f-pass">Password</label><input id="f-pass" name="password" type="password" required minlength="6" autocomplete="${isLogin ? 'current-password' : 'new-password'}" class="${ui.input}"></div>
              <button class="${ui.btn} mt-1 py-2.5" type="submit">${isLogin ? 'Masuk' : 'Buat akun'}</button>
            </form>
            ${!isLogin ? '<p class="text-xs text-ink/60 mt-3">Setelah mendaftar, kirim emailmu ke admin NusaLapak supaya lapakmu ditautkan ke akun ini.</p>' : ''}
          </div>
        </div>
      </div>`);
  }
  draw();

  const app = document.getElementById('app');
  app.onclick = (e) => {
    const b = e.target.closest('[data-act="mode"]');
    if (b) {
      mode = b.dataset.mode;
      draw();
    }
  };
  app.onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const btn = f.querySelector('button[type=submit]');
    const email = f.email.value.trim();
    const password = f.password.value;
    btn.disabled = true;
    try {
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { full_name: f.full_name.value.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          mode = 'login';
          return draw('Akun dibuat. Cek emailmu untuk konfirmasi, lalu masuk.');
        }
      }
      await loadAuth();
      renderNav();
      toast('Berhasil masuk');
      navigate(state.profile?.role === 'superadmin' ? '#/superadmin' : '#/dashboard');
    } catch (err) {
      toast(translateAuthError(err.message), false);
      btn.disabled = false;
    }
  };
}

function translateAuthError(m = '') {
  if (/invalid login/i.test(m)) return 'Email atau password salah.';
  if (/already registered/i.test(m)) return 'Email sudah terdaftar, silakan masuk.';
  if (/email not confirmed/i.test(m)) return 'Email belum dikonfirmasi. Cek kotak masuk kamu.';
  if (/password/i.test(m)) return 'Password minimal 6 karakter.';
  return m;
}
