/* ════════════════════════════════════════════════════
   SINHALA GURU — EXAM RESULTS PORTAL
   script.js  ·  All Logic

   ⚙️  CONFIGURATION — edit these before deploying
   ════════════════════════════════════════════════════ */

const CONFIG = {
  API_URL:           "https://script.google.com/macros/s/AKfycbxfsURpAEBhbg2SfTfaQXA4M8nBKhYi0S46cp-vbxMhdSB6nFzBnqasQIfS8CU9foHz/exec",
  WHATSAPP_NUMBER:   "94767660101",           // Sri Lanka: 94 + number (no leading 0)
  WHATSAPP_MESSAGE:  "Hello Sir, I have a question about my Sinhala exam results.",
  TUTOR_NAME:        "Sinhala Guru"
};

/* ════════════════════════════════════════════════════
   MOTIVATIONAL QUOTES  (bilingual — English + Sinhala)
   ════════════════════════════════════════════════════ */
const QUOTES = {
  A: [
    { en: "You have mastered the language of our ancestors — excellence flows in your work.",
      si: "ශ්‍රේෂ්ඨත්වය ඔබේ ස්වභාවයයි." },
    { en: "Distinction is not luck — it is the reward of your dedication and hard work.",
      si: "ඔබේ වෑයමේ ඵලය ලබා ගත්තා — ජය ඔබේ!" },
    { en: "A marks in Sinhala — you honour both the language and yourself.",
      si: "භාෂාවට ගෞරවයක් ලබා දෙමින් ජය ගත්තා!" }
  ],
  B: [
    { en: "A Merit in Sinhala — you are so close to the peak. Keep climbing!",
      si: "ජය ළඟ ය, නොනවතා ඉදිරියට!" },
    { en: "Strong performance. With a little more focus, you will reach Distinction.",
      si: "ශ්‍රේෂ්ඨත්වය ඔබ ළඟ ය — හොඳ වෑයමක්!" },
    { en: "Credit to your effort — Merit is a wonderful achievement. Aim higher!",
      si: "ඔබ ශක්තිමත් ය, තව ටිකක් ළඟ ය!" }
  ],
  C: [
    { en: "A Credit means you have the foundation. Build upon it with practice and persistence.",
      si: "අත නොහරින්න — ඉදිරිය ඔබ සඳහා!" },
    { en: "Every great scholar once stood where you stand. Keep writing, keep growing.",
      si: "දිගින් දිගට ලියන්න, ඉදිරියේ ජය ය!" },
    { en: "You have passed — now push yourself to the next level. Sri Lanka is proud of you.",
      si: "ශ්‍රී ලංකාව ඔබ ගැන අදිහිතයි!" }
  ],
  S: [
    { en: "A Simple Pass is a pass — and every journey begins with the first step.",
      si: "ගමන ඇරඹී ඇත — නොනවතා ඉදිරිය!" },
    { en: "You crossed the line. Now draw a new, higher line for yourself.",
      si: "ජය ලැබුවා — ඊළඟ ඉලක්කය ඉදිරියේ!" },
    { en: "Sinhala is the heartbeat of our nation. Keep studying, keep growing.",
      si: "සිංහල දිගින් දිගට ඉගෙනගනිමු!" }
  ],
  F: [
    { en: "A setback is not the end — it is the beginning of a stronger comeback.",
      si: "නැගිට, නැවත ලිව! ජය ළඟ ය!" },
    { en: "The greatest teachers of our nation once failed too. Rise, and try again.",
      si: "ජය සදා ඔබ ළඟ ය — නොනැවතෙව!" },
    { en: "Every mark is a lesson, not a verdict. Learn from it, and return stronger.",
      si: "නොනවතා ඉදිරියට! ඔබට හැකිය!" }
  ]
};

/* ════════════════════════════════════════════════════
   STATE
   ════════════════════════════════════════════════════ */
let searchType    = "index";
let currentData   = null;

/* ════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════ */
document.getElementById("footerYear").textContent = new Date().getFullYear();

// WhatsApp FAB always visible
document.getElementById("waFloat").href = buildWaLink();

// Tab buttons
document.querySelectorAll(".stab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".stab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    searchType = btn.dataset.type;

    const cfg = {
      index: { ph: "Enter Index Number…",   hint: "e.g. 2024/001" },
      name:  { ph: "Enter Full Name…",       hint: "e.g. Kamal Perera" }
    };
    const el = document.getElementById("searchInput");
    el.placeholder = cfg[searchType].ph;
    document.getElementById("searchHint").textContent = cfg[searchType].hint;
    el.value = "";
    el.focus();
    toggleClear();
    hideResults();
  });
});

