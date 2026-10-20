const API = 'https://backenddatasiswa-production.up.railway.app';

const areaLogin = document.getElementById('area-login');
const areaAdmin = document.getElementById('area-admin');
let halaman = 1;
let kataCari = '';

function getToken() {
  return localStorage.getItem('token');
}

function aturTampilan() {
  const login = !!getToken();
  areaLogin.style.display = login ? 'none' : 'block';
  areaAdmin.style.display = login ? 'block' : 'none';
}

document.getElementById('btn-login').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const hasil = await res.json();

  if (!res.ok) {
    document.getElementById('pesan-login').textContent = hasil.pesan;
    return;
  }

  localStorage.setItem('token', hasil.token);
  document.getElementById('pesan-login').textContent = '';
  aturTampilan();
});

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  aturTampilan();
});

document.getElementById('btn-tambah').addEventListener('click', async () => {
  const nama = document.getElementById('nama').value;
  const kelas_id = Number(document.getElementById('kelas').value);

  const res = await fetch(`${API}/siswa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ nama, kelas_id })
  });
  const hasil = await res.json();

  if (!res.ok) {
    document.getElementById('pesan-tambah').textContent = hasil.pesan;
    return;
  }

  document.getElementById('pesan-tambah').textContent = '';
  document.getElementById('nama').value = '';
  document.getElementById('kelas').value = '';
  muatSiswa();
});

aturTampilan();

async function muatSiswa() {
  const res = await fetch(
    `${API}/siswa?page=${halaman}&cari=${encodeURIComponent(kataCari)}`
  );
  const hasil = await res.json();

  const tbody = document.getElementById('tabel-siswa');
  tbody.innerHTML = '';

  hasil.data.forEach((s) => {
    const baris = document.createElement('tr');
    const aksi = getToken()
      ? `<td><button onclick="hapusSiswa(${s.id})">Hapus</button></td>`
      : '';
    baris.innerHTML = `<td>${s.id}</td><td>${s.nama}</td><td>${s.kelas}</td>${aksi}`;
    tbody.appendChild(baris);
  });

  document.getElementById('info-halaman').textContent =
    `Halaman ${hasil.page} dari ${hasil.totalPages}`;
  document.getElementById('btn-prev').disabled = hasil.page <= 1;
  document.getElementById('btn-next').disabled = hasil.page >= hasil.totalPages;
}

document.getElementById('btn-prev').addEventListener('click', () => {
  halaman--;
  muatSiswa();
});

document.getElementById('btn-next').addEventListener('click', () => {
  halaman++;
  muatSiswa();
});

let timer;
document.getElementById('cari').addEventListener('input', (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    kataCari = e.target.value.trim();
    halaman = 1;
    muatSiswa();
  }, 400);
});

muatSiswa();

async function hapusSiswa(id) {
  if (!confirm('Yakin hapus siswa ini?')) return;

  const res = await fetch(`${API}/siswa/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    aturTampilan();
    muatSiswa();
    return;
  }

  muatSiswa();
}

async function muatKelas() {
  const res = await fetch(`${API}/kelas`);
  const daftar = await res.json();

  const select = document.getElementById('kelas');
  daftar.forEach((k) => {
    const opsi = document.createElement('option');
    opsi.value = k.id;
    opsi.textContent = k.nama;
    select.appendChild(opsi);
  });
}

muatKelas();
