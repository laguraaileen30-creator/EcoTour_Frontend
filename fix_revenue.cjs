const fs = require('fs');
let src = fs.readFileSync('src/pages/Admin/tabs/RevenuePaymentsTab.jsx', 'utf8');

// Replace the entire bad chunk from "sectionBdr      {/*" through the next line (the opening div)
// using a regex so line-ending variations don't matter
src = src.replace(
  /    sectionBdr\s+\{\/\*.*?HEADER.*?\*\/\}\r?\n\s+<div className=\{`p5 rounded-3xl[^`]*`\}>/,
  '' // will replace below
);

// Use simpler indexOf approach
const badStart = '    sectionBdr      {/* \u2500\u2500 HEADER';
const idx = src.indexOf(badStart);
if (idx === -1) { console.log('not found'); process.exit(1); }

// Find end of this corrupted section — it ends just before the next \n      <div className=
const nextLine = src.indexOf('\n', idx);
const lineContent = src.slice(idx, nextLine + 1); // the whole corrupted line including \r\n

console.log('Found corrupted line:', JSON.stringify(lineContent));

const replacement = `    sectionBdr: isDark ? 'border-emerald-800/40' : 'border-emerald-100',\r\n    sectionHd:  isDark ? 'text-emerald-300' : 'text-emerald-800',\r\n    breakCard:  isDark ? 'bg-[#0a2216] border-emerald-500/20' : 'bg-emerald-50 border-emerald-200',\r\n    breakLbl:   isDark ? 'text-slate-400' : 'text-gray-500',\r\n    breakVal:   isDark ? 'text-emerald-300' : 'text-emerald-700',\r\n    shareSlider:'accent-emerald-400',\r\n    saveCfg:    'px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all',\r\n    noData:     isDark ? 'text-slate-400' : 'text-gray-400',\r\n  };\r\n\r\n  return (\r\n    <div className={\`space-y-6 max-w-[1600px] mx-auto p-2 sm:p-4 \${isDark ? 'text-white' : 'text-gray-900'}\`}>\r\n\r\n      {/* \u2500\u2500 HEADER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}\r\n`;

src = src.slice(0, idx) + replacement + src.slice(nextLine + 1);

// Fix remaining hardcoded colors in receipts table section
src = src
  .replace(
    /"flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-emerald-800\/40 pb-3"/g,
    '{`flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 ${C.sectionBdr}`}'
  )
  .replace(
    /"font-bold text-emerald-300 text-sm flex items-center gap-2"/g,
    '{`font-bold text-sm flex items-center gap-2 ${C.sectionHd}`}'
  )
  .replace(
    /"text-xs text-slate-400">\r\n\s+Complete chronological ledger/g,
    (m) => m.replace('"text-xs text-slate-400">', '{`text-xs ${C.subtext}`}>')
  )
  .replace(
    /className="pl-8 pr-3 py-1\.5 rounded-xl bg-\[#04150e\] border border-emerald-900\/60 text-xs text-emerald-100 placeholder:text-emerald-500\/40 outline-none w-48"/g,
    'className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none w-48 ${C.searchInput}`}'
  )
  .replace(
    /className="px-3 py-1\.5 rounded-xl bg-\[#04150e\] border border-emerald-900\/60 text-xs text-emerald-300 outline-none cursor-pointer"/g,
    'className={`px-3 py-1.5 rounded-xl border text-xs outline-none cursor-pointer ${C.methodSel}`}'
  );

fs.writeFileSync('src/pages/Admin/tabs/RevenuePaymentsTab.jsx', src, 'utf8');
console.log('DONE');
