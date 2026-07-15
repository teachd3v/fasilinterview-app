export type ScoreDescription = {
  score: 1 | 2 | 3
  description: string
}

export type Indicator = {
  id: string
  title: string
  question: string
  scores: ScoreDescription[]
}

export type Aspect = {
  id: string
  title: string
  weight: number
  isCritical?: boolean
  indicators: Indicator[]
}

export const rubricData: Aspect[] = [
  {
    id: "aspek-1",
    title: "1. Motivasi & Growth Mindset",
    weight: 10,
    indicators: [
      {
        id: "ind-1",
        title: "Motivasi & Kebermanfaatan",
        question: "Apa motivasi Anda mendaftar sebagai fasilitator Etos ID? Manfaat apa yang ingin Anda ciptakan?",
        scores: [
          { score: 1, description: "Motivasi tidak jelas, berubah-ubah, atau murni orientasi pribadi." },
          { score: 2, description: "Cukup jelas, namun orientasi masih bercampur antara pribadi & PM/wilayah." },
          { score: 3, description: "Spesifik, mengaitkan peran dengan dampak nyata bagi PM & wilayah." }
        ]
      },
      {
        id: "ind-2",
        title: "Growth Mindset",
        question: "Ceritakan pengalaman saat Anda gagal/mendapat kritik. Apa yang dilakukan setelahnya?",
        scores: [
          { score: 1, description: "Menghindari/menolak mengakui kegagalan, defensif." },
          { score: 2, description: "Menerima kritik namun refleksi umum tanpa langkah konkret." },
          { score: 3, description: "Refleksi jujur, langkah perbaikan konkret, yakin kemampuan bisa berkembang." }
        ]
      }
    ]
  },
  {
    id: "aspek-2",
    title: "2. Kepemimpinan & Pengelolaan Program",
    weight: 10,
    indicators: [
      {
        id: "ind-3",
        title: "Pengalaman Kepemimpinan",
        question: "Pengalaman organisasi apa yang menuntut kepemimpinan Anda?",
        scores: [
          { score: 1, description: "Hanya anggota biasa, tidak mampu jelaskan peran." },
          { score: 2, description: "Pernah jadi BPH/PIC, strategi penyelesaian masalah masih umum." },
          { score: 3, description: "Peran inti (Ketua/PIC utama), strategi penyelesaian spesifik & terukur." }
        ]
      },
      {
        id: "ind-4",
        title: "Perencanaan Program",
        question: "Rencana rancangan program pembinaan berbasis proyek selama 1 tahun ke depan?",
        scores: [
          { score: 1, description: "Tidak terstruktur, tanpa tahapan/indikator jelas." },
          { score: 2, description: "Tahapan cukup jelas, namun pendekatan masih konvensional (searah)." },
          { score: 3, description: "Terstruktur (tujuan, indikator, waktu) & berbasis proyek nyata." }
        ]
      }
    ]
  },
  {
    id: "aspek-3",
    title: "3. Coaching & Mentoring",
    weight: 15,
    indicators: [
      {
        id: "ind-5",
        title: "Pengalaman Mendampingi",
        question: "Ceritakan pengalaman mendampingi/membina orang lain.",
        scores: [
          { score: 1, description: "Tidak punya pengalaman mendampingi orang lain." },
          { score: 2, description: "Durasi singkat (<1 tahun) atau tidak rutin, hasil umum." },
          { score: 3, description: "Berkelanjutan (>1 tahun) dengan hasil konkret & pendekatan spesifik." }
        ]
      },
      {
        id: "ind-6",
        title: "Pendekatan Coaching",
        question: "Respons jika PM minta berhenti organisasi karena nilai turun?",
        scores: [
          { score: 1, description: "Memberi instruksi sepihak tanpa menggali perspektif PM." },
          { score: 2, description: "Kombinasi nasihat & bertanya, tapi didominasi instruksi fasilitator." },
          { score: 3, description: "Bertanya reflektif, mendorong PM temukan solusi sendiri." }
        ]
      },
      {
        id: "ind-7",
        title: "Student-Centered",
        question: "Bagaimana mengukur keberhasilan pembinaan PM?",
        scores: [
          { score: 1, description: "Hanya dinilai dari kepatuhan administratif/kehadiran." },
          { score: 2, description: "Sebagian aspek perkembangan, tapi penekanan tetap kepatuhan." },
          { score: 3, description: "Holistik (akademik, karakter, masa depan), aturan hanya sarana." }
        ]
      }
    ]
  },
  {
    id: "aspek-4",
    title: "4. Komunikasi & Psychological Safety",
    weight: 10,
    indicators: [
      {
        id: "ind-8",
        title: "Komunikasi Empatik",
        question: "Respons jika PM menangis cerita masalah keluarga?",
        scores: [
          { score: 1, description: "Meremehkan, menghakimi, atau mengalihkan topik." },
          { score: 2, description: "Mendengarkan sebentar lalu buru-buru menasihati." },
          { score: 3, description: "Validasi perasaan, dengar penuh, beri ruang aman bercerita." }
        ]
      },
      {
        id: "ind-9",
        title: "Menciptakan Ruang Aman",
        question: "Cara memastikan PM berani mengakui kesalahan tanpa takut?",
        scores: [
          { score: 1, description: "Tidak paham konsep ruang aman, andalkan ketegasan/hukuman." },
          { score: 2, description: "Paham secara konsep, tapi praktik masih normatif." },
          { score: 3, description: "Beri contoh konkret (tidak menghukum kejujuran, normalkan kesalahan)." }
        ]
      }
    ]
  },
  {
    id: "aspek-5",
    title: "5. Problem Solving & Konflik",
    weight: 10,
    indicators: [
      {
        id: "ind-10",
        title: "Problem Solving",
        question: "Langkah jika data keuangan wilayah tidak sesuai saat pelaporan?",
        scores: [
          { score: 1, description: "Solusi tidak jelas, tidak realistis, menghindar dari tanggung jawab." },
          { score: 2, description: "Cukup jelas tapi kurang sistematis (langsung solusi tanpa cari akar masalah)." },
          { score: 3, description: "Sistematis: cari akar masalah, verifikasi, libatkan pihak terkait, solusi & pencegahan." }
        ]
      },
      {
        id: "ind-11",
        title: "Manajemen Konflik",
        question: "Cara menangani dua PM yang berselisih?",
        scores: [
          { score: 1, description: "Menghindari konflik atau pendekatan otoriter/sepihak." },
          { score: 2, description: "Menengahi tapi kurang terstruktur/berpotensi memihak." },
          { score: 3, description: "Netral: dengar kedua pihak terpisah, fasilitasi dialog solusi bersama." }
        ]
      }
    ]
  },
  {
    id: "aspek-6",
    title: "6. Kolaborasi & Jaringan",
    weight: 5,
    indicators: [
      {
        id: "ind-12",
        title: "Kesiapan Kolaborasi",
        question: "Pihak eksternal mana saja yang perlu dilibatkan dalam pembinaan?",
        scores: [
          { score: 1, description: "Tidak bisa menyebutkan stakeholder atau tidak melihat pentingnya." },
          { score: 2, description: "Bisa menyebutkan tapi langkah kolaborasi masih umum." },
          { score: 3, description: "Menyebutkan multi-pihak dengan alasan spesifik & langkah konkret." }
        ]
      },
      {
        id: "ind-13",
        title: "Jaringan Strategis",
        question: "Relasi yang dimiliki saat ini untuk dukung pembinaan?",
        scores: [
          { score: 1, description: "Tidak memiliki jaringan yang relevan." },
          { score: 2, description: "Ada di tingkat kampus tapi relevansi pembinaan perlu dikembangkan." },
          { score: 3, description: "Punya relasi aktif & strategis (dinas, komunitas, alumni) yang sangat relevan." }
        ]
      }
    ]
  },
  {
    id: "aspek-7",
    title: "7. Literasi Digital & AI",
    weight: 5,
    indicators: [
      {
        id: "ind-14",
        title: "Kemampuan Digital",
        question: "Aplikasi apa yang biasa digunakan untuk manajemen data/kelompok?",
        scores: [
          { score: 1, description: "Tidak terbiasa pakai perangkat digital untuk administrasi." },
          { score: 2, description: "Bisa pakai (spreadsheet/chat) tapi belum sistematis & aman." },
          { score: 3, description: "Sistematis pakai multi-aplikasi & sadar keamanan data." }
        ]
      },
      {
        id: "ind-15",
        title: "Pemanfaatan AI",
        question: "Bagaimana memanfaatkan AI dalam tugas fasilitator?",
        scores: [
          { score: 1, description: "Tidak paham atau sangat bergantung tanpa sadar risiko." },
          { score: 2, description: "Paham AI bisa bantu tugas tapi penjelasan umum & batasan kurang jelas." },
          { score: 3, description: "Pemanfaatan konkret (admin/kreatif), sadar batasan & keamanan data." }
        ]
      }
    ]
  },
  {
    id: "aspek-8",
    title: "8. Karakter & Integritas",
    weight: 8,
    indicators: [
      {
        id: "ind-16",
        title: "Self-Awareness",
        question: "Sebutkan 2 kelebihan & 2 kekurangan, dan cara mengelolanya.",
        scores: [
          { score: 1, description: "Kesulitan menyebutkan, jawaban sangat normatif." },
          { score: 2, description: "Mampu sebutkan tapi cara pengelolaan masih umum." },
          { score: 3, description: "Spesifik sebutkan >2 kelebihan & kekurangan dengan langkah konkret mengelolanya." }
        ]
      },
      {
        id: "ind-17",
        title: "Integritas Etis",
        question: "Sikap jika tahu rekan fasilitator manipulasi laporan keuangan?",
        scores: [
          { score: 1, description: "Memaklumi/menutupi demi menjaga hubungan baik." },
          { score: 2, description: "Tidak mau terlibat tapi cenderung diam/tidak lapor." },
          { score: 3, description: "Melaporkan lewat jalur tepat & menolak tegas ikut menutupi." }
        ]
      }
    ]
  },
  {
    id: "aspek-9",
    title: "9. Wawasan Keislaman",
    weight: 15,
    indicators: [
      {
        id: "ind-18",
        title: "Ibadah Wajib & Sunnah",
        question: "Komitmen ibadah harian (wajib & sunnah).",
        scores: [
          { score: 1, description: "Wajib belum konsisten, sunnah jarang/tidak." },
          { score: 2, description: "Wajib konsisten, sunnah mulai dijalankan." },
          { score: 3, description: "Wajib terjaga di awal waktu, sunnah rutin." }
        ]
      },
      {
        id: "ind-19",
        title: "Interaksi Al-Qur'an",
        question: "Seberapa sering membaca Al-Qur'an?",
        scores: [
          { score: 1, description: "Jarang/tidak rutin." },
          { score: 2, description: "Cukup rutin tapi jumlah terbatas." },
          { score: 3, description: "Rutin setiap hari (>2 lembar) atau hafalan konsisten." }
        ]
      },
      {
        id: "ind-20",
        title: "Moderasi Beragama & Etos ID",
        question: "Pandangan tentang beda mazhab & kaitan nilai Etos ID.",
        scores: [
          { score: 1, description: "Tidak toleran beda mazhab / tidak paham nilai Etos ID." },
          { score: 2, description: "Toleran, tapi kaitan dengan nilai Etos ID normatif." },
          { score: 3, description: "Paham fiqh perbedaan, toleran, dan bisa refleksikan nilai inti Etos ID secara riil." }
        ]
      }
    ]
  },
  {
    id: "aspek-10",
    title: "10. Tes Baca Al-Qur'an",
    weight: 5,
    indicators: [
      {
        id: "ind-21",
        title: "Kelancaran & Tajwid",
        question: "Uji langsung membaca Al-Qur'an.",
        scores: [
          { score: 1, description: "Tidak lancar membaca / tidak perhatikan tajwid." },
          { score: 2, description: "Cukup lancar tapi banyak salah tajwid." },
          { score: 3, description: "Lancar dengan tajwid tepat (minim kesalahan)." }
        ]
      }
    ]
  },
  {
    id: "aspek-11",
    title: "11. Komitmen Kerja & Kontrak",
    weight: 7,
    isCritical: true,
    indicators: [
      {
        id: "ind-22",
        title: "Kesiapan Pola Kerja",
        question: "Siap dengan konsekuensi tugas Team Leader/Adminkeu?",
        scores: [
          { score: 1, description: "Tidak siap/ragu dengan tugas. (RED FLAG)" },
          { score: 2, description: "Kesiapan ada, tapi ragu di beberapa konsekuensi (waktu/admin)." },
          { score: 3, description: "Kesiapan penuh & meyakinkan." }
        ]
      },
      {
        id: "ind-23",
        title: "Kontrak 1 Tahun",
        question: "Siap kontrak selama 1 tahun?",
        scores: [
          { score: 1, description: "Tidak bersedia terikat 1 tahun. (RED FLAG)" },
          { score: 2, description: "Bersedia dengan syarat khusus yang perlu dicek ulang." },
          { score: 3, description: "Kesiapan penuh tanpa syarat selama 1 tahun." }
        ]
      }
    ]
  }
]
