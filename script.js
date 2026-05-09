/* ════════════════════════════════════════════════
   SINHALA GURU — Exam Results Portal
   script.js

   ⚙️  EDIT THESE BEFORE DEPLOYING:
   ════════════════════════════════════════════════ */
const CONFIG = {
  API_URL:          "https://script.google.com/macros/s/AKfycbxfsURpAEBhbg2SfTfaQXA4M8nBKhYi0S46cp-vbxMhdSB6nFzBnqasQIfS8CU9foHz/exec",
  WHATSAPP_NUMBER:  "94766977490",      // Sri Lanka: 94 + mobile (no leading 0)
  WHATSAPP_MSG:     "Hello Sir, I have a question about my Sinhala exam results.",
  TUTOR_NAME:       "Sinhala Guru"
};

/* ════════════════════════════════════════════════
   MOTIVATIONAL QUOTES — English only
   ════════════════════════════════════════════════ */
const QUOTES = {
  A: [
    "Excellence is not a skill — it's an attitude. You are living proof of that today.",
    "You have honoured the language of our ancestors with distinction. Keep shining!",
    "A mark in Sinhala means you truly command this beautiful language. Well done."
  ],
  B: [
    "Merit is a wonderful achievement — the peak of Distinction is well within your reach.",
    "Strong, consistent work. A little more focus and you will claim the top grade.",
    "You are so close. Keep refining, keep pushing — greatness is just ahead."
  ],
  C: [
    "A Credit means you have a solid foundation. Build on it with daily practice.",
    "Every great Sinhala scholar started with small steps. You are on the right path.",
    "Passed and progressing — now set your sights higher for the next examination."
  ],
  S: [
    "A pass is a pass, and every journey begins with the first step. Keep walking.",
    "You crossed the line. Now draw a higher line for yourself and aim for it.",
    "You made it through. The next exam is your chance to climb further — believe in yourself."
  ],
  F: [
    "A setback is not the end — it is the beginning of a stronger comeback. Rise again.",
    "The greatest learners are those who refuse to give up. Come back stronger next time.",
    "Every mark is a lesson, not a verdict. Learn from it, prepare harder, and return."
  ]
};

/* ════════════════════════════════════════════════
   GRADE DATA
   ════════════════════════════════════════════════ */
const GRADE_INFO = {
  A: { name: "Distinction", range: "75 – 100 marks" },
  B: { name: "Merit",       range: "65 – 74 marks"  },
  C: { name: "Credit",      range: "55 – 64 marks"  },
  S: { name: "Simple Pass", range: "35 – 54 marks"  },
  F: { name: "Fail",        range: "0 – 34 marks"   }
};

const GRADE_COLORS = { A: "#15803d", B: "#1d4ed8", C: "#0e7490", S: "#b45309", F: "#b91c1c" };

/* ════════════════════════════════════════════════
   STATE
   ════════════════════════════════════════════════ */
let searchType  = "index";
let currentData = null;

/* ════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════ */
document.getElementById("footerYear").textContent = new Date().getFullYear();
document.getElementById("waFloat").href = buildWaLink();

// Tab buttons
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    searchType = btn.dataset.type;

    const cfg = {
      index: { ph: "Enter Index Number…",  hint: "e.g. 2024/001" },
      name:  { ph: "Enter Full Name…",      hint: "e.g. Kamal Perera" }
    };
    const inp = document.getElementById("searchInput");
    inp.placeholder = cfg[searchType].ph;
    document.getElementById("inputHint").textContent = cfg[searchType].hint;
    inp.value = "";
    toggleClear();
    hideAll();
    inp.focus();
  });
});

// Enter key
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") doSearch();
});
document.getElementById("searchInput").addEventListener("input", toggleClear);

/* ════════════════════════════════════════════════
   SEARCH
   ════════════════════════════════════════════════ */
