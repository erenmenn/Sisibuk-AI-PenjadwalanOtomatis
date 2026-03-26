<div align="center">
  <img src="https://raw.githubusercontent.com/erenmenn/Sisibuk-AI-PenjadwalanOtomatis/main/public/mascot.png" width="200" alt="Sisibuk AI Mascot" />
  <h1>✨ Sisibuk AI (MILKUN) ✨</h1>
  <p><b>"Bukan sekadar pengingat. Ini asisten jadwal yang berpikir bareng kamu."</b></p>
  <p>Penjadwalan Super Cerdas Bertenaga Groq (LLaMA 3.3) & Next.js 15</p>

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Groq](https://img.shields.io/badge/Groq-LLaMA--3.3-F55036?style=for-the-badge&logo=groq)](https://groq.com/)
</div>

<br/>

## 🌟 1. Visi & Filosofi Produk
**Sisibuk AI** adalah asisten manajemen jadwal berbasis AI yang menggabungkan *natural language input*, gamifikasi produktivitas, dan sistem klasifikasi intent cerdas dalam satu platform yang terasa seperti mengobrol dengan asisten pribadi.

> **"Jadwal yang baik bukan yang paling lengkap, tapi yang paling bisa diikuti."**

Dibangun di atas tiga prinsip utama:
1. **Percakapan adalah antarmuka terbaik** — Pengguna cukup bicara atau mengetik dalam bahasa alami. AI yang memahami, mengklasifikasi, dan menjadwalkan.
2. **Konteks mengalahkan alarm** — Notifikasi harus relevan dengan situasi, bukan sekadar sirine jam.
3. **Progres terasa nyata** — Gamifikasi membuat penyelesaian jadwal bukan hanya produktif tapi juga menyenangkan.

---

## 🛑 2. Problem Statement (Masalah yang Diselesaikan)
Mahasiswa dan pelajar seringkali menghadapi masalah ini secara bersamaan:
- **Lupa deadline krusial** karena jadwal berserakan di berbagai platform.
- **Tidak tahu kapan harus mulai** (Tahu ada ujian, tapi bingung memecah materi).
- **Kelelahan Setup (Notion Fatigue)**: Pembuatan *database* manual yang sangat rumit.
- **Jadwal bentrok**: Dua deadline bertabrakan tanpa ada sistem yang memberitahu.

---

## 🗺️ 3. Alur Pengguna — Dari Nol Sampai Berjalan

### Fase 1: Onboarding (Pertama Kali Buka)
```text
[Layar Selamat Datang]
        ↓
[Perkenalan AI Assistant — "Hei, aku Jadwal! 
  Aku akan bantu kamu atur semua deadline dan jadwal belajarmu.
  Mulai dengan kasih tau aku jadwal kuliah kamu."]
        ↓
[Input Jadwal Kuliah]
  → Nama mata kuliah
  → Hari & jam
  → Lokasi (opsional)
  → Tandai sebagai "TIDAK BISA DIGANGGU"
        ↓
[AI konfirmasi & simpan blokir waktu]
        ↓
[Masuk ke Chat — "Sekarang, ada deadline atau 
  jadwal apa yang mau kamu tambahkan?"]
```

### Fase 2: Penambahan Jadwal via Chat
```text
Pengguna ketik:
"aku tanggal 2 april 2026 nanti ada submit proposal"
        ↓
[AI parsing & klasifikasi]
  → Tipe: SUBMIT
  → Tanggal: 2 April 2026
  → Prioritas: HIGH
  → Estimasi waktu pengerjaan: 3-5 hari
        ↓
[AI balas dengan konfirmasi + pertanyaan lanjut]
"Oke! Submit proposal 2 April sudah aku catat 🗒️
  Sudah mulai nulis belum? Kalau belum, aku bisa 
  bantu buat jadwal nulis dari sekarang."
        ↓
[Pengguna jawab → AI buat reverse plan opsional]
        ↓
[Reminder dijadwalkan otomatis di background]
```

### Fase 3: Penggunaan Harian
```text
[Buka app]
        ↓
[AI menyapa dengan konteks hari ini]
"Selamat pagi! Hari ini kamu ada 2 hal:
  - Kelas Algoritma jam 09.00
  - Deadline submit proposal 3 hari lagi 🔴
  Mau mulai dari mana?"
        ↓
[Pengguna bisa:]
  → Chat dengan AI
  → Lihat Dashboard Kalender
  → Lihat Dashboard Klasifikasi
  → Mark jadwal selesai (dapat XP!)
```

---

## 🧠 4. AI Assistant — Cara Kerja & Contoh Percakapan

### Arsitektur AI
```text
Input Pengguna (teks bebas)
        ↓
[Intent Classifier] — Groq API (llama-3.3-70b-versatile)
  Output JSON terstruktur:
  {
    intent: "DEADLINE_SUBMIT",
    title: "Submit Proposal",
    deadline: "2026-04-02",
    priority: "HIGH",
    action: "CREATE_SCHEDULE"
  }
        ↓
[Entity Validator] — Zod schema
  Validasi & normalisasi output JSON dari LLM
        ↓
[Conflict Checker] — logika deterministik (bukan LLM)
  Cek: apakah bentrok dengan kuliah atau deadline lain?
        ↓
[Scheduler] — logika deterministik (bukan LLM)
  Buat: jadwal, set reminder, cari slot kosong
        ↓
[Response Generator] — Groq API (llama-3.3-70b-versatile)
  Balas: konfirmasi + saran lanjutan dalam bahasa natural
```

> **Kenapa Groq + Llama?** Groq menggunakan chip LPU (Language Processing Unit) yang membuat inferensi Llama 3.3 70B berjalan sangat cepat — ratusan token per detik. Untuk intent classification yang butuh respons < 1 detik, ini ideal.

### Contoh Percakapan Lengkap

#### Skenario 1: Input Deadline Sederhana
👤 **Pengguna**: *"aku tanggal 2 april 2026 nanti ada submit proposal"*

🤖 **jadwal.ai**: 
*"Siap! Aku sudah catat: 📋 Submit Proposal — 2 April 2026. Aku akan kirim reminder ke kamu di H-7, H-3, dan H-1. Ini proposal untuk apa? Kalau kamu kasih tau, aku bisa bantu estimasi waktu pengerjaannya."*

#### Skenario 2: Reverse Study Planner
👤 **Pengguna**: *"aku mau belajar MCP di AI engineer secara berurutan, ini materinya: Intro, Setup, Tools, Building, Integration, Testing, Delivery. Bantu aku penjadwalan, cari jam kosong aku"*

🤖 **jadwal.ai**: 
*"Wah, list materinya bagus! Aku lihat kamu ada 7 topik. Berdasarkan jam kosongmu (setelah aku keluarkan jam kuliah), ini rencana belajarku: [Jadwal Belajar disusun di hari Senin-Sabtu jam 19.00]. Jam kuliah kamu sudah aku skip otomatis."*

#### Skenario 3: Deteksi Konflik
👤 **Pengguna**: *"tambah: submit laporan PKM 1 april"*

🤖 **jadwal.ai**: 
*"⚠️ Hei, aku deteksi konflik! Kamu sudah punya Submit Proposal — 2 April 2026. Dua submission bertabrakan dalam 2 hari! Ini bakal berat kalau dikerjain barengan. Saran dari aku: Prioritaskan PKM dulu!"*

---

## 🏷️ 5. Sistem Klasifikasi Intent
AI mengklasifikasikan setiap input ke dalam kategori berikut:

### Tipe Jadwal
| Intent Class | Deskripsi | Contoh | Default Reminder |
| :--- | :--- | :--- | :--- |
| **DEADLINE_SUBMIT** | Pengumpulan tugas/proposal/laporan | *"submit proposal 2 april"* | H-7, H-3, H-1, H-0 |
| **DEADLINE_REGISTER** | Tutup pendaftaran lomba/beasiswa/seleksi | *"pendaftaran SNBT tutup 31 maret"* | H-7, H-3, H-1, H-0 |
| **EXAM** | Ujian, tes, sertifikasi | *"UTS algoritma minggu depan"* | H-14, H-7, H-3, H-1 |
| **STUDY_SESSION** | Sesi belajar terstruktur | *"belajar MCP senin jam 7 malam"* | H-0 jam 1 sebelum |
| **STUDY_PLAN** | Rencana belajar dari daftar materi | *"bantu jadwalin belajar topik ini"* | Per sesi |
| **MEETING_PRESENTATION**| Presentasi, sidang, seminar | *"presentasi PKM jumat"* | H-3, H-1, -1 jam |
| **CLASS** | Jadwal kuliah (tidak bisa diganggu) | *"kuliah senin 08.00 algoritma"* | Tidak ada reminder |
| **PERSONAL** | Kegiatan personal/sosial | *"ulang tahun adik 5 april"* | H-1 |

### Label Prioritas
| Level | Warna | Kriteria |
| :--- | :--- | :--- |
| **CRITICAL** | 🔴 Merah | Deadline < 3 hari |
| **HIGH** | 🟠 Oranye | Deadline 3-7 hari |
| **MEDIUM** | 🟡 Kuning | Deadline 7-14 hari |
| **LOW** | 🟢 Hijau | Deadline > 14 hari |
| **DONE** | ⚫ Abu | Sudah selesai |

---

## 🔔 6. Sistem Notifikasi Otomatis

**Logika Pengiriman:**
Setiap malam jam 00.00 UTC+7:
- jika sisa_hari == 14 → kirim email digest
- jika sisa_hari == 7 → kirim email + push notif (reminder awal)
- jika sisa_hari == 3 → kirim email urgent + push notif
- jika sisa_hari == 1 → kirim email + push notif (2x: pagi & malam)
- jika sisa_hari == 0 → kirim email + push notif jam 07.00 pagi

---

## 🏆 7. Gamifikasi: XP, Level & Badge
- **Tambah jadwal baru**: +10 XP
- **Tandai Selesai**: +50 XP
- **Selesai Lebih Awal**: +75 XP
- **Streak 7 Hari**: +100 XP bonus

**Level System:**
- 🌱 Penjadwal Pemula (Lv 1)
- 💪 Deadline Crusher (Lv 3)
- 🧠 Study Strategist (Lv 4)
- 🏆 Jadwal Legend (Lv 7)

---

## 🏗️ 8. Arsitektur Teknologi
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4.
- **AI**: Groq (LLaMA 3.3 70B Versatile).
- **Backend/DB**: Supabase (Postgres & Auth).
- **Real-time State**: Zustand.

---

## 🏁 9. Kesimpulan
**Sisibuk AI** mengubah manajemen jadwal yang membosankan menjadi pengalaman interaktif yang menyenangkan. Dengan asisten bertenaga AI tercepat di dunia (Groq), Sisibuk memastikan tidak ada lagi deadline yang terlewat dan waktu belajarmu terorganisir dengan sempurna.

---

## 📦 10. Cara Memulai (Local Setup)
1. **Clone**: `git clone https://github.com/erenmenn/Sisibuk-AI-PenjadwalanOtomatis.git`
2. **Install**: `npm install`
3. **Env**: Isi `.env.local` dengan API Key Groq & Supabase.
4. **Run**: `npm run dev`

---
*Dibuat oleh Erenmenn untuk Mahasiswa yang ingin menaklukkan tantangan produktivitas.*