// Enter key
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") doSearch();
});
document.getElementById("searchInput").addEventListener("input", toggleClear);

/* ════════════════════════════════════════════════════
   SEARCH
   ════════════════════════════════════════════════════ */
async function doSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) {
    shake(document.getElementById("searchInput"));
    return;
  }
  hideResults();
  show("loaderWrap");

  try {
    const url = `${CONFIG.API_URL}?type=${encodeURIComponent(searchType)}&query=${encodeURIComponent(query)}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    hide("loaderWrap");

    if (data.error) { showError(data.error); return; }

    currentData = data;
    renderResult(data);

    // Populate upcoming exam if available
    if (data.nextExam && data.nextExam.name) {
      setText("ubExamName", data.nextExam.name);
      setText("ubExamDate", data.nextExam.date || "");
      show("upcomingBanner");
    }

  } catch (err) {
    hide("loaderWrap");
    console.error(err);
    showError("Could not connect to the server. Please check your internet connection and try again.");
  }
}

/* ════════════════════════════════════════════════════
   RENDER RESULT
   ════════════════════════════════════════════════════ */
function renderResult(d) {
  const cur = d.current || {};
  const grade = (cur.grade || "").toUpperCase();

  // Student hero
  setText("rName",     d.name     || "—");
  setText("rIndex",    d.index    || "—");
  setText("rOlYear",   d.olYear   || "—");
  setText("rExam",     cur.exam   || "—");
  setText("rExamDate", cur.examDate ? formatDate(cur.examDate) : "—");

  // Grade badge
  const gradeBadge = document.getElementById("gradeBadge");
  gradeBadge.textContent = grade || "—";
  gradeBadge.className   = "grade-badge " + (grade ? "g-" + grade : "");

  const gradeLabels = { A:"Distinction", B:"Merit", C:"Credit", S:"Simple Pass", F:"Fail", "":"—" };
  setText("gradeName", gradeLabels[grade] || grade);

  // Scores
  setText("rPart1", cur.part1  ?? "—");
  setText("rPart2", cur.part2  ?? "—");
  setText("rPart3", cur.part3  ?? "—");
  setText("rTotal", cur.total  ?? "—");

  // Add grade color class to perf section
  const perfSection = document.querySelector(".perf-section");
  perfSection.className = "perf-section " + (grade ? "ga-" + grade : "");

  // Comparison bar
  const myMark   = Number(cur.total       || 0);
  const highest  = Number(cur.classHighest || 0);
  const gap      = highest > myMark ? highest - myMark : 0;
  const pct      = highest > 0 ? Math.min(100, (myMark / highest) * 100) : 0;

  setText("cbMine",  myMark);
  setText("cbHigh",  highest || "—");
  setText("cbGap",   gap > 0 ? "−" + gap : "0");
  setText("rRank",   cur.rank ? "#" + cur.rank : "—");
  setText("rTotalStudents", cur.totalStudents ? "of " + cur.totalStudents + " students" : "");

  // Animate bar after short delay
  setTimeout(() => {
    document.getElementById("cbarFill").style.width   = pct + "%";
    document.getElementById("cbarMarker").style.left  = "100%";
  }, 300);

  // Review
  setText("rReview", cur.review || "No review provided.");

  // Motivational quote
  const pool  = QUOTES[grade] || QUOTES["F"];
  const pick  = pool[Math.floor(Math.random() * pool.length)];
  setText("quoteEn", pick.en);
  setText("quoteSi", pick.si);

  // Progress chart + history
  const history = d.history || [];
  const allExams = [...history, { ...cur, isCurrent: true }];

  if (allExams.length > 0) {
    show("chartSection");
    drawProgressChart(allExams);
  }

  if (history.length > 0) {
    show("historySection");
    renderHistory(history);
  }

  show("resultSection");
  document.getElementById("resultSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ════════════════════════════════════════════════════
   PROGRESS CHART  (SVG)
   ════════════════════════════════════════════════════ */
function drawProgressChart(exams) {
  const container = document.getElementById("progressChart");
  container.innerHTML = "";

  const GRADE_COLORS = { A:"#15803D", B:"#2563EB", C:"#0891B2", S:"#D97706", F:"#DC2626" };
  const W   = 640, H = 210;
  const pad = { t: 36, r: 60, b: 56, l: 44 };
  const cW  = W - pad.l - pad.r;
  const cH  = H - pad.t - pad.b;
  const n   = exams.length;

  const totals    = exams.map(e => Number(e.total || 0));
  const highests  = exams.map(e => Number(e.classHighest || 0));
  const maxVal    = Math.max(...totals, ...highests, 10);
  const yMax      = Math.ceil(maxVal / 25) * 25 + 15;

  const toX = i  => pad.l + (n === 1 ? cW / 2 : (i / (n - 1)) * cW);
  const toY = v  => pad.t + cH - (v / yMax) * cH;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;overflow:visible">`;

  // Grid lines
  for (let tick = 0; tick <= yMax; tick += 25) {
    const y = toY(tick);
    svg += `<line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}" stroke="#E2D4B8" stroke-width="1"/>`;
    svg += `<text x="${pad.l - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#8B6040" font-family="Georgia,serif">${tick}</text>`;
  }

  // Class highest reference line (use last exam's highest)
  const refHighest = Number(exams[exams.length - 1]?.classHighest || 0);
  if (refHighest > 0) {
    const refY = toY(refHighest);
    svg += `<line x1="${pad.l}" y1="${refY}" x2="${W - pad.r}" y2="${refY}"
              stroke="#BF8814" stroke-width="1.5" stroke-dasharray="7,4" opacity=".65"/>`;
    svg += `<text x="${W - pad.r + 5}" y="${refY + 4}" font-size="10" fill="#BF8814" font-family="Georgia,serif" opacity=".85">Highest</text>`;
  }

  // Student's line path
  if (n > 1) {
    let d = `M ${toX(0)} ${toY(totals[0])}`;
    for (let i = 1; i < n; i++) d += ` L ${toX(i)} ${toY(totals[i])}`;
    svg += `<path d="${d}" fill="none" stroke="#611220" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="prog-line"/>`;
  }

  // Points + labels
  exams.forEach((exam, i) => {
    const x    = toX(i);
    const y    = toY(totals[i]);
    const g    = (exam.grade || "F").toUpperCase();
    const col  = GRADE_COLORS[g] || "#611220";
    const isCur = exam.isCurrent;

    // Glow ring for current
    if (isCur) svg += `<circle cx="${x}" cy="${y}" r="22" fill="${col}" opacity=".12"/>`;

    svg += `<circle cx="${x}" cy="${y}" r="${isCur ? 14 : 11}" fill="${col}" stroke="white" stroke-width="2"/>`;
    svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="${isCur ? 10 : 9}" font-weight="bold" fill="white" font-family="Georgia,serif">${g}</text>`;

    // Score above dot
    svg += `<text x="${x}" y="${y - (isCur ? 22 : 18)}" text-anchor="middle" font-size="11" font-weight="bold" fill="#2C1810" font-family="Georgia,serif">${totals[i]}</text>`;

    // Exam name below axis (rotated)
    const name = (exam.exam || "").length > 14 ? exam.exam.substring(0, 14) + "…" : (exam.exam || "Exam");
    svg += `<text x="${x}" y="${H - pad.b + 18}" text-anchor="end" font-size="10" fill="#523420"
              font-family="Georgia,serif" transform="rotate(-35 ${x} ${H - pad.b + 18})">${name}</text>`;
  });

  svg += "</svg>";
  container.innerHTML = svg;
}

/* ════════════════════════════════════════════════════
   HISTORY LIST
   ════════════════════════════════════════════════════ */
function renderHistory(history) {
  const GRADE_COLORS = { A:"#15803D", B:"#2563EB", C:"#0891B2", S:"#D97706", F:"#DC2626" };
  const gradeNames   = { A:"Distinction", B:"Merit", C:"Credit", S:"Simple Pass", F:"Fail" };

  const list = document.getElementById("historyList");
  list.innerHTML = "";

  // Sort newest first for display
  const sorted = [...history].reverse();

  sorted.forEach((exam, idx) => {
    const g   = (exam.grade || "F").toUpperCase();
    const col = GRADE_COLORS[g] || "#611220";
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      <div class="hist-header" onclick="toggleHist(this)">
        <span class="hist-exam-name">${exam.exam || "Exam"}</span>
        <div class="hist-right">
          <span class="hist-total">${exam.total ?? "—"}</span>
          <div class="hist-grade-badge" style="background:${col}">${g}</div>
          <span class="hist-toggle">▼</span>
        </div>
      </div>
      <div class="hist-body">
        <div class="hist-scores">
          <div class="hs-item"><div class="hs-label">Part I</div><div class="hs-val">${exam.part1 ?? "—"}</div></div>
          <div class="hs-item"><div class="hs-label">Part II</div><div class="hs-val">${exam.part2 ?? "—"}</div></div>
          <div class="hs-item"><div class="hs-label">Part III</div><div class="hs-val">${exam.part3 ?? "—"}</div></div>
          <div class="hs-item"><div class="hs-label">Total</div><div class="hs-val">${exam.total ?? "—"}</div></div>
          <div class="hs-item"><div class="hs-label">Grade</div><div class="hs-val" style="color:${col}">${gradeNames[g] || g}</div></div>
        </div>
        ${exam.review ? `<div class="hist-date" style="margin-top:10px;font-style:italic">"${exam.review}"</div>` : ""}
        ${exam.examDate ? `<div class="hist-date">Date: ${formatDate(exam.examDate)}</div>` : ""}
      </div>`;
    list.appendChild(div);
  });
}

