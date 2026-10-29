let currentLanguage = "ur";

const languageToggle = document.getElementById("languageToggle");
const citySelect = document.getElementById("citySelect");

const cityCoordinates = {
    Lahore: { latitude: 31.55, longitude: 74.34 },
    Faisalabad: { latitude: 31.45, longitude: 73.14 },
    Rawalpindi: { latitude: 33.60, longitude: 73.05 },
    Multan: { latitude: 30.20, longitude: 71.45 },
    Gujranwala: { latitude: 32.16, longitude: 74.19 },
    Sialkot: { latitude: 32.49, longitude: 74.53 },
    Sheikhupura: { latitude: 31.71, longitude: 73.98 },
    Kasur: { latitude: 31.12, longitude: 74.45 },
    Sargodha: { latitude: 32.08, longitude: 72.67 },
    Bahawalpur: { latitude: 29.40, longitude: 71.68 }
};

let city = citySelect.value || "Lahore";
let selectedCoordinates = cityCoordinates[city];
let latestRequestId = 0;

function buildApiUrl(coordinates) {
    return `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=pm2_5,us_aqi&hourly=pm2_5,us_aqi&timezone=Asia%2FKarachi&forecast_days=2`;
}

function translatePage() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === "ur" ? "rtl" : "ltr";
    languageToggle.textContent = currentLanguage === "ur" ? "English" : "اردو";

    document.querySelectorAll("[data-en][data-ur]").forEach(element => {
        element.textContent = element.getAttribute(`data-${currentLanguage}`);
    });

    updateCityName();
}

function updateCityName() {
    const selectedOption = citySelect.options[citySelect.selectedIndex];
    const cityName = document.getElementById("cityName");

    if (!selectedOption || !cityName) return;

    const localizedCity = selectedOption.getAttribute(
        currentLanguage === "ur" ? "data-ur" : "data-en"
    );

    cityName.textContent = currentLanguage === "ur"
        ? `${localizedCity}، پنجاب`
        : `${localizedCity}, Punjab`;
}

languageToggle.addEventListener("click", () => {
    currentLanguage = currentLanguage === "ur" ? "en" : "ur";
    translatePage();

    // Reload so dynamically generated text uses the selected language.
    loadCityData();
});

citySelect.addEventListener("change", () => {
    city = citySelect.value;
    selectedCoordinates = cityCoordinates[city];
    updateCityName();

    if (!selectedCoordinates) {
        console.error("No coordinates configured for city:", city);
        return;
    }

    loadCityData();
});

function getAQIColor(aqi) {
    if (!Number.isFinite(aqi)) return "#dddddd";
    if (aqi <= 50) return "#00e400";
    if (aqi <= 100) return "#ffff00";
    if (aqi <= 150) return "#ff7e00";
    if (aqi <= 200) return "#ff0000";
    if (aqi <= 300) return "#8f3f97";
    return "#7e0023";
}

function formatPakistanTime(timestamp) {
    if (typeof timestamp !== "string") return "—";

    const date = new Date(`${timestamp}:00+05:00`);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleTimeString("en-PK", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Karachi"
    });
}

