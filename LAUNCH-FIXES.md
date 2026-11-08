# Launch fixes

This archive contains the four requested launch fixes.

## Changes
1. Removed the temporary `about:blank` tab from the WhatsApp sharing handler.
2. The share button now tries native image-file sharing first. On Android, choose WhatsApp from the system share sheet to attach the generated PNG. If file sharing is unavailable or fails, the site opens WhatsApp with the text and `https://dhund.pk` link. If the user cancels the native share sheet, the site does not unexpectedly open WhatsApp.
3. The current AQI category badge now uses colours matching the AQI category instead of remaining green for every reading.
4. The share-card date/time is formatted as a separate left-to-right string to prevent Urdu right-to-left text layout from scrambling it.
5. Replaced the 936 KB Open Graph PNG with `og.jpg` (1200 x 630, approximately 149 KB) and updated the Open Graph, Twitter, and canonical URLs to `https://dhund.pk`.

## Android evidence test
- Open `https://dhund.pk` in Chrome on Android.
- Tap **Share on WhatsApp**.
- If the Android share sheet opens, select WhatsApp. Confirm the generated `punjab-smog.png` is attached to the draft before sending.
- Send the card to a private chat or yourself, then capture a screen recording showing the share action and the image in the WhatsApp draft/chat.
- If the browser does not support file sharing, confirm WhatsApp opens with the report text and `https://dhund.pk` link instead.
- To test the link preview, send `https://dhund.pk` as a separate message in a WhatsApp chat and capture the resulting preview. The preview may take time to refresh because WhatsApp caches link previews.
- Open the GoatCounter dashboard for the `xcode` site, refresh the public site in another tab/device, and capture the dashboard showing the visit count increasing.

## Important limitation
A website cannot force Android to choose WhatsApp from the native share sheet or send a message without the user's confirmation. The user must select WhatsApp and tap Send. Actual Android recording, WhatsApp preview, and GoatCounter screenshots must be captured from the real device/account; they cannot be truthfully generated from the source archive alone.
