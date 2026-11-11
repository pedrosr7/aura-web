(function (root) {
  var api = {
    TEXTS: { es: {}, en: {} },
    languageOf: function () { return ""; },
    platformOf: function () { return ""; },
    viewFor: function () { return ""; },
    storesFor: function () { return []; },
    reopenLink: function () { return ""; },
    webLink: function () { return ""; },
    qrMatrix: function () { return []; },
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PlanBridge = api;
})(this);
