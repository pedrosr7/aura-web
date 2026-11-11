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

  // An iPad asks for the desktop site by default and says it is a Mac, but a Mac has no touch screen.
  function platformOf(userAgent, touchPoints) {
    var agent = String(userAgent || "");
    if (/iPhone|iPad|iPod/i.test(agent)) return "ios";
    if (/Android/i.test(agent)) return "android";
    if (/Macintosh/.test(agent) && touchPoints > 1) return "ios";
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

  // Dark modules as true, or null when the text is too long for a QR code.
  function qrMatrix(text) {
    try {
      var code = qrcode(0, "M");
      code.addData(text);
      code.make();
      var size = code.getModuleCount();
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

  return {
    TEXTS: TEXTS,
    languageOf: languageOf,
    platformOf: platformOf,
    viewFor: viewFor,
    storesFor: storesFor,
    reopenLink: reopenLink,
    webLink: webLink,
    qrMatrix: qrMatrix,
  };
});
