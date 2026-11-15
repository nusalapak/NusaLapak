import { sb, state, view, ui, esc, rupiah, safeUrl, slugify, toast, spinner, errBox, begin, show, navigate } from './core.js';

const badge = (on) =>
  on
    ? '<span class="text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">AKTIF</span>'
    : '<span class="text-[11px] font-bold rounded-full bg-red-100 text-red-700 px-2 py-0.5">DITANGGUHKAN</span>';

const denied = `
  <div class="max-w-md mx-auto px-4 py-20 text-center">
    <div class="text-5xl">🚫</div>
    <h1 class="text-xl font-bold mt-4">Akses Ditolak</h1>
    <p class="text-sm text-slate-500 mt-2">Halaman ini khusus Super Admin.</p>
    <a href="#/" class="${ui.btn} mt-6">Ke Beranda</a>
  </div>`;

// =====================================================
// DASBOR SUPER ADMIN  (#/superadmin)
// =====================================================
export async function renderSuperadmin() {
  const v = begin();
  if (!state.user) return navigate('#/login');
  if (state.profile?.role !== 'superadmin') return show(v, denied);

  show(v, `
    <div class="max-w-5xl mx-auto px-4 py-6 grid gap-8">
      <div>
        <h1 class="text-2xl font-extrabold">Dasbor Super Admin</h1>
        <p class="text-sm text-slate-500">Kelola klien UMKM, langganan, dan akun.</p>
      </div>

      <section class="${ui.card} p-5">
        <h2 class="font-bold mb-3">Daftarkan Toko UMKM Baru</h2>
        <form id="store-form" class="grid sm:grid-cols-2 gap-3">
          <div><label class="${ui.label}">Nama Usaha</label><input name="name" required maxlength="80" class="${ui.input}"></div>
          <div><label class="${ui.label}">Slug URL (huruf kecil, angka, strip)</label><input name="slug" required maxlength="50" pattern="[a-z0-9]+(-[a-z0-9]+)*" class="${ui.input}"></div>
          <div><label class="${ui.label}">Nomor WhatsApp Toko</label><input name="whatsapp" required inputmode="tel" placeholder="08123456789" class="${ui.input}"></div>
          <div><label class="${ui.label}">Paket Langganan</label>
            <select name="plan" class="${ui.input}"><option value="basic">Basic</option><option value="pro">Pro</option><option value="premium">Premium</option></select></div>
          <div class="sm:col-span-2"><label class="${ui.label}">Email Akun Pemilik (harus sudah mendaftar)</label>
            <input name="owner_email" type="email" required list="owner-emails" class="${ui.input}"><datalist id="owner-emails"></datalist></div>
          <div class="sm:col-span-2"><button class="${ui.btn}" type="submit">Daftarkan Toko</button></div>
        </form>
        <p class="text-xs text-slate-400 mt-2" id="store-url-hint"></p>
      </section>

      <section>
        <h2 class="font-bold mb-3">Daftar Klien UMKM <span id="store-count" class="text-slate-400 font-normal"></span></h2>
        <div id="sa-stores" class="grid gap-3">${spinner}</div>
      </section>

      <section>
        <h2 class="font-bold mb-3">Akun Terdaftar <span id="acc-count" class="text-slate-400 font-normal"></span></h2>
        <div id="sa-accounts" class="${ui.card} overflow-x-auto">${spinner}</div>
      </section>
    </div>`);

  let stores = [];
  let accounts = [];
  let slugTouched = false;

  async function load() {
    const [st, pr] = await Promise.all([
      sb.from('stores').select('*, owner:profiles(email)').order('created_at', { ascending: false }),
      sb.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);
    if (v !== view.id) return;
    if (st.error || pr.error) {
      document.getElementById('sa-stores').innerHTML = errBox((st.error || pr.error).message);
      return;
    }
    stores = st.data;
    accounts = pr.data;
    draw();
  }

  function draw() {
    document.getElementById('store-count').textContent = `(${stores.length})`;
    document.getElementById('acc-count').textContent = `(${accounts.length})`;
    document.getElementById('owner-emails').innerHTML = accounts.map((a) => `<option value="${esc(a.email)}">`).join('');

    document.getElementById('sa-stores').innerHTML = stores.length
      ? stores
          .map(
            (s) => `
        <div class="${ui.card} p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div class="min-w-0">
            <div class="font-semibold flex items-center gap-2 flex-wrap">${esc(s.name)} ${badge(s.is_active)}</div>
            <div class="text-xs text-slate-500 mt-1 break-words">
              /lapak/${esc(s.slug)} &bull; ${esc(s.owner?.email || 'tanpa pemilik')} &bull; paket ${esc(s.plan)} &bull; WA ${esc(s.whatsapp)}
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <a href="#/lapak/${esc(s.slug)}" target="_blank" class="${ui.btnGhost}">Lihat</a>
            <button data-act="toggle" data-id="${esc(s.id)}" class="${s.is_active ? ui.btnDanger : ui.btn + ' !py-1.5 !px-3 !text-xs'}">
              ${s.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <button data-act="del" data-id="${esc(s.id)}" class="${ui.btnGhost}">Hapus</button>
          </div>
        </div>`
          )
          .join('')
      : '<p class="text-sm text-slate-500">Belum ada toko terdaftar.</p>';

    const count = {};
    stores.forEach((s) => s.owner_id && (count[s.owner_id] = (count[s.owner_id] || 0) + 1));
    document.getElementById('sa-accounts').innerHTML = `
      <table class="w-full text-sm min-w-[480px]">
        <thead class="text-xs text-slate-500 bg-slate-50"><tr>
          <th class="text-left p-3">Email</th><th class="text-left p-3">Nama</th>
          <th class="text-left p-3">Role</th><th class="text-left p-3">Toko</th><th class="text-left p-3">Daftar</th></tr></thead>
        <tbody>${accounts
          .map(
            (a) => `<tr class="border-t border-slate-100">
              <td class="p-3">${esc(a.email)}</td><td class="p-3">${esc(a.full_name || '-')}</td>
              <td class="p-3">${esc(a.role)}</td><td class="p-3">${count[a.id] || 0}</td>
              <td class="p-3 text-slate-500">${new Date(a.created_at).toLocaleDateString('id-ID')}</td></tr>`
          )
          .join('')}</tbody>
      </table>`;
  }

  const app = document.getElementById('app');

  app.oninput = (e) => {
    const f = document.getElementById('store-form');
    if (e.target.name === 'slug') slugTouched = true;
    if (e.target.name === 'name' && !slugTouched) f.slug.value = slugify(e.target.value);
    document.getElementById('store-url-hint').textContent = f.slug.value
      ? `Link toko: ${location.origin}${location.pathname}#/lapak/${f.slug.value}`
      : '';
  };

  app.onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true;
    const { error } = await sb.rpc('admin_create_store', {
      p_name: f.name.value,
      p_slug: f.slug.value,
      p_whatsapp: f.whatsapp.value,
      p_plan: f.plan.value,
      p_owner_email: f.owner_email.value,
    });
    btn.disabled = false;
    if (error) {
      const msg = error.code === '23505' ? 'Slug sudah dipakai toko lain.' : error.code === '23514' ? 'Format slug tidak valid.' : error.message;
      return toast(msg, false);
    }
    toast('Toko berhasil didaftarkan');
    f.reset();
    slugTouched = false;
    document.getElementById('store-url-hint').textContent = '';
    load();
  };

  app.onclick = async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const s = stores.find((x) => x.id === b.dataset.id);
    if (!s) return;
    if (b.dataset.act === 'toggle') {
      const next = !s.is_active;
      if (!next && !confirm(`Nonaktifkan lapak "${s.name}"? Pengunjung akan melihat halaman penangguhan.`)) return;
      b.disabled = true;
      const { error } = await sb.from('stores').update({ is_active: next }).eq('id', s.id);
      if (error) return toast(error.message, false);
      toast(next ? 'Toko diaktifkan' : 'Toko dinonaktifkan');
      load();
    } else if (b.dataset.act === 'del') {
      if (!confirm(`HAPUS PERMANEN toko "${s.name}" beserta semua produknya? Tindakan ini tidak bisa dibatalkan.`)) return;
      const { error } = await sb.from('stores').delete().eq('id', s.id);
      if (error) return toast(error.message, false);
      toast('Toko dihapus');
      load();
    }
  };

  load();
}

