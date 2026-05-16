(function () {
  const WHATSAPP_NUMBER = "212702430945";
  const TOTAL_STEPS = 4;
  const STEP_LABELS = ["Service", "Véhicule", "Rendez-vous", "Confirmation"];

  const PRICES = {
    citadine: { express: 149, pro: 250, proPlus: 650 },
    berline: { express: 199, pro: 300, proPlus: 750 },
    suv: { express: 249, pro: 350, proPlus: 850 },
    suvLuxe: { express: 299, pro: 400, proPlus: 950 },
    minibus: { express: 349, pro: 450, proPlus: 1200 }
  };

  const PACK_MAP = {
    "Lavage Express": "express",
    "Lavage Pro": "pro",
    "Lavage Pro Plus": "proPlus"
  };

  const VEHICLE_LABELS = {
    citadine: "Citadine",
    berline: "Berline",
    suv: "SUV / 4x4",
    suvLuxe: "SUV 6 places",
    minibus: "Minibus / Van"
  };

  const wizard = document.getElementById("bookingWizard");
  if (!wizard) return;

  const form = document.getElementById("bookingForm");
  const steps = wizard.querySelectorAll("[data-booking-step]");
  const progressSegments = wizard.querySelectorAll("#bookingProgressSegments [data-segment]");
  const stepLabelEl = document.getElementById("bookingStepLabel");
  const recapEl = document.getElementById("bookingRecap");
  const successEl = document.getElementById("bookingSuccess");
  const successWa = document.getElementById("bookingSuccessWa");
  const restartBtn = document.getElementById("bookingRestart");
  const confirmBtn = document.getElementById("bookingConfirm");
  const priceHint = document.getElementById("bookingPriceHint");
  const dateInput = document.getElementById("bookingDate");
  const geoLat = document.getElementById("bookingGeoLat");
  const geoLng = document.getElementById("bookingGeoLng");
  const geoAcc = document.getElementById("bookingGeoAcc");
  const geoAddress = document.getElementById("bookingAddress");
  const geoStatus = document.getElementById("bookingGeoStatus");
  const geoDisplay = document.getElementById("bookingGeoDisplay");
  const geoRetry = document.getElementById("bookingGeoRetry");
  const geoPanel = document.getElementById("bookingGeoPanel");
  const quartierPanel = document.getElementById("bookingQuartierPanel");
  const quartierSelect = document.getElementById("bookingQuartier");

  let currentStep = 1;
  let geoRequestActive = false;

  const hasGeoPosition = () => !!(geoLat?.value && geoLng?.value);

  const getLieuMode = () => {
    const el = form.querySelector('input[name="lieuMode"]:checked');
    return el?.value === "quartier" ? "quartier" : "geo";
  };

  const setLieuMode = (mode, opts = {}) => {
    const { requestGeo = false } = opts;
    const isGeo = mode !== "quartier";
    if (geoPanel) geoPanel.hidden = !isGeo;
    if (quartierPanel) quartierPanel.hidden = isGeo;
    if (isGeo) {
      showError("quartier", false);
      if (requestGeo && !hasGeoPosition() && !geoRequestActive) requestGeoLocation();
    } else {
      showError("geo", false);
    }
  };

  const getMapsUrl = (lat, lng) => `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;

  const setGeoStatus = (text, state) => {
    if (!geoStatus) return;
    geoStatus.textContent = text;
    geoStatus.classList.remove("is-error", "is-ok");
    if (state) geoStatus.classList.add(state);
  };

  const renderGeoDisplay = (lat, lng, acc, label) => {
    if (!geoDisplay) return;
    const mapsUrl = getMapsUrl(lat, lng);
    const lines = [
      label ? `<strong>${label.replace(/</g, "&lt;")}</strong>` : "",
      `Latitude : ${Number(lat).toFixed(6)}`,
      `Longitude : ${Number(lng).toFixed(6)}`,
      acc ? `Précision : ~${Math.round(Number(acc))} m` : "",
      `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">Voir sur Google Maps</a>`
    ].filter(Boolean);
    geoDisplay.innerHTML = lines.join("<br>");
    geoDisplay.hidden = false;
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&accept-language=fr`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) return "";
      const data = await res.json();
      return typeof data.display_name === "string" ? data.display_name : "";
    } catch {
      return "";
    }
  };

  const applyGeoPosition = async (lat, lng, acc) => {
    if (geoLat) geoLat.value = String(lat);
    if (geoLng) geoLng.value = String(lng);
    if (geoAcc) geoAcc.value = String(acc);
    setGeoStatus("Position enregistrée.", "is-ok");
    showError("geo", false);
    const label = await reverseGeocode(lat, lng);
    if (geoAddress) geoAddress.value = label || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    renderGeoDisplay(lat, lng, acc, geoAddress?.value || "");
  };

  const requestGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Géolocalisation non disponible sur ce navigateur.", "is-error");
      if (getLieuMode() === "geo") showError("geo", true);
      return;
    }
    if (geoRequestActive) return;
    geoRequestActive = true;
    if (geoRetry) geoRetry.disabled = true;
    setGeoStatus("Recherche de votre position…", null);
    if (geoDisplay) geoDisplay.hidden = true;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        geoRequestActive = false;
        if (geoRetry) geoRetry.disabled = false;
        await applyGeoPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      (err) => {
        geoRequestActive = false;
        if (geoRetry) geoRetry.disabled = false;
        let msg = "Impossible d'obtenir la position.";
        if (err.code === 1) msg = "Autorisez la localisation dans votre navigateur.";
        else if (err.code === 2) msg = "Position indisponible.";
        else if (err.code === 3) msg = "Délai dépassé, réessayez.";
        setGeoStatus(msg, "is-error");
        if (getLieuMode() === "geo") showError("geo", true);
      },
      { enableHighAccuracy: true, timeout: 28000, maximumAge: 0 }
    );
  };

  const resetGeo = () => {
    if (geoLat) geoLat.value = "";
    if (geoLng) geoLng.value = "";
    if (geoAcc) geoAcc.value = "";
    if (geoAddress) geoAddress.value = "";
    if (geoDisplay) {
      geoDisplay.hidden = true;
      geoDisplay.innerHTML = "";
    }
    setGeoStatus("Recherche de votre position…", null);
    showError("geo", false);
  };

  const getLocationSummary = () => {
    const lat = geoLat?.value || "";
    const lng = geoLng?.value || "";
    const label = geoAddress?.value?.trim() || "";
    if (!lat || !lng) return { text: "-", mapsUrl: "" };
    return {
      text: label || `${lat}, ${lng}`,
      mapsUrl: getMapsUrl(lat, lng),
      lat,
      lng,
      acc: geoAcc?.value || ""
    };
  };

  const getPack = () => {
    const el = form.querySelector('input[name="pack"]:checked');
    return el ? el.value : "";
  };

  const getVehicle = () => {
    const el = form.querySelector('input[name="vehicle"]:checked');
    return el ? el.value : "";
  };

  const getPrice = () => {
    const pack = getPack();
    const vehicle = getVehicle();
    const packKey = PACK_MAP[pack];
    if (!packKey || !vehicle || !PRICES[vehicle]) return null;
    return PRICES[vehicle][packKey];
  };

  const updatePackPriceLabels = () => {
    const vehicle = getVehicle() || "citadine";
    const prices = PRICES[vehicle] || PRICES.citadine;
    wizard.querySelectorAll(".booking-pack").forEach((card) => {
      const input = card.querySelector('input[name="pack"]');
      const label = card.querySelector("[data-price-label]");
      if (!input || !label) return;
      const key = PACK_MAP[input.value];
      if (key && prices[key]) label.textContent = `dès ${prices[key]} MAD`;
    });
  };

  const showPriceHint = () => {
    const price = getPrice();
    if (!priceHint) return;
    if (price && getPack() && getVehicle()) {
      priceHint.hidden = false;
      priceHint.textContent = `Tarif estimé pour votre véhicule : ${price} MAD`;
    } else {
      priceHint.hidden = true;
    }
  };

  const updateProgressUI = (step) => {
    if (stepLabelEl) {
      stepLabelEl.textContent = `Étape ${step}/${TOTAL_STEPS} — ${STEP_LABELS[step - 1]}`;
    }
    progressSegments.forEach((seg) => {
      const n = Number(seg.dataset.segment);
      seg.classList.toggle("is-active", n === step);
      seg.classList.toggle("is-done", n < step);
    });
  };

  const setStep = (step) => {
    currentStep = step;
    steps.forEach((panel) => {
      const n = Number(panel.dataset.bookingStep);
      panel.hidden = n !== step;
      panel.classList.toggle("is-active", n === step);
    });
    updateProgressUI(step);
    if (step === 3) {
      initBookingDateLimits();
      setLieuMode(getLieuMode(), { requestGeo: true });
    }
    if (step === 4) fillRecap();
    const section = document.getElementById("reservation");
    const target = section || wizard;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showError = (field, show) => {
    const msg = wizard.querySelector(`[data-error-for="${field}"]`);
    if (msg) msg.classList.toggle("hidden", !show);
  };

  const validateStep = (step) => {
    let ok = true;
    if (step === 1) {
      ok = !!getPack();
      showError("pack", !ok);
    }
    if (step === 2) {
      ok = !!getVehicle();
      showError("vehicle", !ok);
    }
    if (step === 3) {
      const mode = getLieuMode();
      const geoOk = hasGeoPosition();
      const qOk = quartierSelect && quartierSelect.value;
      const dateOk = dateInput && dateInput.value;
      const slotOk = form.querySelector('input[name="slot"]:checked');
      const lieuOk = mode === "geo" ? geoOk : qOk;
      showError("geo", mode === "geo" && !geoOk);
      showError("quartier", mode === "quartier" && !qOk);
      showError("date", !dateOk);
      showError("slot", !slotOk);
      ok = lieuOk && dateOk && slotOk;
    }
    if (step === 4) {
      const name = document.getElementById("bookingName");
      const phone = document.getElementById("bookingPhone");
      const nameOk = name && name.value.trim().length > 1;
      const phoneRaw = phone ? phone.value.replace(/\D/g, "") : "";
      const phoneOk = phoneRaw.length >= 9;
      showError("name", !nameOk);
      showError("phone", !phoneOk);
      ok = nameOk && phoneOk;
    }
    return ok;
  };

  const toLocalDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDateFr = (iso) => {
    if (!iso) return "-";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return "-";
    return `${d}/${m}/${y}`;
  };

  const initBookingDateLimits = () => {
    if (!dateInput) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const max = new Date(today);
    max.setDate(max.getDate() + 60);
    dateInput.min = toLocalDateString(today);
    dateInput.max = toLocalDateString(max);
    if (!dateInput.value) dateInput.value = toLocalDateString(today);
  };

  const buildWhatsAppBody = () => {
    const pack = getPack();
    const vehicle = getVehicle();
    const price = getPrice();
    const mode = getLieuMode();
    const loc = getLocationSummary();
    const quartier = quartierSelect?.value || "";
    const date = dateInput.value;
    const slot = form.querySelector('input[name="slot"]:checked').value;
    const name = document.getElementById("bookingName").value.trim();
    const phone = document.getElementById("bookingPhone").value.trim();
    const note = document.getElementById("bookingNote").value.trim();

    const gpsBlock =
      mode === "geo" && loc.mapsUrl
        ? [
            "--- Position GPS ---",
            loc.text,
            `Lien carte: ${loc.mapsUrl}`,
            loc.lat && loc.lng ? `Coordonnées: ${loc.lat}, ${loc.lng}` : "",
            loc.acc ? `Précision (~m): ${loc.acc}` : ""
          ]
            .filter(Boolean)
            .join("\n")
        : "";

    const lieuBlock =
      mode === "quartier"
        ? `Quartier: ${quartier}`
        : gpsBlock
          ? `Localisation: GPS automatique\n${gpsBlock}`
          : "";

    return [
      "Bonjour, je souhaite réserver un lavage (Lavage Lux Marrakech).",
      "",
      `Formule: ${pack}`,
      `Véhicule: ${VEHICLE_LABELS[vehicle] || vehicle}`,
      price ? `Tarif estimé: ${price} MAD` : "",
      "",
      `Date: ${formatDateFr(date)}`,
      `Créneau: ${slot}`,
      "",
      lieuBlock,
      "",
      `Nom: ${name}`,
      `Téléphone: ${phone}`,
      note ? `Note: ${note}` : ""
    ]
      .filter(Boolean)
      .join("\n");
  };

  const fillRecap = () => {
    if (!recapEl) return;
    const pack = getPack();
    const vehicle = getVehicle();
    const price = getPrice();
    const mode = getLieuMode();
    const loc = getLocationSummary();
    const quartier = quartierSelect?.value || "";
    const date = formatDateFr(dateInput.value);
    const slot = form.querySelector('input[name="slot"]:checked')?.value || "-";
    const name = document.getElementById("bookingName").value.trim();
    const phone = document.getElementById("bookingPhone").value.trim();
    const note = document.getElementById("bookingNote").value.trim();
    let lieuHtml = "-";
    if (mode === "geo" && loc.mapsUrl) {
      lieuHtml = `GPS · ${loc.text.replace(/</g, "&lt;")}<br><a href="${loc.mapsUrl}" target="_blank" rel="noopener noreferrer">Google Maps</a>`;
    } else if (mode === "quartier" && quartier) {
      lieuHtml = `Quartier · ${quartier.replace(/</g, "&lt;")}`;
    }

    recapEl.innerHTML = `
      <dl>
        <dt>Formule</dt><dd>${pack}</dd>
        <dt>Véhicule</dt><dd>${VEHICLE_LABELS[vehicle] || vehicle}</dd>
        <dt>Date &amp; heure</dt><dd>${date} · ${slot}</dd>
        <dt>Lieu</dt><dd>${lieuHtml}</dd>
        <dt>Contact</dt><dd>${name} · ${phone}</dd>
        ${note ? `<dt>Note</dt><dd>${note.replace(/</g, "&lt;")}</dd>` : ""}
      </dl>
      ${price ? `<p class="booking-recap__total">Total estimé : ${price} MAD</p><p class="booking-recap-note">Paiement sur place · devis final selon état du véhicule</p>` : ""}
    `;
  };

  const openWhatsApp = () => {
    const body = buildWhatsAppBody();
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
  };

  wizard.querySelectorAll("[data-booking-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
      if (currentStep < TOTAL_STEPS) setStep(currentStep + 1);
    });
  });

  wizard.querySelectorAll("[data-booking-prev]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 1) setStep(currentStep - 1);
    });
  });

  form.querySelectorAll('input[name="pack"], input[name="vehicle"]').forEach((el) => {
    el.addEventListener("change", () => {
      updatePackPriceLabels();
      showPriceHint();
    });
  });

  if (geoRetry) {
    geoRetry.addEventListener("click", () => requestGeoLocation());
  }

  form.querySelectorAll('input[name="lieuMode"]').forEach((el) => {
    el.addEventListener("change", () => {
      const requestGeo = currentStep === 3;
      setLieuMode(getLieuMode(), { requestGeo });
    });
  });

  if (quartierSelect) {
    quartierSelect.addEventListener("change", () => showError("quartier", false));
  }

  initBookingDateLimits();
  setLieuMode("geo");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!validateStep(4)) {
        setStep(4);
        return;
      }
      const url = openWhatsApp();
      window.open(url, "_blank", "noopener,noreferrer");
      if (successWa) successWa.href = url;
      form.hidden = true;
      if (successEl) successEl.hidden = false;
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      form.reset();
      form.hidden = false;
      if (successEl) successEl.hidden = true;
      wizard.querySelectorAll(".booking-field-error").forEach((e) => e.classList.add("hidden"));
      resetGeo();
      const geoModeInput = form.querySelector('input[name="lieuMode"][value="geo"]');
      if (geoModeInput) geoModeInput.checked = true;
      setLieuMode("geo");
      updatePackPriceLabels();
      setStep(1);
    });
  }

  const bookingYear = document.getElementById("bookingYear");
  if (bookingYear) bookingYear.textContent = String(new Date().getFullYear());

  updatePackPriceLabels();
  setStep(1);
})();
