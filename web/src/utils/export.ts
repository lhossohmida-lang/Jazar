import * as XLSX from 'xlsx'

/** تصدير صفوف إلى ملف Excel */
export function exportToExcel(
  rows: Array<Record<string, unknown>>,
  fileName: string,
  sheetName = 'البيانات',
) {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

/**
 * فتح نافذة طباعة منسّقة (RTL) — تدعم العربية بالكامل وتسمح بالحفظ كـ PDF.
 * تُستخدم لتصدير PDF وطباعة الفواتير والتقارير.
 */
export function openPrintWindow(title: string, bodyHtml: string) {
  const w = window.open('', '_blank', 'width=900,height=650')
  if (!w) {
    alert('الرجاء السماح بالنوافذ المنبثقة لتمكين الطباعة/التصدير')
    return
  }
  w.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Cairo', sans-serif; color: #111; margin: 24px; }
  .head { display: flex; align-items: center; justify-content: space-between;
          border-bottom: 3px solid #b01e1e; padding-bottom: 12px; margin-bottom: 18px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand .logo { width: 42px; height: 42px; background: #0d0d0d; border-radius: 10px;
                 color: #fff; display: grid; place-items: center; font-weight: 800; }
  .brand h1 { margin: 0; font-size: 22px; color: #b01e1e; letter-spacing: 1px; }
  .brand small { color: #555; }
  h2 { font-size: 18px; margin: 6px 0 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
  th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: right; }
  th { background: #f4f4f5; }
  tfoot td { font-weight: 700; background: #fafafa; }
  .meta { color: #555; font-size: 13px; margin-bottom: 8px; }
  .total { font-size: 18px; font-weight: 800; color: #b01e1e; margin-top: 14px; }
  .foot { margin-top: 28px; text-align: center; color: #888; font-size: 12px; }
  @media print { .noprint { display: none; } body { margin: 8mm; } }
</style>
</head>
<body>
  <div class="head">
    <div class="brand">
      <div class="logo">🔪</div>
      <div><h1>JEZAR</h1><small>نظام إدارة الجزارة</small></div>
    </div>
    <div class="meta">${new Date().toLocaleString('ar-DZ')}</div>
  </div>
  ${bodyHtml}
  <div class="foot">JEZAR — تم الإنشاء تلقائياً</div>
  <div class="noprint" style="margin-top:20px;text-align:center">
    <button onclick="window.print()" style="background:#b01e1e;color:#fff;border:none;
      padding:10px 24px;border-radius:8px;font-size:15px;cursor:pointer;font-family:inherit">
      🖨️ طباعة / حفظ PDF
    </button>
  </div>
  <script>setTimeout(function(){ try { window.focus() } catch(e){} }, 200)</script>
</body>
</html>`)
  w.document.close()
}

/** بناء جدول HTML من رؤوس وصفوف */
export function htmlTable(
  headers: string[],
  rows: (string | number)[][],
  footer?: (string | number)[],
): string {
  const head = headers.map((h) => `<th>${h}</th>`).join('')
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')
  const foot = footer
    ? `<tfoot><tr>${footer.map((c) => `<td>${c}</td>`).join('')}</tr></tfoot>`
    : ''
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table>`
}