// =====================================================
// DASBOR PEMILIK UMKM  (#/dashboard)
// =====================================================
export async function renderDashboard() {
  const v = begin();
  if (!state.user) return navigate('#/login');
  show(v, spinner);

  const { data: stores, error } = await sb
    .from('stores')
    .select('*')
    .eq('owner_id', state.user.id)
    .order('created_at', { ascending: true });
  if (v !== view.id) return;
  if (error) return show(v, errBox(error.message));

  if (!stores.length) {
    return show(v, `
      <div class="max-w-md mx-auto px-4 py-20 text-center">
        <div class="text-5xl">🏪</div>
        <h1 class="text-xl font-bold mt-4">Belum Ada Toko</h1>
        <p class="text-sm text-slate-500 mt-2">Akun <b>${esc(state.user.email)}</b> belum ditautkan ke toko mana pun. Hubungi admin NusaLapak dan sebutkan email ini.</p>
      </div>`);
  }

  let store = stores[0];
  let products = [];
  let editingId = null;

  show(v, `
    <div class="max-w-4xl mx-auto px-4 py-6 grid gap-6">
      <div id="store-head"></div>

      <section class="${ui.card} p-5">
        <h2 class="font-bold mb-3" id="pf-title">Tambah Produk / Menu</h2>
        <form id="pf" class="grid sm:grid-cols-2 gap-3">
          <div><label class="${ui.label}">Nama Produk</label><input name="name" required maxlength="100" class="${ui.input}"></div>
          <div><label class="${ui.label}">Harga (Rp)</label><input name="price" type="number" min="0" step="1" required inputmode="numeric" class="${ui.input}"></div>
          <div class="sm:col-span-2"><label class="${ui.label}">Deskripsi (opsional)</label><textarea name="description" rows="2" maxlength="300" class="${ui.input}"></textarea></div>
          <div class="sm:col-span-2"><label class="${ui.label}">Link Foto (opsional, https://...)</label><input name="image_url" type="url" class="${ui.input}"></div>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="is_available" checked class="w-4 h-4 accent-emerald-600"> Tersedia</label>
          <div class="sm:col-span-2 flex gap-2">
            <button type="submit" class="${ui.btn}" id="pf-submit">Simpan Produk</button>
            <button type="button" data-act="cancel" id="pf-cancel" class="${ui.btnGhost} hidden">Batal Edit</button>
          </div>
        </form>
      </section>

      <section>
        <h2 class="font-bold mb-3">Produk Saya <span id="p-count" class="text-slate-400 font-normal"></span></h2>
        <div id="p-list" class="grid gap-3">${spinner}</div>
      </section>
    </div>`);

  const app = document.getElementById('app');
  const form = () => document.getElementById('pf');

  function drawHead() {
    const url = `${location.origin}${location.pathname}#/lapak/${store.slug}`;
    document.getElementById('store-head').innerHTML = `
      <div class="${ui.card} p-5">
        ${stores.length > 1 ? `<select id="store-select" class="${ui.input} mb-3">${stores.map((s) => `<option value="${esc(s.id)}" ${s.id === store.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>` : ''}
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="text-xl font-extrabold">${esc(store.name)}</h1> ${badge(store.is_active)}
          <span class="text-xs text-slate-500">paket ${esc(store.plan)}</span>
        </div>
        <p class="text-xs text-slate-500 mt-1 break-all">Link lapak: <a class="text-emerald-700 underline" href="#/lapak/${esc(store.slug)}" target="_blank">${esc(url)}</a></p>
        ${!store.is_active ? `<div class="mt-3 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">Lapak Anda sedang ditangguhkan, jadi tidak tampil untuk pengunjung dan produk tidak dapat diubah. Hubungi admin NusaLapak untuk mengaktifkan kembali.</div>` : ''}
        <div class="mt-4">
          <label class="${ui.label}">Deskripsi Toko</label>
          <textarea id="store-desc" rows="2" maxlength="300" class="${ui.input}">${esc(store.description || '')}</textarea>
          <button data-act="save-desc" class="${ui.btnGhost} mt-2">Simpan Deskripsi</button>
        </div>
      </div>`;
    const dis = !store.is_active;
    form().querySelectorAll('input,textarea,button[type=submit]').forEach((el) => (el.disabled = dis));
  }

  function drawProducts() {
    document.getElementById('p-count').textContent = `(${products.length})`;
    document.getElementById('p-list').innerHTML = products.length
      ? products
          .map((p) => {
            const img = safeUrl(p.image_url);
            return `
          <div class="${ui.card} p-3 flex gap-3 items-center">
            ${img ? `<img src="${esc(img)}" alt="" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" onerror="this.remove()">` : ''}
            <div class="min-w-0 flex-1">
              <div class="font-semibold truncate">${esc(p.name)} ${p.is_available ? '' : '<span class="text-[11px] text-red-600 font-bold ml-1">HABIS</span>'}</div>
              <div class="text-sm text-emerald-700 font-bold">${rupiah(p.price)}</div>
              ${p.description ? `<div class="text-xs text-slate-500 truncate">${esc(p.description)}</div>` : ''}
            </div>
            <div class="flex flex-col gap-1.5 flex-shrink-0">
              <button data-act="edit" data-id="${esc(p.id)}" class="${ui.btnGhost}">Edit</button>
              <button data-act="stock" data-id="${esc(p.id)}" class="${ui.btnGhost}">${p.is_available ? 'Set Habis' : 'Set Ada'}</button>
              <button data-act="del" data-id="${esc(p.id)}" class="${ui.btnDanger}">Hapus</button>
            </div>
          </div>`;
          })
          .join('')
      : '<p class="text-sm text-slate-500">Belum ada produk. Tambahkan produk pertama Anda di atas.</p>';
  }

  async function loadProducts() {
    const { data, error } = await sb.from('products').select('*').eq('store_id', store.id).order('created_at', { ascending: true });
    if (v !== view.id) return;
    if (error) return (document.getElementById('p-list').innerHTML = errBox(error.message));
    products = data;
    drawProducts();
  }

  function resetForm() {
    editingId = null;
    form().reset();
    form().is_available.checked = true;
    document.getElementById('pf-title').textContent = 'Tambah Produk / Menu';
    document.getElementById('pf-submit').textContent = 'Simpan Produk';
    document.getElementById('pf-cancel').classList.add('hidden');
  }

  drawHead();
  loadProducts();

  app.onchange = (e) => {
    if (e.target.id === 'store-select') {
      store = stores.find((s) => s.id === e.target.value) || store;
      resetForm();
      drawHead();
      loadProducts();
    }
  };

  app.onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const payload = {
      name: f.name.value.trim(),
      description: f.description.value.trim(),
      price: Math.max(0, Math.round(Number(f.price.value) || 0)),
      image_url: f.image_url.value.trim(),
      is_available: f.is_available.checked,
    };
    if (payload.image_url && !safeUrl(payload.image_url)) return toast('Link foto harus diawali https://', false);
    const btn = document.getElementById('pf-submit');
    btn.disabled = true;
    const q = editingId
      ? sb.from('products').update(payload).eq('id', editingId)
      : sb.from('products').insert({ ...payload, store_id: store.id });
    const { error } = await q;
    btn.disabled = false;
    if (error) return toast(error.message, false);
    toast(editingId ? 'Produk diperbarui' : 'Produk ditambahkan');
    resetForm();
    loadProducts();
  };

  app.onclick = async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    const p = products.find((x) => x.id === b.dataset.id);

    if (act === 'save-desc') {
      const { error } = await sb.rpc('owner_update_store_info', {
        p_store_id: store.id,
        p_description: document.getElementById('store-desc').value.trim(),
      });
      if (error) return toast(error.message, false);
      store.description = document.getElementById('store-desc').value.trim();
      toast('Deskripsi disimpan');
    } else if (act === 'cancel') {
      resetForm();
    } else if (act === 'edit' && p) {
      const f = form();
      editingId = p.id;
      f.name.value = p.name;
      f.price.value = p.price;
      f.description.value = p.description || '';
      f.image_url.value = p.image_url || '';
      f.is_available.checked = p.is_available;
      document.getElementById('pf-title').textContent = 'Edit Produk';
      document.getElementById('pf-submit').textContent = 'Simpan Perubahan';
      document.getElementById('pf-cancel').classList.remove('hidden');
      f.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (act === 'stock' && p) {
      const { error } = await sb.from('products').update({ is_available: !p.is_available }).eq('id', p.id);
      if (error) return toast(error.message, false);
      loadProducts();
    } else if (act === 'del' && p) {
      if (!confirm(`Hapus produk "${p.name}"?`)) return;
      const { error } = await sb.from('products').delete().eq('id', p.id);
      if (error) return toast(error.message, false);
      if (editingId === p.id) resetForm();
      toast('Produk dihapus');
      loadProducts();
    }
  };
}
