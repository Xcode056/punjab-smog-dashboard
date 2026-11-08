# How I Built Punjab Smog & Fog

## 1. Why does the timezone parameter matter, and what breaks without it?

The timezone parameter tells the Open-Meteo API which timezone to use when returning hourly forecast data.

In this project, I use `Asia/Karachi` because the dashboard is designed for Punjab, Pakistan.

Without the correct timezone, hourly forecast timestamps may not match Pakistan's local time. This can cause incorrect hour labels, date boundaries, and confusion when identifying today's and tomorrow's forecasts.

Using the correct timezone helps the dashboard display forecast information according to Pakistan's local time.

## 2. Why rank "best hours" by PM2.5 rather than AQI?

I use PM2.5 to identify the best hours because PM2.5 represents the concentration of fine particulate matter in the air.

The dashboard calculates the average PM2.5 across a three-hour window. It then selects the window with the lowest average.

This makes it possible to identify a period when PM2.5 pollution is predicted to be relatively lower.

AQI is still displayed to communicate the overall air-quality category, while PM2.5 is used for ranking the cleaner forecast hours.

## 3. Why can't the WhatsApp link preview show today's number in v1?

WhatsApp generates link previews by reading the website's Open Graph metadata.

In version 1, the Open Graph metadata describes the website using a general title, description, and preview image. It does not automatically contain the live AQI value for each city.

The AQI value changes with the selected city and updated API data. A normal static link preview cannot automatically display these changing values.

Social platforms may also cache link previews, so changes to metadata are not always shown immediately.

For this version, I provide the live AQI information through the website and use a generated share card to share the current information.