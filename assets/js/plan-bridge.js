// The logic of /plan, the page the plan link lands on. Plain functions, so `node --test` reads them as they are.
// The page passes the answers through untouched: it never reads them, the app does (PlanLink.kt, in the Aura repo).
(function (root, factory) {
  var node = typeof module === "object" && module.exports;
  var api = factory(node ? require("./qrcode.js") : root.qrcode);
  if (node) module.exports = api;
  else root.PlanBridge = api;
})(this, function (qrcode) {
  "use strict";

  var SITE_LINK = "https://aura.pampaiter.com/plan";
  var APP_LINK = "aura://plan";
  var APP_STORE = "https://apps.apple.com/us/app/aura-ai-training-coach/id6773849897";
  var GOOGLE_PLAY = "https://play.google.com/store/apps/details?id=com.pampa.aura";

  var TEXTS = {
    es: {
      label: "Prepárala con Aura",
      titleStores: "Tu plan te espera en Aura",
      subStores: "Instala Aura y vuelve a abrir este enlace para seguir con tu plan.",
      titleQr: "Ábrelo en tu móvil",
      subQr: "Escanea el código con la cámara del móvil. Si ya tienes Aura, se abre directo; si no, te lleva a la tienda.",
      installedHint: "¿Ya la instalaste?",
      reopen: "Vuelve a abrirla aquí",
      appStore: "Descargar en App Store",
      playStore: "Descargar en Google Play",
      qrLabel: "Código QR con el enlace a tu plan",
    },
    en: {
      label: "Get ready with Aura",
      titleStores: "Your plan is waiting in Aura",
      subStores: "Install Aura, then open this link again to carry on with your plan.",
      titleQr: "Open it on your phone",
      subQr: "Scan the code with your phone's camera. If you already have Aura it opens right away; if not, it takes you to the store.",
      installedHint: "Already installed?",
      reopen: "Open it here",
      appStore: "Download on the App Store",
      playStore: "Get it on Google Play",
      qrLabel: "QR code with the link to your plan",
    },
  };

  // Spanish for a browser in Spanish, English for the rest: the same rule as the share and team landing.
  function languageOf(browserLanguage) {
    return /^es(-|_|$)/i.test(String(browserLanguage || "")) ? "es" : "en";
  }

  // A tablet asks for the desktop site by default and says it is a computer, but a computer rarely has a touch screen:
  // an iPad says it is a Mac, and an Android tablet says it is Linux. A Linux laptop with a touch screen gets the stores.
  function platformOf(userAgent, touchPoints) {
    var agent = String(userAgent || "");
    if (/iPhone|iPad|iPod/i.test(agent)) return "ios";
    if (/Android/i.test(agent)) return "android";
    if (/Macintosh/.test(agent) && touchPoints > 1) return "ios";
    if (/Linux/.test(agent) && touchPoints > 1) return "android";
    return "desktop";
  }

  function viewFor(platform) {
    return platform === "desktop" ? "qr" : "stores";
  }

  function storesFor(platform) {
    var appStore = { id: "appstore", url: APP_STORE, textKey: "appStore" };
    var googlePlay = { id: "playstore", url: GOOGLE_PLAY, textKey: "playStore" };
    if (platform === "ios") return [appStore, googlePlay];
    if (platform === "android") return [googlePlay, appStore];
    return [];
  }

  // What follows the address, as the browser wrote it. A fragment never goes with it, and anything that is not a
  // query is dropped, so neither link can be turned into another scheme or another site.
  function queryOf(search) {
    var query = typeof search === "string" ? search : "";
    var fragment = query.indexOf("#");
    if (fragment >= 0) query = query.slice(0, fragment);
    return query.charAt(0) === "?" && query.length > 1 ? query : "";
  }

  // The app's own link: iOS does not hand a link of the page's own site to the app, so «already installed» uses this.
  function reopenLink(search) {
    return APP_LINK + queryOf(search);
  }

  function webLink(search) {
    return SITE_LINK + queryOf(search);
  }

  // The QR box is 252 px wide, so past this many modules a module is under 3 px and a phone camera loses it.
  var MAX_QR_MODULES = 85;
  var QUIET_ZONE = 4;

  // Dark modules as true, or null when the text is too long for a QR code that can be scanned from a screen.
  function qrMatrix(text) {
    try {
      var code = qrcode(0, "M");
      code.addData(text);
      code.make();
      var size = code.getModuleCount();
      if (size > MAX_QR_MODULES) return null;
      var rows = [];
      for (var row = 0; row < size; row++) {
        var cells = [];
        for (var column = 0; column < size; column++) cells.push(code.isDark(row, column));
        rows.push(cells);
      }
      return rows;
    } catch (tooLong) {
      return null;
    }
  }

  // One path for all the dark modules, each a 1 by 1 square, inside a quiet zone of the given width.
  function qrPath(matrix, quiet) {
    var path = "";
    matrix.forEach(function (row, y) {
      row.forEach(function (dark, x) {
        if (dark) path += "M" + (x + quiet) + " " + (y + quiet) + "h1v1h-1z";
      });
    });
    return path;
  }

  function drawQr(doc, matrix, label) {
    var size = matrix.length + QUIET_ZONE * 2;
    var namespace = "http://www.w3.org/2000/svg";
    var svg = doc.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
    svg.setAttribute("shape-rendering", "crispEdges");
    var background = doc.createElementNS(namespace, "rect");
    background.setAttribute("width", size);
    background.setAttribute("height", size);
    background.setAttribute("fill", "#fff");
    var modules = doc.createElementNS(namespace, "path");
    modules.setAttribute("d", qrPath(matrix, QUIET_ZONE));
    modules.setAttribute("fill", "#000");
    svg.appendChild(background);
    svg.appendChild(modules);
    doc.getElementById("qr-code").appendChild(svg);
  }

  // Paints the page for what the browser says: its language, its system, and the query it opened with.
  function render(doc, environment) {
    var language = languageOf(environment.language);
    var texts = TEXTS[language];
    var platform = platformOf(environment.userAgent, environment.maxTouchPoints);
    var view = viewFor(platform);
    var matrix = view === "qr" ? qrMatrix(webLink(environment.search)) : null;
    // A computer with a link too long for a QR code gets the stores, and nothing to reopen: no app answers there.
    var tooLongForQr = view === "qr" && !matrix;
    if (tooLongForQr) {
      view = "stores";
      platform = "ios";
    }

    doc.documentElement.lang = language;
    Array.prototype.forEach.call(doc.querySelectorAll("[data-i18n]"), function (element) {
      element.textContent = texts[element.getAttribute("data-i18n")];
    });

    if (view === "stores") {
      var stores = storesFor(platform);
      ["store-first", "store-second"].forEach(function (id, index) {
        var button = doc.getElementById(id);
        button.setAttribute("href", stores[index].url);
        button.textContent = texts[stores[index].textKey];
      });
      doc.getElementById("reopen").setAttribute("href", reopenLink(environment.search));
      doc.getElementById("reopen-box").hidden = tooLongForQr;
      doc.getElementById("stores").hidden = false;
    } else {
      drawQr(doc, matrix, texts.qrLabel);
      doc.getElementById("qr").hidden = false;
    }
  }

  return {
    TEXTS: TEXTS,
    languageOf: languageOf,
    platformOf: platformOf,
    viewFor: viewFor,
    storesFor: storesFor,
    reopenLink: reopenLink,
    webLink: webLink,
    qrMatrix: qrMatrix,
    qrPath: qrPath,
    render: render,
  };
});