function getAQIInformation(aqi) {
    if (!Number.isFinite(aqi)) {
        return {
            category: currentLanguage === "ur" ? "ڈیٹا دستیاب نہیں" : "Data unavailable",
            face: "⚠️",
            advice: currentLanguage === "ur"
                ? "ہوا کے معیار کی معلومات دستیاب نہیں۔ براہِ کرم بعد میں دوبارہ کوشش کریں۔"
                : "Air quality information is unavailable. Please try again later.",
            icon: "⚠️"
        };
    }

    if (aqi <= 50) {
        return {
            category: currentLanguage === "ur" ? "اچھا" : "Good",
            face: "😊",
            advice: currentLanguage === "ur"
                ? "ہوا کا معیار اچھا ہے۔ معمول کی بیرونی سرگرمیاں جاری رکھ سکتے ہیں۔"
                : "Air quality is good. Enjoy your usual outdoor activities.",
            icon: "🌳"
        };
    }

    if (aqi <= 100) {
        return {
            category: currentLanguage === "ur" ? "درمیانہ" : "Moderate",
            face: "😐",
            advice: currentLanguage === "ur"
                ? "ہوا کا معیار قابلِ قبول ہے، لیکن زیادہ حساس افراد کو طویل وقت باہر رہنے سے گریز کرنا چاہیے۔"
                : "Air quality is acceptable, but unusually sensitive people should limit prolonged outdoor activity.",
            icon: "🙂"
        };
    }

    if (aqi <= 150) {
        return {
            category: currentLanguage === "ur" ? "حساس افراد کے لیے مضر" : "Unhealthy for Sensitive Groups",
            face: "😷",
            advice: currentLanguage === "ur"
                ? "بچوں اور دمے کے مریضوں سمیت حساس افراد کو زیادہ دیر باہر رہنے سے گریز کرنا چاہیے۔"
                : "Sensitive groups, including children and people with asthma, should reduce prolonged outdoor activity.",
            icon: "😷"
        };
    }

    if (aqi <= 200) {
        return {
            category: currentLanguage === "ur" ? "غیر صحت بخش" : "Unhealthy",
            face: "😷",
            advice: currentLanguage === "ur"
                ? "ہر شخص کو زیادہ دیر باہر رہنے سے گریز کرنا چاہیے۔ حساس افراد کو باہر جسمانی مشقت سے بچنا چاہیے۔"
                : "Everyone should reduce prolonged outdoor activity. Sensitive groups should avoid outdoor exertion.",
            icon: "🪟"
        };
    }

    if (aqi <= 300) {
        return {
            category: currentLanguage === "ur" ? "انتہائی غیر صحت بخش" : "Very Unhealthy",
            face: "🤢",
            advice: currentLanguage === "ur"
                ? "جہاں تک ممکن ہو بیرونی سرگرمیوں سے گریز کریں۔ آلودگی کی صورت میں کھڑکیاں بند رکھیں۔"
                : "Avoid outdoor activities as much as possible. Keep windows closed when outdoor air is polluted.",
            icon: "🏠"
        };
    }

    return {
        category: currentLanguage === "ur" ? "خطرناک" : "Hazardous",
        face: "☠️",
        advice: currentLanguage === "ur"
            ? "باہر نکلنے سے گریز کریں۔ گھر کے اندر رہیں، کھڑکیاں بند رکھیں اور مقامی صحت کی ہدایات پر عمل کریں۔"
            : "Avoid outdoor exposure. Stay indoors, keep windows closed, and follow local health guidance.",
        icon: "🚫🏃"
    };
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function setUnavailableState() {
    const unavailable = currentLanguage === "ur" ? "دستیاب نہیں" : "Unavailable";
    const forecastUnavailable = currentLanguage === "ur"
        ? "پیش گوئی دستیاب نہیں"
        : "Forecast unavailable";
    const hourlyUnavailable = currentLanguage === "ur"
        ? "گھنٹہ وار پیش گوئی دستیاب نہیں"
        : "Hourly forecast unavailable";

    setText("aqiValue", unavailable);
    setText("pmValue", unavailable);
    setText("updatedTime", unavailable);
    setText("aqiCategory", currentLanguage === "ur" ? "ڈیٹا دستیاب نہیں" : "Data unavailable");
    setText("aqiAdvice", currentLanguage === "ur"
        ? "ہوا کے معیار کا ڈیٹا لوڈ نہیں ہو سکا۔ براہِ کرم دوبارہ کوشش کریں۔"
        : "Unable to load air quality data. Please try again.");
    setText("aqiAdviceIcon", "⚠️");
    setText("aqiFace", "⚠️");

    setText("bestWindow", forecastUnavailable);
    setText("bestWindowTomorrow", forecastUnavailable);
    setText("lowestPM25", forecastUnavailable);
    setText("lowestPM25Tomorrow", forecastUnavailable);
    setText("hourlyForecast", hourlyUnavailable);
    setText("tomorrowForecast", hourlyUnavailable);
}

function setForecastUnavailable(id) {
    setText(id, currentLanguage === "ur"
        ? "کافی درست پیش گوئی دستیاب نہیں۔"
        : "Not enough valid forecast data.");
}

function getFiniteValues(values) {
    return values.filter(value => Number.isFinite(value));
}

function average(values) {
    return values.reduce((total, value) => total + value, 0) / values.length;
}

function findBestWindow(values, windowLength) {
    let bestAverage = Infinity;
    let bestStart = -1;

    if (values.length < windowLength || windowLength < 1) {
        return { bestAverage, bestStart };
    }

    for (let i = 0; i <= values.length - windowLength; i++) {
        const windowValues = values.slice(i, i + windowLength);

        if (
            windowValues.length !== windowLength ||
            windowValues.some(value => !Number.isFinite(value))
        ) {
            continue;
        }

        const windowAverage = average(windowValues);

        if (windowAverage < bestAverage) {
            bestAverage = windowAverage;
            bestStart = i;
        }
    }

    return { bestAverage, bestStart };
}

function renderHourlyForecast(containerId, times, pmValues, aqiValues, highlightStart, highlightLength) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.textContent = "";

    if (!times.length) {
        container.textContent = currentLanguage === "ur"
            ? "گھنٹہ وار پیش گوئی دستیاب نہیں"
            : "Hourly forecast unavailable";
        return;
    }

    times.forEach((time, index) => {
        const pm25 = pmValues[index];
        const aqi = aqiValues[index];
        const item = document.createElement("div");
        item.className = "hour-item";
        item.style.backgroundColor = getAQIColor(aqi);
        item.style.color = "black";
        item.style.padding = "10px";
        item.style.borderRadius = "6px";

        if (
            highlightStart >= 0 &&
            index >= highlightStart &&
            index < highlightStart + highlightLength
        ) {
            item.style.border = "3px solid black";
        }

        const timeLabel = formatPakistanTime(time);
        const aqiLabel = Number.isFinite(aqi) ? aqi : "—";
        const pmLabel = Number.isFinite(pm25) ? pm25.toFixed(1) : "—";

        // The LTR span keeps times and numbers readable inside Urdu RTL text.
        item.innerHTML = `<span dir="ltr" style="unicode-bidi: isolate;">${timeLabel} — AQI: ${aqiLabel} — PM2.5: ${pmLabel} μg/m³</span>`;
        container.appendChild(item);
    });
}

