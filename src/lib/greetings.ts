export interface MemoraQuote {
  text: string;
  author?: string;
  tag: string;
  emoji: string;
}

export const MEMORA_QUOTES: MemoraQuote[] = [
  // A. Active Recall & Retensi Otak
  {
    text: 'Belajar bukan sekadar membaca ulang, tetapi melatih otak untuk menarik kembali informasi saat dibutuhkan.',
    author: 'Metode Active Recall',
    tag: 'Active Recall',
    emoji: '🧠',
  },
  {
    text: 'Apa yang kamu tulis dengan bahasamu sendiri akan menetap 10x lebih lama di dalam memori.',
    author: 'Teknik Richard Feynman',
    tag: 'Feynman Technique',
    emoji: '✨',
  },
  {
    text: 'Pengulangan berjarak (Spaced Repetition) adalah jembatan yang mengubah informasi sementara menjadi kebijaksanaan permanen.',
    author: 'Sains Kognitif',
    tag: 'Spaced Repetition',
    emoji: '⏳',
  },
  {
    text: 'Menguji diri sendiri adalah bentuk belajar yang paling jujur dan paling efektif untuk memperkuat ingatan.',
    author: 'Prinsip Belajar Cerdas',
    tag: 'Self-Testing',
    emoji: '🎯',
  },
  {
    text: 'Informasi yang tidak pernah kamu panggil kembali akan perlahan memudar. Uji pemahamanmu di Kuis Review hari ini!',
    author: 'Hukum Retensi Memori',
    tag: 'Kuis Review',
    emoji: '💡',
  },
  {
    text: 'Otak bukan wadah pasif yang hanya diisi, melainkan otot yang menguat setiap kali dipaksa berpikir.',
    author: 'Neuroscience',
    tag: 'Brain Muscle',
    emoji: '💪',
  },
  {
    text: 'Pemahaman sejati dimulai ketika kamu mampu menjelaskan konsep rumit menjadi kalimat yang sederhana dan mudah dipahami.',
    author: 'Filosofi Pemahaman',
    tag: 'Simplicity',
    emoji: '🧩',
  },

  // B. Konsistensi, Pertumbuhan Bertahap, & Tunas Ilmu
  {
    text: 'Setiap hal kecil yang kamu pelajari hari ini membuatmu 1% lebih bijak dari kemarin. Terus bertumbuh ya!',
    author: 'James Clear (Atomic Habits)',
    tag: 'Atomic Growth',
    emoji: '🌱',
  },
  {
    text: 'Pohon ilmu yang rindang selalu berawal dari satu tunas kecil yang disiram dan dirawat setiap hari.',
    author: 'Filosofi Tunas Memora',
    tag: 'Pertumbuhan',
    emoji: '🌿',
  },
  {
    text: 'Konsistensi 15 menit setiap hari jauh lebih bernilai daripada belajar maraton 5 jam sekali sebulan.',
    author: 'Kekuatan Konsistensi',
    tag: 'Habit Belajar',
    emoji: '🔥',
  },
  {
    text: 'Jangan meremehkan langkah kecil. Butiran pemahaman yang dikumpulkan setiap hari akan menjadi samudera wawasan.',
    author: 'Mindset Pembelajar',
    tag: 'Langkah Kecil',
    emoji: '🌊',
  },
  {
    text: 'Kamu tidak harus hebat untuk memulai, tetapi kamu harus mulai mencatat untuk menjadi hebat.',
    author: 'Semangat Belajar',
    tag: 'Mulai Sekarang',
    emoji: '🚀',
  },
  {
    text: 'Hari di mana kamu belajar satu hal baru adalah hari yang penuh kemenangan.',
    author: 'Refleksi Harian',
    tag: 'Kemenangan Kecil',
    emoji: '🏆',
  },
  {
    text: 'Investasi terbaik yang memberikan dividen paling tinggi sepanjang hayat adalah investasi pada ilmumu.',
    author: 'Benjamin Franklin',
    tag: 'Investasi Ilmu',
    emoji: '💎',
  },

  // C. Filosofi Ikan Remora & Simbiosis Belajar
  {
    text: 'Seperti ikan Remora yang menempel pada raksasa samudera, tempelkan dirimu pada ide-ide hebat agar ikut melaju jauh.',
    author: 'Filosofi Memora',
    tag: 'Simbiosis Ide',
    emoji: '🐟',
  },
  {
    text: 'Di lautan ilmu yang tak bertepi, jadilah pembelajar yang adaptif, lincah, dan terus berenang maju.',
    author: 'Semangat Samudera',
    tag: 'Adaptabilitas',
    emoji: '🌊',
  },
  {
    text: 'Simbiosis pengetahuan: Ketika kamu belajar dan berbagi catatan, pemahaman bersama akan berlipat ganda.',
    author: 'Kolaborasi Belajar',
    tag: 'Berbagi Ilmu',
    emoji: '🤝',
  },
  {
    text: 'Berenanglah melampaui zona nyaman; otot pikiran hanya terlatih saat kita berani mencoba hal baru.',
    author: 'Eksplorasi',
    tag: 'Eksplorasi Baru',
    emoji: '🗺️',
  },

  // D. Jurnal Belajar & Refleksi Pikiran
  {
    text: 'Menulis jurnal belajar adalah cara terbaik untuk melihat bagaimana caramu berpikir, memproses masalah, dan berkembang.',
    author: 'Metode Journaling',
    tag: 'Journaling',
    emoji: '📝',
  },
  {
    text: 'Pikiran manusia diciptakan untuk menghasilkan ide-ide cemerlang, bukan untuk menyimpannya sendirian. Abadikan di Memora!',
    author: 'David Allen',
    tag: 'Second Brain',
    emoji: '⚡',
  },
  {
    text: 'Catatan harianmu hari ini adalah kompas pemandu yang berharga bagi kesuksesanmu di masa depan.',
    author: 'Refleksi Diri',
    tag: 'Kompas Masa Depan',
    emoji: '🧭',
  },
  {
    text: 'Membaca mengisi pikiran dengan bahan pengetahuan; menuliskannya yang menjadikannya milik kita seutuhnya.',
    author: 'John Locke',
    tag: 'Internalisasi',
    emoji: '📚',
  },
  {
    text: 'Catat apa yang kamu pelajari, terapkan apa yang kamu catat, dan bagikan apa yang kamu pahami.',
    author: 'Siklus Pembelajar',
    tag: 'Siklus Ilmu',
    emoji: '🔄',
  },
  {
    text: 'Di era banjir informasi, kemampuan merangkum poin penting adalah kekuatan super yang paling berharga.',
    author: 'Literasi Kritis',
    tag: 'Superpower',
    emoji: '⭐',
  },
];

