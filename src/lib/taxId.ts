/** T.C. kimlik no: 11 hane, ilk hane 0 değil, 10. ve 11. hane sağlama (sunucudaki kuralla aynı) */
export function isValidTckn(v: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(v)) return false;
  const d = v.split('').map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const d10 = (((odd * 7 - even) % 10) + 10) % 10;
  const d11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return d[9] === d10 && d[10] === d11;
}

/** Vergi kimlik no: 10 hane, GİB sağlama algoritması */
export function isValidVkn(v: string): boolean {
  if (!/^[0-9]{10}$/.test(v)) return false;
  const d = v.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (d[i] + 10 - (i + 1)) % 10;
    sum += tmp === 9 ? 9 : (tmp * 2 ** (10 - (i + 1))) % 9;
  }
  return (10 - (sum % 10)) % 10 === d[9];
}
