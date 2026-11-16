/**
 * ============================================================================
 * ఇస్లామిక్ తెలుగు క్విజ్ - GOOGLE APPS SCRIPT కోడ్ (Google Sheet Integration)
 * ============================================================================
 *
 * ఎలా సెటప్ చేయాలి (Step-by-Step Setup Guide):
 * 1. క్రొత్త Google Sheet తెరవండి (sheets.new).
 * 2. మెనూ నుండి 'Extensions' -> 'Apps Script' పై క్లిక్ చేయండి.
 * 3. అక్కడ ఉన్న కోడ్‌ని తీసివేసి, క్రింది కోడ్ మొత్తాన్ని పేస్ట్ చేయండి.
 * 4. పైన ఉన్న Save (💾) బటన్ క్లిక్ చేయండి.
 * 5. కుడివైపు పైన 'Deploy' -> 'New deployment' పై క్లిక్ చేయండి.
 * 6. Select type (⚙️) లో 'Web app' ఎంచుకోండి:
 *    - Description: Islamic Telugu Quiz Backend
 *    - Execute as: 'Me' (మీ ఖాతా)
 *    - Who has access: 'Anyone' (అందరికీ యాక్సెస్ - ముఖ్యం!)
 * 7. 'Deploy' బటన్ నొక్కండి, ఆపై 'Authorize access' ఇచ్చి అనుమతించండి.
 * 8. వచ్చిన 'Web app URL' ను కాపీ చేసి మన క్విజ్ యాప్‌లో పేస్ట్ చేయండి!
 *
 * Notes:
 * - Records: submission time, quiz date, name, location, occupation, score, duration, percentage
 * - Leaderboard (doGet): supports ?action=getLeaderboard&quizDate=YYYY-MM-DD
 *   and ranks by score desc, then time asc, then earliest submission (who did first)
 * ============================================================================
 */

var SHEET_HEADERS = [
  "సబ్మిట్ సమయం (Submitted At)",
  "క్విజ్ తేదీ (Quiz Date)",
  "క్విజ్ పేరు (Quiz Label)",
  "పేరు (Name)",
  "ప్రాంతం (Location)",
  "వృత్తి (Occupation)",
  "స్కోర్ (Score)",
  "మొత్తం ప్రశ్నలు (Total)",
  "తీసుకున్న సమయం (Time Taken)",
  "సమయం సెకన్లు (Time Seconds)",
  "శాతం (Percentage)"
];
var TARGET_SHEET_NAME = "quiz"; // Tab name in your Google Sheet
var ADMIN_PASSWORD = "Syed2002@"; // Leaderboard is admin-only

// Always produce a plain YYYY-MM-DD key so Sheet date cells and app dates match
function getSpreadsheetTimeZone_() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || "Asia/Kolkata";
  } catch (err) {
    return "Asia/Kolkata";
  }
}

var MONTH_KEYS_ = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
};

function toDateKeyString_(value) {
  var tz = getSpreadsheetTimeZone_();
  if (value instanceof Date) {
    return Utilities.formatDate(value, tz, "yyyy-MM-dd");
  }
  var s = String(value || "").trim();
  if (!s) return "";
  if (s.indexOf("weekly-") === 0) return s;
  var m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  // Handles old rows like "Sun Nov 15 2026 00:00:00 GMT+0300 ..."
  var named = s.match(/([A-Z][a-z]{2})\s+(\d{1,2}),?\s+(\d{4})/);
  if (named && MONTH_KEYS_[named[1]]) {
    return named[3] + "-" + MONTH_KEYS_[named[1]] + "-" + ("0" + named[2]).slice(-2);
  }
  var t = Date.parse(s);
  if (!isNaN(t)) {
    return Utilities.formatDate(new Date(t), tz, "yyyy-MM-dd");
  }
  return s;
}

function formatSeconds_(value) {
  var secs = Number(value);
  if (!isFinite(secs) || secs < 0) return "";
  var m = Math.floor(secs / 60);
  var s = secs % 60;
  return ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
}

function getTargetSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TARGET_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TARGET_SHEET_NAME);
  }
  return sheet;
}

function ensureHeaders_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.appendRow(SHEET_HEADERS);
  } else {
    // If an old sheet exists with fewer columns, extend header row labels safely
    var headerRange = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), SHEET_HEADERS.length));
    var headers = headerRange.getValues()[0];
    var needsUpdate = headers.length < SHEET_HEADERS.length;
    if (!needsUpdate) {
      for (var i = 0; i < SHEET_HEADERS.length; i++) {
        if (String(headers[i] || "") !== SHEET_HEADERS[i]) { needsUpdate = true; break; }
      }
    }
    if (needsUpdate && sheet.getLastRow() === 1) {
      // Only rewrite if sheet has header only (fresh/migrating empty)
      sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
    }
  }

  var hr = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
  hr.setBackground("#2d6a4f");
  hr.setFontColor("#ffffff");
  hr.setFontWeight("bold");
  hr.setHorizontalAlignment("center");
  hr.setVerticalAlignment("middle");
  sheet.setFrozenRows(1);
}

function parseJsonBody_(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (err) {}
  }
  return (e && e.parameter) ? e.parameter : {};
}

