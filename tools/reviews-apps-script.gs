/**
 * Mac's Premier Holiday Lighting - reviews backend (Google Apps Script).
 *
 * Reviews submitted on reviews.html are saved to this Google Sheet and show on
 * the website right away when the customer ticked "OK to show my review".
 * To hide a review, untick its "Show" box (or delete the row). Tick it to bring it back.
 * Photos are never published automatically: they are emailed to NOTIFY_EMAIL only.
 *
 * Setup: see tools/REVIEWS-SETUP.md
 */

const NOTIFY_EMAIL = 'macpaulmesseh@gmail.com';   // gets an email for every new review
const SHEET_NAME = 'Reviews';
const HEADERS = ['Date', 'Stars', 'Name', 'Place', 'Review', 'OK to publish', 'Show', 'Photo emailed'];
const MAX_PER_HOUR = 30;   // simple spam brake for the whole site

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setColumnWidth(5, 420);
  }
  return sh;
}

// stop "=SUM(...)"-style text from being treated as a formula
function clean_(v, max) {
  let s = String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** GET: the reviews to show on the site, newest first. */
function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const reviews = rows
    .filter((r) => r[6] === true && r[4])
    .reverse()
    .slice(0, 100)
    .map((r) => ({
      stars: Math.min(5, Math.max(1, Number(r[1]) || 5)),
      name: String(r[2]).replace(/^'/, ''),
      place: String(r[3]).replace(/^'/, ''),
      text: String(r[4]).replace(/^'/, ''),
      date: r[0] instanceof Date ? r[0].toISOString().slice(0, 10) : '',
    }));
  return json_({ ok: true, reviews });
}

/** POST: save a new review. */
function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return json_({ ok: true });   // honeypot field filled = bot

  const stars = parseInt(p.rating, 10);
  const name = clean_(p.name, 60);
  const place = clean_(p.place, 60);
  const text = clean_(p.review, 1500);
  if (!(stars >= 1 && stars <= 5) || !name || !text) return json_({ ok: false, error: 'missing' });

  const cache = CacheService.getScriptCache();
  const count = Number(cache.get('count') || 0);
  if (count >= MAX_PER_HOUR) return json_({ ok: false, error: 'busy' });
  cache.put('count', String(count + 1), 3600);

  const okToPublish = p.ok_to_publish === 'Yes';
  let photo = null;
  if (p.photo && p.photo.length < 12e6) {
    try {
      photo = Utilities.newBlob(Utilities.base64Decode(p.photo), p.photo_type || 'image/jpeg', p.photo_name || 'review-photo.jpg');
    } catch (err) { photo = null; }
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    sh.appendRow([new Date(), stars, name, place, text, okToPublish ? 'Yes' : 'No', okToPublish, photo ? 'Yes' : '']);
    sh.getRange(sh.getLastRow(), 7).insertCheckboxes().setValue(okToPublish);
  } finally {
    lock.releaseLock();
  }

  try {
    const body = [
      `${'★'.repeat(stars)} (${stars}/5) from ${name}${place ? ', ' + place : ''}`,
      '',
      text,
      '',
      okToPublish ? 'This review is now showing on macspremierlighting.com/reviews.html.' : 'The customer did NOT give permission to publish, so it is hidden.',
      'To hide or show it, untick/tick its "Show" box in the Reviews sheet:',
      SpreadsheetApp.getActiveSpreadsheet().getUrl(),
      photo ? '\nTheir photo is attached (not published). Check it for house numbers before using it anywhere.' : '',
    ].join('\n');
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New ${stars}-star review - macspremierlighting.com`,
      body,
      attachments: photo ? [photo] : [],
    });
  } catch (err) { /* email quota hit; the review is still saved */ }

  return json_({ ok: true, published: okToPublish });
}
