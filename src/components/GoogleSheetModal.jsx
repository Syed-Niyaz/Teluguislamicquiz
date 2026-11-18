import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { getSavedScriptUrl, saveScriptUrl } from '../services/sheetService';

const APPS_SCRIPT_SNIPPET = `var TARGET_SHEET_NAME = "quiz"; // Tab name

function getTargetSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TARGET_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(TARGET_SHEET_NAME);
  return sheet;
}

function normalizeNameKey_(value) {
  return String(value || "").replace(/^\\s+|\\s+$/g, "").replace(/\\s+/g, " ").toLowerCase();
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = getTargetSheet_();
    var headers = ["Submitted At", "Quiz Date", "Quiz Label", "Name", "Location", "Occupation", "Score", "Total", "Time Taken", "Time Seconds", "Percentage"];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setBackground("#2d6a4f").setFontColor("#ffffff").setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);
    var submittedAt = data.date || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var quizDate = String(data.quizDate || "");
    var name = String(data.name || "");
    var score = Number(data.score) || 0;
    var total = Number(data.total) || 0;

    // Only the first submission per user (name) per quiz date is recorded.
    var nameKey = normalizeNameKey_(name);
    if (quizDate && nameKey) {
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var rowQuizDate = String(rows[i][1] || "");
        var rowNameKey = normalizeNameKey_(rows[i][3]);
        if (rowQuizDate === quizDate && rowNameKey === nameKey) {
          return ContentService.createTextOutput(JSON.stringify({ status: "duplicate", message: "First submission already recorded." }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    sheet.appendRow([
      submittedAt,
      quizDate,
      data.quizLabel || "",
      name,
      data.location || "",
      data.occupation || "",
      score,
      total,
      data.timeTakenFormatted || "",
      Number(data.timeTakenSeconds) || 0,
      data.percentage || (total ? Math.round((score / total) * 100) + "%" : "0%")
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var sheet = getTargetSheet_();
  var rows = sheet.getDataRange().getValues();
  var params = (e && e.parameter) ? e.parameter : {};
  var quizDateFilter = params.quizDate || "";
  var list = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[3] && !r[1]) continue; // skip empty rows
    var item = {
      date: r[0],
      submittedAt: r[0],
      quizDate: r[1] || "",
      quizLabel: r[2] || "",
      name: r[3] || "",
      location: r[4] || "",
      occupation: r[5] || "",
      score: Number(r[6]) || 0,
      total: Number(r[7]) || 0,
      timeTakenFormatted: r[8] || "",
      timeTakenSeconds: Number(r[9]) || 0,
      percentage: r[10] || "",
      _i: i
    };
    if (quizDateFilter && String(item.quizDate) !== String(quizDateFilter)) continue;
    list.push(item);
  }

  // Rank: score desc, then faster time, then earlier submission (who did first)
  list.sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    if ((a.timeTakenSeconds || 999999) !== (b.timeTakenSeconds || 999999)) return (a.timeTakenSeconds || 999999) - (b.timeTakenSeconds || 999999);
    return a._i - b._i;
  });

  list.forEach(function(x){ delete x._i; });

  return ContentService.createTextOutput(JSON.stringify(list))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export default function GoogleSheetModal({ onClose }) {
  const [url, setUrl] = useState(getSavedScriptUrl());
  const [copied, setCopied] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = () => {
    saveScriptUrl(url);
    setSavedMsg('Google Sheet Web App URL సేవ్ చేయబడింది!');
    setTimeout(() => {
      setSavedMsg('');
      onClose();
    }, 1500);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-4 sm:p-7 max-w-lg w-full border border-emerald-100 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-950">
              Google Sheet కనెక్షన్ సెటప్
            </h3>
            <p className="text-xs text-emerald-700/80">
              Google Apps Script Web App ద్వారా డేటా సేవ్ అవుతుంది
            </p>
          </div>
        </div>

        {savedMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedMsg}</span>
          </div>
        )}

        {/* URL Input */}
        <div className="space-y-1.5 mb-5">
          <label className="block text-xs font-semibold text-emerald-950">
            మీ Google Apps Script Web App URL:
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/20 text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <span className="text-[11px] text-gray-500 block">
            (URL లేకపోతే డేటా బ్రౌజర్‌లో లోకల్‌గా భద్రపరచబడుతుంది)
          </span>
        </div>

        {/* Save & Clear Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
          >
            URL సేవ్ చేయండి
          </button>
          {url && (
            <button
              onClick={() => {
                setUrl('');
                saveScriptUrl('');
              }}
              className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs transition"
            >
              తొలగించు
            </button>
          )}
        </div>

        {/* Step-by-step instructions */}
        <div className="border-t border-emerald-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              సులువుగా సెటప్ చేసే విధానం (4 స్టెప్స్):
            </h4>
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'కోడ్ కాపీ అయింది!' : 'Apps Script కోడ్ కాపీ చేయండి'}</span>
            </button>
          </div>

          <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <li>
              Google Drive లో కొత్త <strong>Google Sheet</strong> తెరవండి.
            </li>
            <li>
              మెనూలో <strong>Extensions &gt; Apps Script</strong> పై క్లిక్ చేయండి.
            </li>
            <li>
              పైన ఉన్న <strong>"Apps Script కోడ్ కాపీ చేయండి"</strong> బటన్ నొక్కి, అక్కడ ఉన్న పాత కోడ్ తొలగించి పేస్ట్ చేయండి.
            </li>
            <li>
              కుడివైపు పైన <strong>Deploy &gt; New deployment</strong> ఎంచుకుని, Type లో <strong>Web app</strong> ఎంచుకోండి:
              <div className="mt-1 pl-4 text-[11px] text-emerald-800 font-medium">
                • Execute as: <strong>Me</strong><br />
                • Who has access: <strong>Anyone</strong> (అందరికీ యాక్సెస్)<br />
              </div>
              తర్వాత 'Deploy' చేసి వచ్చిన Web App URL ను పైన ఉన్న బాక్స్‌లో పేస్ట్ చేయండి!
            </li>
            <li className="text-emerald-800 font-medium">
              ఈ కోడ్ క్విజ్ తేదీ వారీగా ఎవరు ఆడారు, సబ్మిట్ సమయం, స్కోర్, తీసుకున్న సమయం మరియు ర్యాంక్ (ఎవరు ముందుగా/వేగంగా) వివరాలను సేవ్ చేసి లీడర్‌బోర్డ్‌కు ఇస్తుంది.
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
}
