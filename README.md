# E-Voting Frontend

Sistem *front-end* untuk aplikasi E-Voting Decentralized. Dibangun menggunakan Next.js (dengan App Router terbaru), Tailwind CSS untuk penataan tata letak, dan `ethers.js` untuk komunikasi dengan blockchain.

## Fitur Utama

-   **Antarmuka Mahasiswa (Voter)**: Login menggunakan NIM, halaman untuk menghubungkan dompet Web3 MetaMask (Bind Wallet), klaim Token NFT (dengan *display* *Transaction Hash* instan), dan halaman pemungutan suara on-chain.
-   **Dashboard Administrator**: Antarmuka tabbed multifungsi (Overview, Sessions, Candidates, Allowlist, dan Users) untuk meracik sesi pemilihan dan mendaftarkan pemilih (termasuk fitur *Bulk Upload* via file CSV/XLSX).
-   **Profil Pemilih (`/profile`)**: Halaman khusus pengguna mencakup identitas NIM, status koneksi dompet, indikator verifikasi identitas (NFT), dan *quick actions*.
-   **Real-time Live Count**: Integrasi *Socket.IO Client* untuk langsung menangkap dan menampilkan event pemungutan suara (`vote_update`) dari blockchain tanpa harus me-*refresh*.

## Prasyarat

-   [Node.js](https://nodejs.org/) v18 atau versi lebih baru (v20 disarankan).
-   Browser yang dilengkapi dengan ekstensi **MetaMask**.

## Setup Lingkungan (Environment)

Buatlah file `.env` di dalam folder root `frontend/` (Anda dapat menyalin contoh dari `.env.example` jika tersedia). Nilai kuncinya memuat setidaknya referensi ke *smart contract* dan URL eksternal:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS=<Alamat Kontrak>
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

## Memulai Server

1.  Instal seluruh dependensi:
    ```bash
    npm install
    # atau yarn install / pnpm install
    ```

2.  Jalankan server *development*:
    ```bash
    npm run dev
    # atau yarn dev / pnpm dev
    ```

3.  Buka [http://localhost:3000](http://localhost:3000) dengan peramban Anda. Aplikasi ini dirancang bersifat adaptif *responsive*.

## Struktur Routing

Memanfaatkan *Next.js App Router*, strukturnya adalah sebagai berikut:
-   `/` : Halaman utama (yang telah digabung dengan informasi About).
-   `/login` : Halaman Autentikasi.
-   `/bind-wallet` : Portal verifikasi identitas digital mandiri.
-   `/vote` : Portal aktif Pemungutan Suara untuk sesi yang terbuka.
-   `/results` : Tabulasi hasil (Grafik Recharts).
-   `/history` : Riwayat On-chain yang dipartisi untuk *public RPC limits*.
-   `/profile` : Portal manajemen akun individu.
-   `/admin` : Area khusus penyelenggara (membutuhkan peran Admin JWT).
