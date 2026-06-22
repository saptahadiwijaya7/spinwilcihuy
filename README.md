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