async function doSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) {
    highlight(document.getElementById("searchInput"));
    return;
  }
  hideAll();
  show("loaderWrap");

  try {
    const url = `${CONFIG.API_URL}?type=${encodeURIComponent(searchType)}&query=${encodeURIComponent(query)}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    hide("loaderWrap");

    if (data.error) { showError(data.error); return; }

    currentData = data;
    render(data);

    // Show upcoming exam if present
    if (data.nextExam && data.nextExam.name) {
      setText("unName", data.nextExam.name);
      setText("unDate", data.nextExam.date ? formatDate(data.nextExam.date) : "");
      show("upcomingNotice");
    }

  } catch (err) {
    hide("loaderWrap");
    console.error(err);
    showError("Could not connect to the server. Please check your internet connection.");
  }
}

/* ════════════════════════════════════════════════
   RENDER
   ════════════════════════════════════════════════ */
function render(d) {
  const cur   = d.current || {};
  const grade = (cur.grade || "").toUpperCase();
  const gi    = GRADE_INFO[grade] || { name: grade, range: "" };

  // Student banner
  setText("rName",     d.name     || "—");
  setText("rIndex",    d.index    || "—");
  setText("rOlYear",   d.olYear   || "—");
  setText("rExam",     cur.exam   || "—");
  setText("rExamDate", cur.examDate ? formatDate(cur.examDate) : "—");

  // Grade banner
  const banner = document.getElementById("rGradeBanner");
  banner.className = "r-grade-banner" + (grade ? " gb-" + grade : "");
  setText("rGradeLetter", grade || "—");
  setText("rGradeName",   gi.name);
  setText("rGradeRange",  gi.range);
  setText("rTotal",       cur.total ?? "—");

  // Scores
  setText("rPart1", cur.part1 ?? "—");
  setText("rPart2", cur.part2 ?? "—");
  setText("rPart3", cur.part3 ?? "—");

  // Performance bar
  const mine    = Number(cur.total       || 0);
  const highest = Number(cur.classHighest || 0);
  const gap     = highest > mine ? highest - mine : 0;
  const pct     = highest > 0 ? Math.min(100, (mine / highest) * 100) : 0;

  setText("cmpMine", mine);
  setText("cmpHigh", highest || "—");
  setText("cmpGap",  gap > 0 ? "−" + gap : "0");
  setText("rRank",   cur.rank          ? "#" + cur.rank : "—");
  setText("rRankOf", cur.totalStudents ? "of " + cur.totalStudents : "");

  // Apply grade colour to performance section
  const perf = document.querySelector(".r-perf");
  perf.className = "r-perf" + (grade ? " gc-" + grade : "");

  // Animate bar after a short delay
  setTimeout(() => {
    document.getElementById("cmpFill").style.width = pct + "%";
  }, 200);

  // Quote (English only)
  const pool = QUOTES[grade] || QUOTES["F"];
  setText("quoteText", pool[Math.floor(Math.random() * pool.length)]);

  // Review
  setText("rReview", cur.review || "—");

  // Progress chart
  const history  = d.history || [];
  const allExams = [...history, { ...cur, isCurrent: true }];

  if (allExams.length >= 1) {
    show("progressSection");
    drawChart(allExams);
  }

  // History accordion
  if (history.length > 0) {
    show("historySection");
    renderHistory(history);
  }

  show("resultSection");
  document.getElementById("resultSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ════════════════════════════════════════════════
   PROGRESS CHART  (SVG, no external libs)
   ════════════════════════════════════════════════ */
function drawChart(exams) {
  const container = document.getElementById("progressChart");
  container.innerHTML = "";

  const W   = 640, H = 200;
  const pad = { t: 32, r: 56, b: 52, l: 36 };
  const cW  = W - pad.l - pad.r;
  const cH  = H - pad.t - pad.b;
  const n   = exams.length;

  const totals   = exams.map(e => Number(e.total || 0));
  const highests = exams.map(e => Number(e.classHighest || 0));
  const maxVal   = Math.max(...totals, ...highests, 10);
  const yMax     = Math.ceil(maxVal / 25) * 25 + 15;

  const toX = i => pad.l + (n <= 1 ? cW / 2 : (i / (n - 1)) * cW);
  const toY = v => pad.t + cH - (v / yMax) * cH;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;overflow:visible">`;

  // Horizontal grid lines
  for (let t = 0; t <= yMax; t += 25) {
    const y = toY(t);
    svg += `<line x1="${pad.l}" y1="${y}" x2="${W-pad.r}" y2="${y}" stroke="#E0D2B4" stroke-width="1"/>`;
    svg += `<text x="${pad.l-4}" y="${y+4}" text-anchor="end" font-size="10" fill="#8A6040" font-family="Georgia,serif">${t}</text>`;
  }

  // Class highest reference (dashed gold line — from last/current exam)
  const refH = Number(exams[exams.length - 1]?.classHighest || 0);
  if (refH > 0) {
    const ry = toY(refH);
    svg += `<line x1="${pad.l}" y1="${ry}" x2="${W-pad.r}" y2="${ry}" stroke="#BF8814" stroke-width="1.5" stroke-dasharray="6,4" opacity=".6"/>`;
    svg += `<text x="${W-pad.r+4}" y="${ry+4}" font-size="10" fill="#BF8814" font-family="Georgia,serif">Highest</text>`;
  }

  // Connecting line (animated)
  if (n > 1) {
    let d = `M ${toX(0)} ${toY(totals[0])}`;
    for (let i = 1; i < n; i++) d += ` L ${toX(i)} ${toY(totals[i])}`;
    svg += `<path d="${d}" fill="none" stroke="#611220" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="prog-line"/>`;
  }

  // Dots + score labels
  exams.forEach((exam, i) => {
    const x   = toX(i);
    const y   = toY(totals[i]);
    const g   = (exam.grade || "F").toUpperCase();
    const col = GRADE_COLORS[g] || "#611220";
    const cur = exam.isCurrent;

    if (cur) svg += `<circle cx="${x}" cy="${y}" r="20" fill="${col}" opacity=".12"/>`;
    svg += `<circle cx="${x}" cy="${y}" r="${cur ? 13 : 10}" fill="${col}" stroke="white" stroke-width="2"/>`;
    svg += `<text x="${x}" y="${y+4}" text-anchor="middle" font-size="${cur ? 10 : 9}" font-weight="bold" fill="white" font-family="Georgia,serif">${g}</text>`;
    svg += `<text x="${x}" y="${y-(cur?21:17)}" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E0D07" font-family="Georgia,serif">${totals[i]}</text>`;

    // Exam label (rotated, below axis)
    const lbl = (exam.exam || "Exam").substring(0, 14);
    svg += `<text x="${x}" y="${H - pad.b + 16}" text-anchor="end" font-size="10" fill="#50321E" font-family="Georgia,serif" transform="rotate(-32,${x},${H - pad.b + 16})">${lbl}</text>`;
  });

  svg += "</svg>";
  container.innerHTML = svg;
}

