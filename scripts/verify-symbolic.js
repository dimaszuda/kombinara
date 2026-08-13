function normalizeAlgebraic(s) {
  return s
    .toLowerCase()
    .replace(/^[a-z][).:]\s*/, "")
    .replace(/[×·*]/g, "*")
    .replace(/x/g, "*")
    .replace(/\s+/g, "")
    .replace(/([a-z0-9])\(/g, "$1*(")
    .replace(/\)([a-z0-9(])/g, ")*$1")
    .replace(/3!/g, "6")
    .replace(/2!/g, "2")
    .replace(/1!/g, "1");
}
function commutativeEq(a, b) {
  if (a.includes("/") || b.includes("/")) return false;
  const sf = (s) => s.split("*").sort().join("*");
  return sf(a) === sf(b);
}
function isC3Equivalent(sn) {
  if (sn === "c*(n,3)" || sn.startsWith("c*(n,3),")) return true;
  const m = sn.match(/^([^/]+)\/6$/);
  if (!m) return false;
  const p = m[1].split("*").sort();
  return p.length === 3 && p[0] === "(n-1)" && p[1] === "(n-2)" && p[2] === "n";
}
function perPartSymbolicMatch(jawaban, gt) {
  const jl = jawaban.split("\n").map((l) => l.trim()).filter(Boolean);
  const gl = gt.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!jl.length || jl.length !== gl.length) return false;
  for (let i = 0; i < gl.length; i++) {
    const jn = normalizeAlgebraic(jl[i]);
    const gn = normalizeAlgebraic(gl[i]);
    if (!jn || !gn) return false;
    if (jn === gn) continue;
    if (commutativeEq(jn, gn)) continue;
    if (/c\*?\(n,3\)/.test(gn) && isC3Equivalent(jn)) continue;
    return false;
  }
  return true;
}
const GT5 = "a) (n+2)(n+1)\nb) (n+1)n\nc) C(n,3), bentuk umum";
console.log("=== Soal 5 ===");
console.log("user #101 (harus true):", perPartSymbolicMatch("a) (n+2)x(n+1)\nb) (n+1)n\nc) nx(n-1)x(n-2)/3!", GT5));
console.log("user #99 c salah (false):", perPartSymbolicMatch("a) (n+2)x(n+1)\nb) (n+1)xn\nc) n(n-3)", GT5));
console.log("user #98 c salah (false):", perPartSymbolicMatch("a) (n+2)×(n+1)\nb) (n+1)×n\nc) 1/(n-3)×3!", GT5));
console.log("c = C(n,3) langsung (true):", perPartSymbolicMatch("a) (n+2)(n+1)\nb) (n+1)n\nc) C(n,3)", GT5));
console.log("c = n(n-1)(n-2)/6 (true):", perPartSymbolicMatch("a) (n+2)(n+1)\nb) (n+1)n\nc) n(n-1)(n-2)/6", GT5));
console.log("a komutatif (n+1)(n+2) (true):", perPartSymbolicMatch("a) (n+1)(n+2)\nb) (n+1)n\nc) C(n,3)", GT5));
console.log("b salah (n+2)n (false):", perPartSymbolicMatch("a) (n+2)(n+1)\nb) (n+2)n\nc) C(n,3)", GT5));
console.log("");
console.log("=== Soal lain tidak terpengaruh (false → via lapis lain) ===");
console.log("Soal 1 angka:", perPartSymbolicMatch("a) 120\nb) 30\nc) 12\nd) 4", "a) 5! = 120\nb) 3!+4! = 6+24 = 30\nc) 3!×2! = 6×2 = 12\nd) 0!+1!+2! = 1+1+2 = 4"));
console.log("Soal 4 mark:", perPartSymbolicMatch("a) ❌ | 0! = 1 bukan 0\nb) ❌ | 20\nc) ✅ | benar\nd) ✅ | benar", "a) Salah — 0! = 1, bukan 0\nb) Salah — 5!/3! = 20, bukan 2! (=2)\nc) Benar — sesuai sifat rekursif n!=n×(n-1)!\nd) Benar — n!/(n-1)! = n"));