function toggleHist(header) {
  const item = header.parentElement;
  item.classList.toggle("open");
}

/* ════════════════════════════════════════════════════
   PDF DOWNLOAD  — iOS/Android/Desktop safe
   Uses in-page print with @media print CSS
   ════════════════════════════════════════════════════ */
function downloadResult() {
  if (!currentData) return;
  const d   = currentData;
  const cur = d.current || {};
  const g   = (cur.grade || "").toUpperCase();

  const GRADE_COLORS = { A:"#15803D", B:"#2563EB", C:"#0891B2", S:"#D97706", F:"#DC2626" };
  const gradeNames   = { A:"Distinction", B:"Merit", C:"Credit", S:"Simple Pass", F:"Fail" };
  const col          = GRADE_COLORS[g] || "#611220";

  const printHTML = `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,serif; color:#1E0D07; background:white; }
  .p-wrap { max-width:680px; margin:0 auto; padding:36px 40px; }
  .p-topbar { height:5px; background:linear-gradient(90deg,#611220,#BF8814,#611220); margin-bottom:30px; }
  .p-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; padding-bottom:20px; border-bottom:1.5px solid #EFE5CB; }
  .p-school { font-size:2rem; font-weight:900; color:#430D18; line-height:1.1; }
  .p-school-si { font-size:.9rem; color:#8B6040; font-style:italic; margin-top:2px; }
  .p-tag { display:inline-block; background:#611220; color:#F0D580; padding:4px 14px; border-radius:20px; font-size:.75rem; letter-spacing:.1em; text-transform:uppercase; margin-top:8px; }
  .p-right { text-align:right; }
  .p-cert-title { font-size:1rem; color:#611220; letter-spacing:.08em; text-transform:uppercase; }
  .p-cert-date { font-size:.82rem; color:#8B6040; margin-top:4px; }
  .p-info { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:22px; background:#FBF4E4; padding:18px; border-radius:10px; border:1px solid #EFE5CB; }
  .pi { }
  .pi label { display:block; font-size:.68rem; text-transform:uppercase; letter-spacing:.12em; color:#8B6040; margin-bottom:3px; }
  .pi span { font-size:1rem; font-weight:600; }
  .p-scores { display:grid; grid-template-columns:repeat(4,1fr); border:1.5px solid #EFE5CB; border-radius:10px; overflow:hidden; margin-bottom:20px; }
  .ps { padding:18px 12px; text-align:center; border-right:1px solid #EFE5CB; }
  .ps:last-child { border-right:none; background:linear-gradient(135deg,rgba(97,18,32,.06),rgba(191,136,20,.08)); }
  .ps label { display:block; font-size:.65rem; text-transform:uppercase; letter-spacing:.12em; color:#8B6040; margin-bottom:8px; }
  .ps .val { font-size:1.8rem; font-weight:700; color:#611220; }
  .p-grade { display:flex; align-items:center; gap:16px; margin-bottom:20px; background:${col}1A; border:1px solid ${col}40; border-radius:10px; padding:16px 20px; }
  .p-grade-badge { width:56px; height:56px; border-radius:50%; background:${col}; display:flex; align-items:center; justify-content:center; font-size:1.6rem; font-weight:900; color:white; flex-shrink:0; }
  .p-grade-info label { font-size:.7rem; text-transform:uppercase; letter-spacing:.12em; color:${col}; }
  .p-grade-info span { display:block; font-size:1.2rem; font-weight:700; color:${col}; }
  .p-review { background:linear-gradient(135deg,rgba(22,81,78,.07),rgba(22,81,78,.03)); border:1px solid #C8E8E8; border-radius:10px; padding:14px 18px; margin-bottom:24px; }
  .p-review label { font-size:.68rem; text-transform:uppercase; letter-spacing:.12em; color:#16514E; margin-bottom:6px; display:block; }
  .p-review p { font-style:italic; font-size:1rem; }
  .p-footer { text-align:center; border-top:1px solid #EFE5CB; padding-top:14px; margin-top:14px; }
  .p-footer p { font-size:.78rem; color:#8B6040; font-style:italic; }
  .p-footer .sig { font-size:.92rem; color:#611220; margin-top:4px; }
  @media print { @page { margin:15mm; } }
</style>
<div class="p-wrap">
  <div class="p-topbar"></div>
  <div class="p-header">
    <div>
      <div class="p-school">Sinhala Guru</div>
      <div class="p-school-si">සිංහල ගුරු · Examination Result</div>
      <div class="p-tag">${CONFIG.TUTOR_NAME}</div>
    </div>
    <div class="p-right">
      <div class="p-cert-title">Official Result</div>
      <div class="p-cert-date">Issued: ${new Date().toLocaleDateString("en-LK",{year:"numeric",month:"long",day:"numeric"})}</div>
    </div>
  </div>
  <div class="p-info">
    <div class="pi"><label>Student Name</label><span>${d.name || "—"}</span></div>
    <div class="pi"><label>Examination</label><span>${cur.exam || "—"}</span></div>
    <div class="pi"><label>Index Number</label><span>${d.index || "—"}</span></div>
    <div class="pi"><label>O/L Year</label><span>${d.olYear || "—"}</span></div>
    <div class="pi"><label>Exam Date</label><span>${cur.examDate ? formatDate(cur.examDate) : "—"}</span></div>
    <div class="pi"><label>Class Rank</label><span>${cur.rank ? "#" + cur.rank + " of " + (cur.totalStudents || "—") : "—"}</span></div>
  </div>
  <div class="p-scores">
    <div class="ps"><label>Part I</label><div class="val">${cur.part1 ?? "—"}</div></div>
    <div class="ps"><label>Part II</label><div class="val">${cur.part2 ?? "—"}</div></div>
    <div class="ps"><label>Part III</label><div class="val">${cur.part3 ?? "—"}</div></div>
    <div class="ps"><label>Total</label><div class="val">${cur.total ?? "—"}</div></div>
  </div>
  <div class="p-grade">
    <div class="p-grade-badge">${g}</div>
    <div class="p-grade-info">
      <label>Grade</label>
      <span>${gradeNames[g] || g}</span>
    </div>
  </div>
  ${cur.review ? `<div class="p-review"><label>Instructor's Review</label><p>${cur.review}</p></div>` : ""}
  <div class="p-footer">
    <p>This is an official result document issued by Sinhala Guru.</p>
    <div class="sig">${CONFIG.TUTOR_NAME} — Sinhala Instructor &nbsp;·&nbsp; Strictly Confidential</div>
  </div>
</div>`;

  // Inject into print area
  const pa = document.getElementById("printArea");
  pa.innerHTML = printHTML;

  // Trigger in-page print (works on iOS Safari, Android Chrome, Desktop)
  window.print();

  // Clean up after dialog closes
  setTimeout(() => { pa.innerHTML = ""; }, 3000);
}

/* ════════════════════════════════════════════════════
   WHATSAPP
   ════════════════════════════════════════════════════ */
function openWhatsApp() {
  window.open(buildWaLink(), "_blank", "noopener");
}

function buildWaLink() {
  const msg = encodeURIComponent(CONFIG.WHATSAPP_MESSAGE);
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`;
}