function renderBestWindow({
    labelId,
    valueId,
    times,
    values,
    startOffset,
    windowLength,
    windowResult,
    labelPrefix
}) {
    const { bestAverage, bestStart } = windowResult;

    if (bestStart < 0 || !Number.isFinite(bestAverage)) {
        setForecastUnavailable(valueId);
        return;
    }

    const startTime = times[bestStart];
    // The end is the timestamp immediately after the last hour in the window.
    let endTime = times[bestStart + windowLength];

    // If the forecast ends at this window's last hour, calculate the end as +1 hour.
    if (!endTime && startTime) {
        // Treat API timestamps as Pakistan wall-clock time, not the computer's local timezone.
        const startDate = new Date(`${startTime}:00Z`);
        startDate.setUTCHours(startDate.getUTCHours() + windowLength);
        endTime = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, "0")}-${String(startDate.getUTCDate()).padStart(2, "0")}T${String(startDate.getUTCHours()).padStart(2, "0")}:${String(startDate.getUTCMinutes()).padStart(2, "0")}`;
    }

    const readableStart = formatPakistanTime(startTime);
    const readableEnd = formatPakistanTime(endTime);
    const averageLabel = currentLanguage === "ur"
        ? ` (PM2.5 کی اوسط: ${bestAverage.toFixed(1)} μg/m³)`
        : ` (Average PM2.5: ${bestAverage.toFixed(1)} μg/m³)`;

    setText(labelId, currentLanguage === "ur"
        ? `بہترین ${windowLength} گھنٹے کا وقت:`
        : `Best ${windowLength}-hour window:`);

    const valueElement = document.getElementById(valueId);
    if (valueElement) {
        valueElement.innerHTML =
            `<span dir="ltr" style="unicode-bidi: isolate;">${readableStart} – ${readableEnd}</span>` +
            averageLabel;
    }
}

// graph 

function drawAQIChart(times, aqiValues) {
    const canvas = document.getElementById("aqiChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const validPoints = times
        .map((time, index) => ({
            time,
            aqi: aqiValues[index]
        }))
        .filter(point => Number.isFinite(point.aqi));

    if (validPoints.length < 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#66798a";
        ctx.fillText("Not enough data to draw the chart.", 12, 30);
        return;
    }

    // Use the displayed canvas size so the graph remains responsive.
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 280);
    const height = Math.max(rect.height, 220);
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const padding = {
        top: 18,
        right: 18,
        bottom: 38,
        left: 42
    };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const highestAQI = Math.max(
        100,
        Math.ceil(Math.max(...validPoints.map(point => point.aqi)) / 50) * 50
    );

    const xPosition = index =>
        padding.left +
        (index / (validPoints.length - 1)) * plotWidth;

    const yPosition = aqi =>
        padding.top + plotHeight - (aqi / highestAQI) * plotHeight;

    // Draw horizontal grid lines and AQI scale labels.
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const gridSteps = 4;

    for (let i = 0; i <= gridSteps; i++) {
        const value = (highestAQI / gridSteps) * i;
        const y = yPosition(value);

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.strokeStyle = "#e5edf2";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#66798a";
        ctx.fillText(
            Math.round(value),
            padding.left - 8,
            y
        );
    }

    // Fill the area underneath the AQI line.
    ctx.beginPath();

    validPoints.forEach((point, index) => {
        const x = xPosition(index);
        const y = yPosition(point.aqi);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.lineTo(xPosition(validPoints.length - 1), padding.top + plotHeight);
    ctx.lineTo(padding.left, padding.top + plotHeight);
    ctx.closePath();

    const fillGradient = ctx.createLinearGradient(
        0,
        padding.top,
        0,
        padding.top + plotHeight
    );

    fillGradient.addColorStop(0, "rgba(12, 152, 163, 0.22)");
    fillGradient.addColorStop(1, "rgba(12, 152, 163, 0.01)");

    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Draw the AQI line.
    ctx.beginPath();

    validPoints.forEach((point, index) => {
        const x = xPosition(index);
        const y = yPosition(point.aqi);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.strokeStyle = "#087e8b";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Draw a point for each hourly reading.
    validPoints.forEach((point, index) => {
        const x = xPosition(index);
        const y = yPosition(point.aqi);

        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.strokeStyle = "#087e8b";
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Label a selection of hours to avoid crowding.
    ctx.fillStyle = "#66798a";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const labelEvery = Math.max(
        1,
        Math.ceil(validPoints.length / 6)
    );

    validPoints.forEach((point, index) => {
        if (
            index % labelEvery !== 0 &&
            index !== validPoints.length - 1
        ) {
            return;
        }

        const hour = point.time.slice(11, 16);

        ctx.fillText(
            hour,
            xPosition(index),
            padding.top + plotHeight + 12
        );
    });
}









async function loadCityData() {
    const requestId = ++latestRequestId;
    const coordinates = selectedCoordinates;

    if (!coordinates) {
        setUnavailableState();
        return;
    }

    try {
        const response = await fetch(buildApiUrl(coordinates));

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        // Ignore results from an older city/language request.
        if (requestId !== latestRequestId) return;
        drawAQIChart(
            data.hourly.time.slice(0, 24),
            data.hourly.us_aqi.slice(0, 24)
        );
        if (
            !data.current ||
            !data.hourly ||
            !Array.isArray(data.hourly.time) ||
            !Array.isArray(data.hourly.pm2_5) ||
            !Array.isArray(data.hourly.us_aqi) ||
            !Number.isFinite(data.current.us_aqi) ||
            !Number.isFinite(data.current.pm2_5) ||
            data.hourly.time.length === 0
        ) {
            throw new Error("Air quality response is missing required data");
        }

        const currentAQI = data.current.us_aqi;
        const currentPM25 = data.current.pm2_5;
        const aqiInfo = getAQIInformation(currentAQI);

        setText("aqiValue", currentAQI);
        setText("pmValue", currentPM25.toFixed(1));

        const updatedDate = new Date(`${data.current.time}:00+05:00`);
        setText("updatedTime", Number.isNaN(updatedDate.getTime())
            ? "—"
            : updatedDate.toLocaleString("en-PK", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Karachi"
            }));

        setText("aqiCategory", aqiInfo.category);
        setText("aqiFace", aqiInfo.face);
        setText("aqiAdvice", aqiInfo.advice);
        setText("aqiAdviceIcon", aqiInfo.icon);

        const times = data.hourly.time;
        const pmValues = data.hourly.pm2_5;
        const aqiValues = data.hourly.us_aqi;

        const currentHour = data.current.time.slice(0, 13);
        const foundCurrentIndex = times.findIndex(time => time.slice(0, 13) === currentHour);
        const todayStartIndex = foundCurrentIndex >= 0 ? foundCurrentIndex : 0;
        const todayDate = times[todayStartIndex].slice(0, 10);

        let endOfTodayIndex = times.findIndex(
            (time, index) => index > todayStartIndex && time.slice(0, 10) !== todayDate
        );
        if (endOfTodayIndex === -1) endOfTodayIndex = times.length;

        const tomorrowStartIndex = times.findIndex(time => time.slice(0, 10) > todayDate);

        const todayTimes = times.slice(todayStartIndex, endOfTodayIndex);
        const todayPM25 = pmValues.slice(todayStartIndex, endOfTodayIndex);
        const validTodayPM25 = getFiniteValues(todayPM25);

        if (validTodayPM25.length) {
            setText("lowestPM25", `${Math.min(...validTodayPM25).toFixed(1)} μg/m³`);
        } else {
            setForecastUnavailable("lowestPM25");
        }

        const todayWindowLength = Math.min(3, todayPM25.length);
        const todayWindow = findBestWindow(todayPM25, todayWindowLength);

        renderBestWindow({
            labelId: "bestWindowLabel",
            valueId: "bestWindow",
            times: todayTimes,
            values: todayPM25,
            startOffset: todayStartIndex,
            windowLength: todayWindowLength,
            windowResult: todayWindow
        });

        renderHourlyForecast(
            "hourlyForecast",
            todayTimes,
            todayPM25,
            aqiValues.slice(todayStartIndex, endOfTodayIndex),
            todayWindow.bestStart,
            todayWindowLength
        );

        if (tomorrowStartIndex === -1) {
            setForecastUnavailable("lowestPM25Tomorrow");
            setForecastUnavailable("bestWindowTomorrow");
            renderHourlyForecast("tomorrowForecast", [], [], [], -1, 0);
            return;
        }

        const tomorrowDate = times[tomorrowStartIndex].slice(0, 10);
        let endOfTomorrowIndex = times.findIndex(
            (time, index) => index > tomorrowStartIndex && time.slice(0, 10) !== tomorrowDate
        );
        if (endOfTomorrowIndex === -1) endOfTomorrowIndex = times.length;

        const tomorrowTimes = times.slice(tomorrowStartIndex, endOfTomorrowIndex);
        const tomorrowPM25 = pmValues.slice(tomorrowStartIndex, endOfTomorrowIndex);
        const tomorrowAQI = aqiValues.slice(tomorrowStartIndex, endOfTomorrowIndex);
        const validTomorrowPM25 = getFiniteValues(tomorrowPM25);

        if (validTomorrowPM25.length) {
            setText("lowestPM25Tomorrow", `${Math.min(...validTomorrowPM25).toFixed(1)} μg/m³`);
        } else {
            setForecastUnavailable("lowestPM25Tomorrow");
        }

        const tomorrowWindowLength = 3;
        const tomorrowWindow = findBestWindow(tomorrowPM25, tomorrowWindowLength);

        renderBestWindow({
            labelId: "bestWindowTomorrowLabel",
            valueId: "bestWindowTomorrow",
            times: tomorrowTimes,
            values: tomorrowPM25,
            startOffset: tomorrowStartIndex,
            windowLength: tomorrowWindowLength,
            windowResult: tomorrowWindow
        });

        renderHourlyForecast(
            "tomorrowForecast",
            tomorrowTimes,
            tomorrowPM25,
            tomorrowAQI,
            tomorrowWindow.bestStart,
            tomorrowWindowLength
        );
    } catch (error) {
        if (requestId !== latestRequestId) return;
        console.error("Error loading air quality data:", error);
        setUnavailableState();
    }
}


////whatsapp shareable card

function generateSmogCard() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1080;
    canvas.height = 1080;

    // Background
    ctx.fillStyle = "#f4f7fb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = "#123047";
    ctx.fillRect(0, 0, canvas.width, 220);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 54px Arial";
    ctx.fillText("Punjab Smog Dashboard", 60, 100);

    ctx.font = "32px Arial";
    ctx.fillText("Air Quality Report", 60, 160);

    // City name
    ctx.fillStyle = "#123047";
    ctx.font = "bold 44px Arial";
    ctx.fillText(
        document.getElementById("cityName").textContent,
        60,
        300
    );

    // AQI label
    ctx.font = "32px Arial";
    ctx.fillText("Current US AQI", 60, 390);

    // AQI value

    const aqiText = document.getElementById("aqiValue").textContent.trim();
    const aqi = Number(aqiText);

    if (aqiText === "" || !Number.isFinite(aqi) || aqi < 0) {
        ctx.fillStyle = "#123047";
    } else if (aqi <= 50) {
        ctx.fillStyle = "#00a651";
    } else if (aqi <= 100) {
        ctx.fillStyle = "#f5c400";
    } else if (aqi <= 150) {
        ctx.fillStyle = "#f07824";
    } else if (aqi <= 200) {
        ctx.fillStyle = "#e53935";
    } else if (aqi <= 300) {
        ctx.fillStyle = "#8e44ad";
    } else {
        ctx.fillStyle = "#7e0023";
    }
    ctx.font = "bold 150px Arial";
    ctx.fillText(
        document.getElementById("aqiValue").textContent,
        60,
        560
    );


    // AQI category
    ctx.fillStyle = "#123047";
    ctx.font = "bold 38px Arial";
    ctx.fillText(
        document.getElementById("aqiCategory").textContent,
        60,
        640,
        950
    );

    // PM2.5
    ctx.font = "34px Arial";
    ctx.fillText(
        "PM2.5: " +
        document.getElementById("pmValue").textContent +
        " µg/m³",
        60,
        740
    );

    // Update time
    ctx.font = "26px Arial";
    ctx.fillText(
        "Updated: " +
        document.getElementById("updatedTime").textContent,
        60,
        820,
        950
    );

    // Footer
    ctx.fillStyle = "#456477";
    ctx.font = "26px Arial";
    ctx.fillText(
        "Check air quality before going outside.",
        60,
        950
    );

    return canvas;
}







const shareCardButton = document.getElementById("shareCardButton");
const whatsappButton = document.getElementById("whatsappButton");

// Button 1: Download the smog card image
shareCardButton.addEventListener("click", async function () {
    shareCardButton.disabled = true;

    try {
        const canvas = generateSmogCard();

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error("Could not create the PNG image."));
                }
            }, "image/png");
        });

        const imageURL = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");

        downloadLink.href = imageURL;
        downloadLink.download = "punjab-smog-card.png";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        setTimeout(() => URL.revokeObjectURL(imageURL), 60000);
    } catch (error) {
        console.error("Smog card download failed:", error);
        alert("We couldn't download the smog card. Please try again.");
    } finally {
        shareCardButton.disabled = false;
    }
});


// Button 2: Open WhatsApp with the report text
whatsappButton.addEventListener("click", function () {
    const city = document.getElementById("cityName").textContent.trim();
    const aqi = document.getElementById("aqiValue").textContent.trim();
    const category = document.getElementById("aqiCategory").textContent.trim();
    const pm25 = document.getElementById("pmValue").textContent.trim();
    const updatedTime = document.getElementById("updatedTime").textContent.trim();

    const message =
        "Punjab Smog & Fog Dashboard\n\n" +
        `City: ${city}\n` +
        `US AQI: ${aqi} (${category})\n` +
        `PM2.5: ${pm25}\n` +
        `${updatedTime}\n\n` +
        "Check air quality before going outside.";

    const whatsappURL =
        "https://wa.me/?text=" + encodeURIComponent(message);

    window.open(whatsappURL, "_blank");
});







// Initial page setup and first data request.
translatePage();
updateCityName();
loadCityData();