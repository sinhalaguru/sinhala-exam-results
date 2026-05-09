/* ═══════════════════════════════════════════════
   SINHALA GURU — MARKS PORTAL
   script.js  —  Search & Download Logic
   ═══════════════════════════════════════════════

   ⚠️  SETUP: Replace the value below with your
       deployed Google Apps Script Web App URL.
   ═══════════════════════════════════════════════ */

const API_URL = "https://script.google.com/macros/s/AKfycbxfsURpAEBhbg2SfTfaQXA4M8nBKhYi0S46cp-vbxMhdSB6nFzBnqasQIfS8CU9foHz/exec";

/* ─── State ─── */
let currentSearchType = "index";
let currentResult     = null;

/* ─── DOM refs ─── */
const searchInput   = document.getElementById("searchInput");
const searchHint    = document.getElementById("searchHint");
const loaderWrap    = document.getElementById("loaderWrap");
const errorCard     = document.getElementById("errorCard");
const errorMsg      = document.getElementById("errorMsg");
const resultSection = document.getElementById("resultSection");

/* ─── Year in footer ─── */
document.getElementById("year").textContent = new Date().getFullYear();

/* ══════════════════════════════════════════
   TAB SWITCHING
══════════════════════════════════════════ */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSearchType = btn.dataset.type;

    const hints = {
      index: "e.g. 2024/001",
      name:  "e.g. Kamal Perera",
      nic:   "e.g. 200012345678"
    };
    const placeholders = {
      index: "Enter Index Number…",
      name:  "Enter Full Name…",
      nic:   "Enter NIC Number…"
    };

    searchInput.placeholder = placeholders[currentSearchType];
    searchHint.textContent  = hints[currentSearchType];
    searchInput.value       = "";
    searchInput.focus();

    resetResultView();
  });
});

/* Allow Enter key */
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") searchResult();
});

/* ══════════════════════════════════════════
   SEARCH
══════════════════════════════════════════ */
async function searchResult() {
  const query = searchInput.value.trim();
  if (!query) {
    searchInput.focus();
    searchInput.style.border = "1.5px solid var(--maroon)";
    setTimeout(() => (searchInput.style.border = ""), 1200);
    return;
  }

  resetResultView();
  showLoader(true);

  try {
    const params = new URLSearchParams({
      type:  currentSearchType,
      query: query
    });

    const response = await fetch(`${API_URL}?${params}`, { method: "GET" });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    showLoader(false);

    if (!data || data.error) {
      showError(data?.error || "No record found. Please double-check your input.");
      return;
    }

    displayResult(data);

  } catch (err) {
    showLoader(false);
    console.error("Fetch error:", err);
    showError("Could not connect to the server. Please try again later.");
  }
}