/* ════════════════════════════════════════════════════
   UI HELPERS
   ════════════════════════════════════════════════════ */
function show(id) { const el = document.getElementById(id); if (el) el.style.display = "block"; }
function hide(id) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

function hideResults() {
  hide("resultSection"); hide("errorCard"); hide("loaderWrap");
  hide("chartSection");  hide("historySection");
  currentData = null;
}

function showError(msg) {
  document.getElementById("errorMsg").textContent = msg;
  show("errorCard");
  document.getElementById("errorCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetSearch() {
  hideResults();
  document.getElementById("searchInput").value = "";
  toggleClear();
  document.getElementById("searchSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearInput() {
  document.getElementById("searchInput").value = "";
  toggleClear();
  document.getElementById("searchInput").focus();
}

function toggleClear() {
  const val = document.getElementById("searchInput").value;
  document.getElementById("clearBtn").style.display = val ? "block" : "none";
}

function shake(el) {
  el.style.animation = "none";
  el.style.borderColor = "#b91c1c";
  el.style.boxShadow   = "0 0 0 3px rgba(185,28,28,.15)";
  setTimeout(() => {
    el.style.borderColor = "";
    el.style.boxShadow   = "";
  }, 1200);
}

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d)) return str; // if already formatted string, return as-is
  return d.toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" });
}