/* ════════════════════════════════════════════════
   HISTORY ACCORDION
   ════════════════════════════════════════════════ */
function renderHistory(history) {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  const gradeNames = { A:"Distinction", B:"Merit", C:"Credit", S:"Simple Pass", F:"Fail" };
  [...history].reverse().forEach(exam => {
    const g   = (exam.grade || "F").toUpperCase();
    const col = GRADE_COLORS[g] || "#611220";
    const div = document.createElement("div");
    div.className = "hist-row";
    div.innerHTML = `
      <div class="hist-head" onclick="this.parentElement.classList.toggle('open')">
        <span class="hist-exam">${exam.exam || "Exam"}</span>
        <div class="hist-right">
          <span class="hist-total">${exam.total ?? "—"}</span>
          <div class="hist-grade" style="background:${col}">${g}</div>
          <span class="hist-chevron">▼</span>
        </div>
      </div>
      <div class="hist-body">
        <div class="hist-scores">
          <div class="hsc"><p class="hsc-lbl">Part I</p><p class="hsc-val">${exam.part1 ?? "—"}</p></div>
          <div class="hsc"><p class="hsc-lbl">Part II</p><p class="hsc-val">${exam.part2 ?? "—"}</p></div>
          <div class="hsc"><p class="hsc-lbl">Part III</p><p class="hsc-val">${exam.part3 ?? "—"}</p></div>
          <div class="hsc"><p class="hsc-lbl">Total</p><p class="hsc-val" style="color:${col}">${exam.total ?? "—"}</p></div>
          <div class="hsc"><p class="hsc-lbl">Grade</p><p class="hsc-val" style="color:${col}">${gradeNames[g] || g}</p></div>
        </div>
        ${exam.review ? `<p class="hist-meta">"${exam.review}"</p>` : ""}
        ${exam.examDate ? `<p class="hist-meta" style="margin-top:4px">Date: ${formatDate(exam.examDate)}</p>` : ""}
      </div>`;
    list.appendChild(div);
  });
}