/* ══════════════════════════════════════════
   DISPLAY RESULT
══════════════════════════════════════════ */
function displayResult(data) {
  currentResult = data;

  setText("rName",   data.Name   || "—");
  setText("rIndex",  data.Index  || "—");
  setText("rNic",    data.NIC    || "—");
  setText("rExam",   data.Exam   || "—");
  setText("rPart1",  data["Part I"]   !== undefined ? data["Part I"]   : "—");
  setText("rPart2",  data["Part II"]  !== undefined ? data["Part II"]  : "—");
  setText("rPart3",  data["Part III"] !== undefined ? data["Part III"] : "—");
  setText("rTotal",  data.Total  !== undefined ? data.Total  : "—");
  setText("rReview", data.Review || "—");

  resultSection.style.display = "block";
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ══════════════════════════════════════════
   DOWNLOAD PDF
══════════════════════════════════════════ */
function downloadResult() {
  if (!currentResult) return;

  const d = currentResult;

  /* Build a print-friendly HTML page */
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Result — ${d.Name || "Student"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{
      font-family:'Crimson Pro','Georgia',serif;
      color:#2C1810;
      background:#FFFBF2;
      padding:40px;
      max-width:680px;
      margin:0 auto;
    }
    .top-bar{height:5px;background:linear-gradient(90deg,#7B1D2E,#C8892A,#7B1D2E);margin-bottom:32px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:1.5px solid #EEE3C8;}
    .school-name{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:900;color:#581424;line-height:1.1;}
    .school-sub{font-size:0.9rem;color:#8A6A5A;font-style:italic;margin-top:4px;}
    .teacher-tag{background:#7B1D2E;color:#F5DFA0;padding:4px 14px;border-radius:20px;font-size:0.78rem;letter-spacing:0.1em;text-transform:uppercase;}
    .title-block{text-align:right;}
    .cert-title{font-family:'Playfair Display',serif;font-size:1.1rem;color:#7B1D2E;letter-spacing:0.08em;text-transform:uppercase;}
    .cert-date{font-size:0.85rem;color:#8A6A5A;margin-top:4px;}

    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px;background:#FAF3E3;padding:20px;border-radius:10px;border:1px solid #EEE3C8;}
    .info-item label{display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.12em;color:#8A6A5A;margin-bottom:3px;}
    .info-item span{font-size:1.05rem;font-weight:600;color:#2C1810;}

    .scores{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1.5px solid #EEE3C8;border-radius:10px;overflow:hidden;margin-bottom:24px;}
    .score-box{padding:20px 16px;text-align:center;border-right:1px solid #EEE3C8;}
    .score-box:last-child{border-right:none;background:linear-gradient(135deg,rgba(123,29,46,0.07),rgba(200,137,42,0.1));}
    .score-box label{display:block;font-size:0.68rem;text-transform:uppercase;letter-spacing:0.12em;color:#8A6A5A;margin-bottom:8px;}
    .score-box .val{font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:#7B1D2E;}

    .review-box{background:linear-gradient(135deg,rgba(26,92,92,0.07),rgba(26,92,92,0.03));border:1px solid #C8E8E8;border-radius:10px;padding:16px 20px;margin-bottom:28px;}
    .review-box label{display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.12em;color:#1A5C5C;margin-bottom:6px;}
    .review-box p{font-style:italic;font-size:1.05rem;color:#2C1810;}

    .footer{text-align:center;border-top:1px solid #EEE3C8;padding-top:16px;margin-top:16px;}
    .footer p{font-size:0.8rem;color:#8A6A5A;font-style:italic;}
    .footer .sig{font-family:'Playfair Display',serif;font-size:0.9rem;color:#7B1D2E;margin-top:4px;}
  </style>
</head>
<body>
  <div class="top-bar"></div>
  <div class="header">
    <div>
      <div class="school-name">Sinhala Guru</div>
      <div class="school-sub">Examination Results Certificate</div>
      <div class="teacher-tag" style="display:inline-block;margin-top:8px;">Abdul Malik</div>
    </div>
    <div class="title-block">
      <div class="cert-title">Official Result</div>
      <div class="cert-date">Issued: ${new Date().toLocaleDateString("en-LK",{year:"numeric",month:"long",day:"numeric"})}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item"><label>Student Name</label><span>${d.Name || "—"}</span></div>
    <div class="info-item"><label>Examination</label><span>${d.Exam || "—"}</span></div>
    <div class="info-item"><label>Index Number</label><span>${d.Index || "—"}</span></div>
    <div class="info-item"><label>NIC</label><span>${d.NIC || "—"}</span></div>
  </div>

  <div class="scores">
    <div class="score-box"><label>Part I</label><div class="val">${d["Part I"] ?? "—"}</div></div>
    <div class="score-box"><label>Part II</label><div class="val">${d["Part II"] ?? "—"}</div></div>
    <div class="score-box"><label>Part III</label><div class="val">${d["Part III"] ?? "—"}</div></div>
    <div class="score-box"><label>Total</label><div class="val">${d.Total ?? "—"}</div></div>
  </div>

  <div class="review-box">
    <label>Instructor's Review</label>
    <p>${d.Review || "—"}</p>
  </div>

  <div class="footer">
    <p>This is an official result document issued by Sinhala Guru.</p>
    <div class="sig">Abdul Malik — Instructor</div>
  </div>
</body>
</html>`;

  /* Open in new window and trigger print */
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups to download your result.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function showLoader(show) {
  loaderWrap.style.display = show ? "block" : "none";
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorCard.style.display = "block";
}

function resetResultView() {
  resultSection.style.display = "none";
  errorCard.style.display     = "none";
  currentResult = null;
}

function resetSearch() {
  resetResultView();
  searchInput.value = "";
  searchInput.focus();
  document.getElementById("searchSection")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
