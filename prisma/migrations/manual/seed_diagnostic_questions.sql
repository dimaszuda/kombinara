-- Seed master soal Asesmen Diagnostik Kaidah Pencacahan
-- Jalankan sekali setelah tabel diagnostic_questions dibuat
-- Gunakan ON CONFLICT DO NOTHING agar aman dijalankan ulang

INSERT INTO diagnostic_questions (question_number, question_text, grading_mode, expected_answer)
VALUES
  (
    1,
    'Hitunglah hasil perkalian berikut tanpa kalkulator: (a) 6×5×4, (b) (7×6×5)/(3×2×1), (c) (10×9×8×7)/(4×3×2×1)',
    'rule',
    '{"sub": [{"index": 0, "expected": 120}, {"index": 1, "expected": 35}, {"index": 2, "expected": 210}]}'::jsonb
  ),
  (
    2,
    'Sederhanakan pecahan berikut — tidak perlu dihitung sampai habis, cukup coret yang sama: (a) (8×7×6×5×4×3×2×1)/(5×4×3×2×1), (b) (8×7×6×5!)/(5!×3×2×1)',
    'rule',
    '{"sub": [{"index": 0, "expected": 336}, {"index": 1, "expected": 56}]}'::jsonb
  ),
  (
    3,
    'Temukan nilai n (bilangan bulat positif): (a) n×(n-1)=20, (b) n×(n-1)×(n-2)=60',
    'rule',
    '{"sub": [{"index": 0, "expected": 5}, {"index": 1, "expected": 5}]}'::jsonb
  ),
  (
    4,
    'Jika n−r=2 dan n=7, maka nilai r adalah',
    'rule',
    '{"sub": [{"index": 0, "expected": 5}]}'::jsonb
  ),
  (
    5,
    'Diketahui himpunan A = {1,2,3,4,5}. (a) Berapa banyak anggota himpunan A? (b) Sebutkan semua himpunan bagian dari {a,b}',
    'rule',
    '{"sub": [{"index": 0, "expected": 5}, {"index": 1, "expected": "{}, {a}, {b}, {a,b}"}]}'::jsonb
  ),
  (
    6,
    'Apakah {Ari, Budi} dan {Budi, Ari} adalah himpunan yang sama atau berbeda? Berikan alasanmu.',
    'ai',
    NULL
  ),
  (
    7,
    'Lengkapi tabel logika "Atau/Dan": (baris 1) 3 jus atau 2 susu, (baris 2) 3 baju dan 4 celana, (baris 3) 5 rute A→B dan 3 rute B→C',
    'rule',
    '{"sub": [{"index": 0, "expected": 5}, {"index": 1, "expected": 12}, {"index": 2, "expected": 15}, {"index": 3, "expected": "+"}, {"index": 4, "expected": "×"}, {"index": 5, "expected": "×"}]}'::jsonb
  ),
  (
    8,
    'Dari situasi di atas, apa pola yang kamu temukan? Kata "Atau" → operasi ?, Kata "Dan" → operasi ?',
    'rule',
    '{"sub": [{"index": 0, "expected": "penjumlahan"}, {"index": 1, "expected": "perkalian"}]}'::jsonb
  ),
  (
    9,
    'Dari 10 siswa akan dipilih Ketua, Sekretaris, dan Bendahara OSIS. Apakah susunan "Ari=Ketua, Nina=Sekretaris" sama dengan "Nina=Ketua, Ari=Sekretaris"? Mengapa?',
    'ai',
    NULL
  ),
  (
    10,
    'Dari 10 siswa akan dipilih 3 orang sebagai perwakilan lomba cerdas cermat. Apakah "Rani, Dedi, Revan" sama dengan "Dedi, Revan, Rani"? Apa perbedaan mendasar antara soal nomor 9 dan 10?',
    'ai',
    NULL
  )
ON CONFLICT (question_number) DO NOTHING;
