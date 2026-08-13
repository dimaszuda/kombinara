const n = (s) =>
  s
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

console.log(JSON.stringify(n("a) (n+2)(n+1)")));
console.log(JSON.stringify(n("a) (n+2)x(n+1)")));
console.log(JSON.stringify(n("b) (n+1)n")));
console.log(JSON.stringify(n("b) (n+1)xn")));
console.log(JSON.stringify(n("c) C(n,3), bentuk umum")));
console.log(JSON.stringify(n("c) nx(n-1)x(n-2)/3!")));