/* ════════════════════════════════════════════════
   PDF — iOS/Android/Desktop safe
   Uses in-page @media print (no popup window)
   ════════════════════════════════════════════════ */
function downloadResult() {
  if (!currentData) return;
  const d   = currentData;
  const cur = d.current || {};
  const g   = (cur.grade || "").toUpperCase();
  const gi  = GRADE_INFO[g] || { name: g, range: "" };
  const col = GRADE_COLORS[g] || "#611220";

  document.getElementById("printArea").innerHTML = `
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Georgia,serif;color:#1E0D07;background:white;padding:0;}
  .pw{max-width:660px;margin:0 auto;padding:36px 40px;}
  .topbar{height:5px;background:linear-gradient(90deg,#440D18,#BF8814,#611220,#BF8814,#440D18);margin-bottom:28px;}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;padding-bottom:18px;border-bottom:1.5px solid #EEE4CA;}
  .school{font-size:1.9rem;font-weight:900;color:#440D18;line-height:1.1;}
  .school-sub{font-size:.85rem;color:#8A6040;font-style:italic;margin-top:3px;}
  .tag{display:inline-block;background:#611220;color:#F0D580;padding:3px 12px;border-radius:20px;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;margin-top:7px;}
  .cert-title{font-size:1rem;color:#611220;letter-spacing:.08em;text-transform:uppercase;}
  .cert-date{font-size:.8rem;color:#8A6040;margin-top:4px;text-align:right;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;background:#FAF3E3;padding:16px 18px;border-radius:10px;border:1px solid #EEE4CA;}
  .ifield label{display:block;font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:#8A6040;margin-bottom:3px;}
  .ifield span{font-size:.97rem;font-weight:600;}
  .grade-row{display:flex;align-items:center;gap:16px;margin-bottom:18px;padding:14px 18px;border-radius:10px;background:${col}18;border:1px solid ${col}30;}
  .g-box{width:60px;height:60px;border-radius:12px;background:${col};display:flex;align-items:center;justify-content:center;font-size:1.9rem;font-weight:900;color:white;flex-shrink:0;}
  .g-info label{display:block;font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:${col};}
  .g-info span{font-size:1.1rem;font-weight:700;color:${col};}
  .scores{display:grid;grid-template-columns:repeat(3,1fr);border:1.5px solid #EEE4CA;border-radius:10px;overflow:hidden;margin-bottom:18px;}
  .sc{padding:16px 12px;text-align:center;border-right:1px solid #EEE4CA;}
  .sc:last-child{border-right:none;}
  .sc label{display:block;font-size:.63rem;text-transform:uppercase;letter-spacing:.12em;color:#8A6040;margin-bottom:7px;}
  .sc .val{font-size:1.7rem;font-weight:700;color:#611220;}
  .total-row{text-align:center;margin-bottom:18px;}
  .total-row .tl{font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:#8A6040;}
  .total-row .tv{font-size:2.2rem;font-weight:900;color:#440D18;}
  .review{background:linear-gradient(135deg,rgba(22,82,80,.07),rgba(22,82,80,.03));border:1px solid #C0E0DF;border-radius:10px;padding:13px 16px;margin-bottom:20px;}
  .review label{display:block;font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:#165250;margin-bottom:5px;}
  .review p{font-style:italic;font-size:.97rem;}
  .footer{text-align:center;border-top:1px solid #EEE4CA;padding-top:14px;margin-top:10px;}
  .footer p{font-size:.75rem;color:#8A6040;font-style:italic;}
  .footer .sig{font-size:.88rem;color:#611220;margin-top:3px;}
  @media print{@page{margin:12mm;}}
</style>
<div class="pw">
  <div class="topbar"></div>
  <div class="hdr">
    <div>
      <div class="school">Sinhala Guru</div>
      <div class="school-sub">සිංහල ගුරු · Examination Result</div>
      <div class="tag">${CONFIG.TUTOR_NAME}</div>
    </div>
    <div>
      <div class="cert-title">Official Result</div>
      <div class="cert-date">Issued: ${new Date().toLocaleDateString("en-LK",{year:"numeric",month:"long",day:"numeric"})}</div>
    </div>
  </div>
  <div class="info-grid">
    <div class="ifield"><label>Student Name</label><span>${d.name||"—"}</span></div>
    <div class="ifield"><label>Examination</label><span>${cur.exam||"—"}</span></div>
    <div class="ifield"><label>Index Number</label><span>${d.index||"—"}</span></div>
    <div class="ifield"><label>O/L Year</label><span>${d.olYear||"—"}</span></div>
    <div class="ifield"><label>Exam Date</label><span>${cur.examDate?formatDate(cur.examDate):"—"}</span></div>
    <div class="ifield"><label>Class Rank</label><span>${cur.rank?"#"+cur.rank+" of "+(cur.totalStudents||"—"):"—"}</span></div>
  </div>
  <div class="grade-row">
    <div class="g-box">${g||"—"}</div>
    <div class="g-info"><label>Grade</label><span>${gi.name}</span></div>
  </div>
  <div class="scores">
    <div class="sc"><label>Part I</label><div class="val">${cur.part1??'—'}</div></div>
    <div class="sc"><label>Part II</label><div class="val">${cur.part2??'—'}</div></div>
    <div class="sc"><label>Part III</label><div class="val">${cur.part3??'—'}</div></div>
  </div>
  <div class="total-row"><div class="tl">Total Score</div><div class="tv">${cur.total??'—'}</div></div>
  ${cur.review ? `<div class="review"><label>Instructor's Review</label><p>${cur.review}</p></div>` : ""}
  <div class="footer">
    <p>This is an official result document issued by Sinhala Guru.</p>
    <div class="sig">${CONFIG.TUTOR_NAME} — Sinhala Instructor &nbsp;·&nbsp; Strictly Confidential</div>
  </div>
</div>`;

  window.print();
  setTimeout(() => { document.getElementById("printArea").innerHTML = ""; }, 4000);
}

/* ════════════════════════════════════════════════
   WHATSAPP
   ════════════════════════════════════════════════ */
function openWhatsApp() { window.open(buildWaLink(), "_blank", "noopener"); }
function buildWaLink()  { return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(CONFIG.WHATSAPP_MSG)}`; }

/* ════════════════════════════════════════════════
   UI HELPERS
   ════════════════════════════════════════════════ */
function show(id)          { const e = document.getElementById(id); if (e) e.style.display = "block"; }
function hide(id)          { const e = document.getElementById(id); if (e) e.style.display = "none";  }
function setText(id, val)  { const e = document.getElementById(id); if (e) e.textContent = val; }

function hideAll() {
  hide("resultSection"); hide("errorCard"); hide("loaderWrap");
  hide("progressSection"); hide("historySection");
  currentData = null;
  // Reset bar width
  const fill = document.getElementById("cmpFill");
  if (fill) fill.style.width = "0%";
}

function showError(msg) {
  setText("errorMsg", msg);
  show("errorCard");
  document.getElementById("errorCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetSearch() {
  hideAll();
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
  document.getElementById("clearBtn").style.display =
    document.getElementById("searchInput").value ? "block" : "none";
}

function highlight(el) {
  el.style.borderColor = "#b91c1c";
  el.style.boxShadow   = "0 0 0 3px rgba(185,28,28,.12)";
  setTimeout(() => { el.style.borderColor = ""; el.style.boxShadow = ""; }, 1200);
}

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return String(str); // already a plain string
  return d.toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" });
}
