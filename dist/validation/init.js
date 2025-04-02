"use strict";

exports.__esModule = true;
exports.initForms = exports.initForm = void 0;
var _FormValidation = require("./FormValidation.js");
var initForm = exports.initForm = function initForm(form) {
  if (form.validator) {
    form.validator.init();
  } else {
    var val = new _FormValidation.FormValidation(form);
    if (val.fields.length > 0) {
      val.setUpEvents();
      form.validator = val;
    }
  }
};
var initForms = exports.initForms = function initForms() {
  var forms = document.querySelectorAll('form');
  for (var form of forms) {
    initForm(form);
  }
  document.addEventListener('form-updated', function (e) {
    var forms = [...e.target.querySelectorAll('form')];
    if (e.target.tagName.toLowerCase() == 'form') {
      forms.push(e.target);
    }
    for (var _form of forms) {
      initForm(_form);
    }
  });
};