function normalizeRow_(row, rowIndex) {
  // New schema stores a quizDate in column B (YYYY-MM-DD). Old schema stored location there.
  // Do NOT decide from row.length: Sheets pads old rows to the current column count.
  var colB = toDateKeyString_(row[1]);
  var isNew = /^\d{4}-\d{2}-\d{2}$/.test(colB) || String(row[1] || "").indexOf("weekly-") === 0;
  var submittedAt, quizDate, quizLabel, name, location, occupation, score, total, timeTakenFormatted, timeTakenSeconds, percentage;

  if (isNew) {
    submittedAt = row[0];
    quizDate = colB;
    quizLabel = row[2] || "";
    name = row[3] || "";
    location = row[4] || "";
    occupation = row[5] || "";
    score = Number(row[6]) || 0;
    total = Number(row[7]) || 0;
    timeTakenFormatted = row[8] || "";
    timeTakenSeconds = Number(row[9]) || 0;
    percentage = row[10] || "";
  } else {
    submittedAt = row[0];
    quizDate = ""; // unknown for legacy rows
    quizLabel = "";
    name = row[1] || "";
    location = row[2] || "";
    occupation = row[3] || "";
    score = Number(row[4]) || 0;
    total = Number(row[5]) || 0;
    timeTakenFormatted = row[6] || "";
    timeTakenSeconds = Number(row[7]) || 0;
    percentage = row[8] || "";
  }

  if (!name) return null;

  // Recompute derived fields so Sheet date/time formatting can never corrupt them
  timeTakenSeconds = Number(timeTakenSeconds) || 0;
  timeTakenFormatted = formatSeconds_(timeTakenSeconds) || String(timeTakenFormatted || "");
  percentage = total ? Math.round((score / total) * 100) + "%" : String(percentage || "0%");

  return {
    date: submittedAt,                 // submission timestamp (used by app)
    submittedAt: submittedAt,
    quizDate: String(quizDate || ""),
    quizLabel: String(quizLabel || ""),
    name: String(name),
    location: String(location || ""),
    occupation: String(occupation || ""),
    score: score,
    total: total,
    timeTakenFormatted: String(timeTakenFormatted || ""),
    timeTakenSeconds: timeTakenSeconds,
    percentage: String(percentage || ""),
    _rowIndex: rowIndex // for "who did first" tie-break (earliest recorded row)
  };
}

function toSubmittedMillis_(value, fallbackIndex) {
  if (value instanceof Date) return value.getTime();
  var t = Date.parse(String(value));
  if (!isNaN(t)) return t;
  return fallbackIndex || 0;
}

function sortLeaderboard_(list) {
  list.sort(function(a, b) {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    var at = (a.timeTakenSeconds == null || isNaN(a.timeTakenSeconds)) ? 999999 : a.timeTakenSeconds;
    var bt = (b.timeTakenSeconds == null || isNaN(b.timeTakenSeconds)) ? 999999 : b.timeTakenSeconds;
    if (at !== bt) return at - bt; // faster first
    var as = toSubmittedMillis_(a.submittedAt || a.date, a._rowIndex);
    var bs = toSubmittedMillis_(b.submittedAt || b.date, b._rowIndex);
    return as - bs; // earlier submission first (who did first)
  });
  return list;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = getTargetSheet_();
    ensureHeaders_(sheet);

    var data = parseJsonBody_(e);
    var submittedAt = data.date || Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
    var quizDate = toDateKeyString_(data.quizDate) || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
    var quizLabel = data.quizLabel || "";
    var name = data.name || "Unknown";
    var location = data.location || "";
    var occupation = data.occupation || "";
    var score = Number(data.score) || 0;
    var total = Number(data.total) || 0;
    var timeTakenSeconds = Number(data.timeTakenSeconds) || 0;
    var timeTakenFormatted = formatSeconds_(timeTakenSeconds) || data.timeTakenFormatted || "";
    var percentage = total ? Math.round((score / total) * 100) + "%" : "0%";

    // Write as plain text so Sheets cannot convert dates/times/percentages into
    // serial numbers (this is what previously broke date filtering).
    var nextRow = sheet.getLastRow() + 1;
    var target = sheet.getRange(nextRow, 1, 1, SHEET_HEADERS.length);
    target.setNumberFormat("@");
    target.setValues([[
      String(submittedAt),
      String(quizDate),
      String(quizLabel),
      String(name),
      String(location),
      String(occupation),
      String(score),
      String(total),
      String(timeTakenFormatted),
      String(timeTakenSeconds),
      String(percentage)
    ]]);

    var rowRange = sheet.getRange(nextRow, 1, 1, SHEET_HEADERS.length);
    rowRange.setVerticalAlignment("middle");
    sheet.getRange(nextRow, 1, 1, 3).setHorizontalAlignment("center"); // submitted, quizDate, quizLabel
    sheet.getRange(nextRow, 7, 1, 5).setHorizontalAlignment("center"); // score,total,time,seconds,percentage
    sheet.autoResizeColumns(1, SHEET_HEADERS.length);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Quiz result successfully recorded in Google Sheet!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: String(error)
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};

  // Admin-only leaderboard
  if (String(params.password || "") !== ADMIN_PASSWORD) {
    return ContentService.createTextOutput(JSON.stringify({ error: "unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var sheet = getTargetSheet_();
    var rows = sheet.getDataRange().getValues();
    var quizDateFilter = params.quizDate ? toDateKeyString_(params.quizDate) : "";
    var results = [];

    for (var i = 1; i < rows.length; i++) {
      var item = normalizeRow_(rows[i], i + 1);
      if (!item) continue;
      if (quizDateFilter && item.quizDate !== quizDateFilter) continue;
      results.push(item);
    }

    sortLeaderboard_(results);

    // Remove internal field
    for (var j = 0; j < results.length; j++) {
      delete results[j]._rowIndex;
    }

    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