/**
 * Returns a time-appropriate, friendly greeting string tailored to the user
 */
export function getTimeBasedGreeting(userName: string, currentStreak: number = 0): {
  greeting: string;
  iconEmoji: string;
  timePeriod: 'pagi' | 'siang' | 'sore' | 'malam' | 'dini_hari';
} {
  const hour = new Date().getHours();
  const displayName = userName ? userName.split(' ')[0] : 'Sahabat Pembelajar';

  // 1. Dini Hari (00:00 - 04:59)
  if (hour >= 0 && hour < 5) {
    const nightOwlGreetings = [
      `🌌 Masih Terjaga, ${displayName}? Semangat Menimba Ilmu!`,
      `🦉 Selamat Dini Hari, ${displayName}! Belajar di Saat Dunia Terlelap.`,
      `🕯️ Keheningan Malam Menghasilkan Pemikiran Terdalam, ${displayName}.`,
      `🐟 Berenang di Samudera Ilmu Tengah Malam, ${displayName}!`,
    ];
    return {
      greeting: nightOwlGreetings[Math.floor(Math.random() * nightOwlGreetings.length)],
      iconEmoji: '🦉',
      timePeriod: 'dini_hari',
    };
  }

  // 2. Pagi Hari (05:00 - 10:59)
  if (hour >= 5 && hour < 11) {
    const morningGreetings = [
      `✨ Semangat Pagi, ${displayName}!`,
      `🌅 Selamat Pagi, Pembelajar Tangguh!`,
      `🌱 Pagi yang Segar untuk Tumbuh, ${displayName}!`,
      `☀️ Awali Harimu dengan Rasa Ingin Tahu, ${displayName}!`,
      `🧠 Pagi, ${displayName}! Otakmu siap menyerap ilmu baru hari ini.`,
      `☕ Selamat Pagi! Secangkir semangat dan catatan bermakna.`,
      `🌿 Fajar Baru, Wawasan Baru, ${displayName}!`,
    ];
    return {
      greeting: morningGreetings[Math.floor(Math.random() * morningGreetings.length)],
      iconEmoji: '🌅',
      timePeriod: 'pagi',
    };
  }

  // 3. Siang Hari (11:00 - 14:59)
  if (hour >= 11 && hour < 15) {
    const afternoonGreetings = [
      `⚡ Semangat Siang, ${displayName}!`,
      `🔥 Siang yang Produktif, ${displayName}!`,
      `🍱 Rehat Sejenak & Catat Pelajaran Siang Ini!`,
      `🎯 Tetap Fokus dan Jaga Momentum Belajarmu, ${displayName}!`,
      `☀️ Siang Cerah, Semangat Baru Menanti!`,
      `💡 Luangkan 10 Menit Siang Ini untuk Review Materi, ${displayName}!`,
      `🌊 Tetap Mengalir Tenang dalam Arus Belajar, ${displayName}!`,
    ];
    return {
      greeting: afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)],
      iconEmoji: '☀️',
      timePeriod: 'siang',
    };
  }

  // 4. Sore Hari (15:00 - 18:29)
  if (hour >= 15 && hour < 18.5) {
    const eveningGreetings = [
      `🌇 Semangat Sore, ${displayName}!`,
      `🍂 Selamat Sore! Waktunya Merangkum Apa yang Dipelajari.`,
      `🧠 Sore yang Tenang untuk Active Recall, ${displayName}!`,
      `✨ Review Sore: Perkuat Ingatan Sebelum Beristirahat!`,
      `🌱 Lihat Seberapa Banyak Tunas Ilmumu Tumbuh Hari Ini, ${displayName}!`,
      `☕ Nikmati Senja Bersama Catatan Berhargamu, ${displayName}!`,
      `📝 Sore Hari: Momen Terbaik Menyusun Benang Merah Pelajaran.`,
    ];
    return {
      greeting: eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)],
      iconEmoji: '🌇',
      timePeriod: 'sore',
    };
  }

  // 5. Malam Hari (18:30 - 23:59)
  const nightGreetings = [
    `🌙 Selamat Malam, ${displayName}!`,
    `🌌 Malam yang Damai untuk Refleksi & Journaling, ${displayName}.`,
    `🧠 Rekam Pelajaran Terbaik Hari Ini Sebelum Tidur!`,
    `✨ Istirahatkan Raga, Abadikan Ilmu di Memora, ${displayName}!`,
    `🌱 Setiap Catatan Malam adalah Bibit Keberhasilan Esok Hari.`,
    `🏆 Kamu Luar Biasa Hari Ini, Mari Kunci Pemahamanmu, ${displayName}!`,
    `💡 Tutup Harimu dengan Satu Catatan Berharga, ${displayName}!`,
  ];
  return {
    greeting: nightGreetings[Math.floor(Math.random() * nightGreetings.length)],
    iconEmoji: '🌙',
    timePeriod: 'malam',
  };
}

/**
 * Returns a random quote from the curated collection
 */
export function getRandomMemoraQuote(excludeText?: string): MemoraQuote {
  const pool = excludeText ? MEMORA_QUOTES.filter((q) => q.text !== excludeText) : MEMORA_QUOTES;
  return pool[Math.floor(Math.random() * pool.length)] || MEMORA_QUOTES[0];
}
