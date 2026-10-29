# Tugas Praktikum MSIM4401 — Aplikasi Cuaca Jakarta

## Identitas mahasiswa

| Keterangan | Data |
| --- | --- |
| Nama | Andri Priyandi |
| NIM | 052098692 |
| Program studi | Sistem Informasi |

## Deskripsi tugas

Proyek ini adalah aplikasi cuaca berbasis **Ionic Vue** yang mengambil prakiraan suhu per jam untuk Jakarta dari [Open-Meteo](https://open-meteo.com/). Aplikasi menampilkan waktu pengukuran dan temperatur dalam tabel, sehingga data prakiraan dapat dibaca per jam dan per tanggal.

Koordinat yang digunakan adalah **-6.2, 106.8** (Jakarta). Parameter `timezone=Asia/Jakarta` membuat waktu dari API ditampilkan dalam **WIB**. Data yang ditampilkan merupakan *prakiraan* dari API dan dapat berubah saat sumber data diperbarui.

## Fitur aplikasi

- Menampilkan seluruh pasangan `hourly.time` dan `hourly.temperature_2m` dari respons API dalam tabel.
- Mengelompokkan data berdasarkan tanggal, dengan pilihan **Semua hari** atau satu tanggal tertentu.
- Menampilkan suhu prakiraan terdekat dan grafik tren untuk maksimal 24 data per jam berikutnya.
- Menampilkan jumlah data per jam, jumlah hari, serta rentang suhu minimum–maksimum dari seluruh data yang diterima.
- Menyediakan tombol **Muat ulang**, indikator saat memuat, serta pesan kesalahan dan tombol **Coba lagi** bila pengambilan data gagal.
- Menyesuaikan tampilan untuk layar ponsel dan komputer.

## Sumber data dan pengolahan

Aplikasi mengirim permintaan `GET` ke endpoint berikut melalui Axios:

```text
https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m&timezone=Asia%2FJakarta
```

`WeatherService.ts` memeriksa bahwa `hourly.time` dan `hourly.temperature_2m` berupa array dengan panjang yang sama. Kedua array kemudian dipasangkan berdasarkan indeks: waktu pada indeks ke-`i` dipasangkan dengan suhu pada indeks ke-`i`. Jika format data tidak sesuai, aplikasi menampilkan pesan kesalahan.

`HomePage.vue` mengelompokkan hasil berdasarkan bagian tanggal dari `time`, lalu mengisi tabel dan ringkasan. Nilai suhu dan jumlah baris mengikuti respons API; tidak ada angka hasil prakiraan yang ditulis tetap di dalam aplikasi.

## Teknologi

- Ionic Vue, Vue 3, dan TypeScript untuk antarmuka aplikasi.
- Axios untuk mengambil data Open-Meteo.
- Vite untuk menjalankan dan membangun proyek.
- CSS dan SVG untuk tampilan serta grafik suhu.

## Cara menjalankan

Pastikan **Node.js** dan **npm** tersedia, lalu jalankan perintah berikut dari folder proyek:

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan oleh Vite di terminal. Koneksi internet diperlukan untuk mengambil data cuaca. Untuk memeriksa proses build:

```bash
npm run build
```

## Publikasi gratis dengan GitHub Pages

Proyek ini disiapkan untuk dipublikasikan melalui GitHub Pages menggunakan workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Setiap perubahan yang dikirim ke branch `main` akan menjalankan `npm ci`, memeriksa TypeScript, membangun aplikasi, lalu mengunggah folder `dist/` ke GitHub Pages. Workflow juga dapat dijalankan manual dari tab **Actions**.

Alamat situs setelah deployment pertama berhasil: https://andripriyandi.github.io/cuaca-ionic-vue/

Pada repositori GitHub, buka **Settings → Pages** dan pilih **GitHub Actions** sebagai sumber publikasi. Repositori harus tetap publik agar dapat memakai GitHub Pages pada paket GitHub Free. Vite menggunakan base path `/cuaca-ionic-vue/` saat build, sedangkan Vue Router memakai URL hash agar halaman dapat dibuka ulang tanpa kesalahan 404.

## Hasil dan analisis

Setelah data berhasil diambil, halaman menampilkan tabel waktu dan suhu per jam dalam WIB. Pilihan tanggal membantu membaca data tanpa menggulir seluruh prakiraan sekaligus. Grafik memperlihatkan kecenderungan suhu untuk maksimal 24 jam berikutnya, sementara kartu ringkasan menunjukkan cakupan dan rentang suhu dari data yang diterima.

Jumlah hari, jumlah baris, dan suhu yang terlihat bergantung pada respons Open-Meteo saat aplikasi dijalankan. Jika koneksi gagal atau respons tidak valid, tabel tidak ditampilkan dan pengguna dapat mencoba mengambil data kembali.

## Struktur berkas utama

| Berkas | Fungsi |
| --- | --- |
| `src/services/WeatherService.ts` | Mengambil dan memvalidasi data suhu per jam dari API. |
| `src/views/HomePage.vue` | Menampilkan prakiraan, grafik, filter tanggal, tabel, dan status permintaan. |
| `src/router/index.ts` | Mengarahkan halaman utama ke `/home`. |

## Referensi tampilan

Warna dan susunan kartu cuaca terinspirasi dari [template Figma Simple Temperature App karya Victor Panguene](https://ui4free.com/mobile-templates/simple-temperature-app-figma-mobile-template.htm). Antarmuka proyek ini dibuat dengan CSS dan SVG sesuai kebutuhan data tugas.
