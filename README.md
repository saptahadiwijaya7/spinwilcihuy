# SpinWheel Seminar

Webapp spinwheel modern untuk operator kuis seminar.

## Fitur

- Menampung sampai 1000 nama peserta.
- Sekali spin dapat memilih 1 sampai 10 pemenang.
- Nama yang sudah menang otomatis dihapus dari daftar aktif.
- Import peserta dari Excel `.xlsx`, `.xls`, CSV, paste manual, atau Google Sheet publik.
- Export hasil pemenang ke Excel.
- Export sisa peserta ke Excel.
- Export CSV yang bisa di-upload/import ke Google Sheet.
- Riwayat pemenang per batch.
- Undo spin terakhir.
- Reset peserta / reset semua data.
- Fullscreen untuk proyektor.
- Confetti saat pemenang keluar.
- Data tersimpan otomatis di localStorage browser.

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Import Google Sheet

Gunakan URL Google Sheet biasa, contoh:

```text
https://docs.google.com/spreadsheets/d/ID_SHEET/edit#gid=0
```

Pastikan akses Google Sheet diatur menjadi **Anyone with the link can view**.

## Format data peserta

Aplikasi membaca semua sel dari sheet pertama Excel/CSV. Disarankan satu kolom berisi nama peserta.

Contoh:

| Nama |
| ---- |
| Andi |
| Budi |
| Citra |

## Catatan export Google Sheet

Aplikasi menghasilkan file CSV untuk Google Sheet. Buka Google Sheet, lalu pilih:

```text
File > Import > Upload > pilih file CSV
```

## Update fitur versi ini

- Tombol **Fullscreen UI** untuk menampilkan seluruh aplikasi.
- Tombol **Fullscreen Wheel** untuk menampilkan area wheel saja.
- Poros/tombol tengah wheel sekarang bisa diklik untuk memulai spin.
- Setelah spin selesai, pemenang tampil dalam popup besar agar mudah terlihat di layar/proyektor.

## Update v4
- Header memakai background mascot lucu dari gambar yang diberikan.
- Desain header dibuat lebih playful dengan gradient pastel, chip mascot, dan tombol fullscreen tetap tersedia.

## Update audio dan durasi spin

- Durasi spin dapat diatur dari 2 sampai 60 detik.
- Animasi wheel mengikuti durasi yang dipilih.
- Efek suara roda berputar aktif saat spin berjalan.
- Efek suara terompet aktif saat popup pemenang muncul.
- Suara FX dapat di-mute dan di-unmute dari panel kontrol.
- Pengaturan durasi dan mute/unmute tersimpan otomatis di browser.

## Update akurasi panah v2

- Posisi berhenti wheel sekarang diarahkan ke area tengah segment nama, bukan ke garis batas antar nama.
- Logic pemenang tetap dihitung dari nama yang benar-benar berada di bawah setiap panah.
- Untuk data besar, segment wheel mengikuti seluruh nama aktif; label nama otomatis disembunyikan agar tampilan tetap rapi.

## Update popup banner iklan
- Popup banner iklan opsional sebelum popup pemenang.
- Banner muncul setelah wheel berhenti berputar.
- Pemenang baru tampil setelah banner ditutup lewat tombol X.
- Banner bisa diaktifkan/nonaktifkan dari dashboard.
- Asset banner bisa upload gambar atau GIF.

## Update Bigwil winner panel
- Mode Bigwil sekarang tetap menampilkan komponen Pemenang Terbaru di bawah wheel.
- Komponen statistik dan preview peserta tetap disembunyikan saat Bigwil agar layar tetap fokus.

## Update Bigwil bottom panel
- Panel Pemenang Terbaru pada mode Bigwil diposisikan fixed di bagian bawah layar.
- Wheel diberi area khusus agar tidak overlap dengan panel pemenang terbaru saat ukuran wheel besar.

## Spinwil Cihuy v1.0

Update transparansi wheel:
- Semua nama peserta selalu ditampilkan di wheel, termasuk saat data peserta banyak.
- Font nama otomatis mengecil sesuai jumlah peserta.
- Warna wheel memakai 20 warna yang diulang agar segment tetap lebih jelas.
- Label nama diposisikan lebih dekat ke area luar wheel.
- Nama yang sedang dilewati saat spin tampil di poros wheel sebagai indikator transparansi.
- Mode Bigwil tetap menampilkan panel Pemenang Terbaru di bawah layar.

## Fix v1.0.1
- Wheel sekarang digambar dengan SVG slice, bukan conic-gradient, supaya warna segment, label nama, panah, dan logic pemenang memakai sistem sudut yang sama.
- Label nama diposisikan di tengah segment, bukan garis pembatas.
- Pemenang dihitung dari segment yang benar-benar berada di bawah panah.
