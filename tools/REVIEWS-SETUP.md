# Reviews: one-time setup (about 5 minutes)

Reviews from reviews.html are saved to a Google Sheet and show on the site right away
(when the customer ticks "OK to show my review"). Mac gets an email for each one.

Best done while signed in to **Mac's Google account** (macpaulmesseh@gmail.com), so he owns the sheet.

1. Go to https://sheets.new. Name the sheet **Mac's Reviews**.
2. Menu **Extensions > Apps Script**. Delete everything in the editor, paste in all of
   `reviews-apps-script.gs`, and click the save icon.
3. Click **Deploy > New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   Click **Deploy**.
4. Click **Authorize access**, pick the Google account, then **Advanced > Go to (project name) (unsafe) > Allow**.
   (Google shows this warning for every personal script. It's your own code, so it's safe to allow.)
5. Copy the **Web app URL** (ends in `/exec`) and paste it into `REVIEWS_API` in `main.js`,
   then commit and push.

## Day to day
- New review: Mac gets an email, and it's already on the site.
- Hide a review: open the sheet, untick its **Show** box. Tick it again to bring it back.
- Photos are emailed to Mac and never published automatically.

## If you edit the script later
Use **Deploy > Manage deployments > (pencil) > Version: New version > Deploy** so the URL stays the same.
