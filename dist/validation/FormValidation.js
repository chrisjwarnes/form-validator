"use strict";

exports.__esModule = true;
exports.updatedEvent = exports.addRule = exports.FormValidation = void 0;
var _asyncValidator = _interopRequireDefault(require("async-validator"));
var _submitAjaxForm = require("./submitAjaxForm");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var ruleDefinitions = [];
var inputValidClass = 'input-validation-valid';
var inputErrorClass = 'input-validation-error';
var summaryValidClass = 'validation-summary-valid';
var summaryErrorClass = 'validation-summary-errors';
var messageValidClass = 'field-validation-valid';
var messageErrorClass = 'field-validation-error';
var updatedEvent = exports.updatedEvent = 'form-updated';
var addRule = exports.addRule = function addRule(attribute, rule, fireOnlyOnSubmit) {
  if (fireOnlyOnSubmit === void 0) {
    fireOnlyOnSubmit = false;
  }
  ruleDefinitions.push({
    attribute,
    rule,
    fireOnlyOnSubmit
  });
  document.dispatchEvent(new CustomEvent(updatedEvent));
};
class FormValidation {
  constructor(form) {
    this.form = form;
    this.init();
  }
  init() {
    this.fields = this.form.querySelectorAll('[data-val="true"]');
    this.summary = this.form.querySelector('[data-valmsg-summary="true"]');
    this.nonce = Math.random().toString(36).slice(2);
    this.initRules();
  }
  setUpEvents() {
    this.form.noValidate = true;
    if (!this.form.dataset.ajax) {
      this.form.addEventListener('submit', e => {
        if (e.submitter) {
          e.submitter.disabled = true;
        }
        if (!this.form.dataset.valid) {
          e.preventDefault();
          this.validateForm().then(() => {
            this.form.dataset.valid = true;
            this.form.submit();
          }).catch(function (errors, fields) {
            e.preventDefault();
            if (e.submitter) {
              e.submitter.disabled = false;
            }
          });
        }
      });
    } else if (this.form.dataset.ajax === 'auto' || this.form.dataset.ajax === 'true') {
      this.form.addEventListener('submit', e => {
        if (e.submitter) {
          e.submitter.disabled = true;
        }
        if (!this.form.dataset.valid) {
          e.preventDefault();
          this.validateForm().then(() => {
            this.form.dataset.valid = true;
            (0, _submitAjaxForm.submitAjaxForm)(this.form);
          }).catch(function (errors, fields) {
            e.preventDefault();
            if (e.submitter) {
              e.submitter.disabled = false;
            }
          });
        }
      });
    }
    this.form.addEventListener('blur', e => {
      try {
        this.validateField(e.target);
      } catch (err) {}
    }, {
      passive: true
    });
    this.form.addEventListener('input', e => {
      try {
        this.validateField(e.target);
      } catch (err) {}
    }, {
      passive: true
    });
    this.form.addEventListener('change', e => {
      try {
        this.validateField(e.target);
      } catch (err) {}
    }, {
      passive: true
    });
  }
  initRules() {
    var definition = {};
    var blurDefinition = {};
    for (var field of this.fields) {
      var rules = this.setupRules(field);
      if (rules) {
        definition[field.name] = rules;
      }
      var blurRules = this.setupBlurRules(field);
      if (blurRules) {
        blurDefinition[field.name] = rules;
      }
    }
    this.blurValidator = new _asyncValidator.default(blurDefinition);
    this.validator = new _asyncValidator.default(definition);
  }
  setupRules(field) {
    var rules = [];
    for (var rule of ruleDefinitions) {
      if (field.dataset[rule.attribute]) {
        var newRule = rule.rule(field);
        if (newRule) {
          rules.push(newRule);
        }
      }
    }
    if (rules.length > 0 & field.name.length > 0) {
      return rules.length > 1 ? rules : rules[0];
    }
  }
  setupBlurRules(field) {
    var rules = [];
    for (var rule of ruleDefinitions.filter(x => x.fireOnlyOnSubmit == false)) {
      if (field.dataset[rule.attribute]) {
        var newRule = rule.rule(field);
        if (newRule) {
          rules.push(newRule);
        }
      }
    }
    if (rules.length > 0 & field.name.length > 0) {
      return rules.length > 1 ? rules : rules[0];
    }
  }
  handleErrors(errors, fields) {
    for (var key in fields) {
      var field = fields[key];
      this.displayError(field[0]);
    }
    this.focusFirst();
    this.validationSummary(errors);
  }
  focusFirst() {
    var error = this.form.querySelector("." + inputErrorClass);
    if (error) {
      error.focus();
    }
  }
  handleFieldError(errors, fields, field) {
    if (Object.hasOwn(fields, field.name)) {
      var err = fields[field.name];
      this.displayError(err[0]);
    } else {
      this.clearErrors(field);
    }
  }
  clearPreviousErrors() {
    var errors = this.form.querySelectorAll("." + inputErrorClass);
    for (var error of errors) {
      error.classList.remove(inputErrorClass);
      error.removeAttribute('aria-describedby');
    }
    if (this.summary) {
      if (!this.summary.classList.contains(summaryValidClass)) {
        this.summary.classList.add(summaryValidClass);
      }
      if (this.summary.classList.contains(summaryErrorClass)) {
        this.summary.classList.remove(summaryErrorClass);
      }
    }
    var messages = this.form.querySelectorAll("." + messageErrorClass);
    for (var message of messages) {
      message.classList.remove(messageErrorClass);
      message.classList.add(messageValidClass);
      message.innerText = '';
    }
    if (this.summary) {
      var list = this.summary.firstChild;
      list.innerHTML = '';
    }
  }
  validationSummary(errors) {
    if (this.summary) {
      var list = this.summary.firstChild;
      list.innerHTML = '';
      for (var i = 0; i < errors.length; i++) {
        var error = errors[i];
        var li = document.createElement('li');
        li.innerText = error.message;
        li.setAttribute('data-error-for', error.field);
        list.appendChild(li);
      }
      this.summary.classList.remove(summaryValidClass);
      this.summary.classList.add(summaryErrorClass);
    }
  }
  displayError(field) {
    var elem = this.form.querySelector("[name=\"" + field.field + "\"]");
    if (elem) {
      elem.classList.add(inputErrorClass);
      var label = this.form.querySelector("[data-valmsg-for=\"" + field.field + "\"]");
      if (label && label.dataset.valmsgReplace === 'true') {
        var valId = field.field + "-val-" + this.nonce;
        label.id = valId;
        elem.setAttribute('aria-describedby', valId);
        label.innerText = field.message;
        label.classList.remove(messageValidClass);
        label.classList.add(messageErrorClass);
      }
    }
  }
  validateForm() {
    this.clearPreviousErrors();
    var formData = this.formToObject();
    return new Promise((resolve, reject) => {
      this.validator.validate(formData, {
        firstFields: true
      }).then(() => {
        resolve(new FormData(this.form));
      }).catch(_ref => {
        var {
          errors,
          fields
        } = _ref;
        this.handleErrors(errors, fields);
        reject(errors, fields);
      });
    });
  }
  clearErrors(field) {
    if (field.classList.contains(inputErrorClass)) {
      field.classList.remove(inputErrorClass);
    }
    if (!field.classList.contains(inputValidClass)) {
      field.classList.add(inputValidClass);
    }
    var label = this.form.querySelector("[data-valmsg-for=\"" + field.name + "\"]");
    if (label && label.dataset.valmsgReplace === 'true') {
      label.innerText = '';
      if (!label.classList.contains(messageErrorClass)) {
        label.classList.add(messageErrorClass);
      }
      if (label.classList.contains(messageErrorClass)) {
        label.classList.remove(messageErrorClass);
      }
    }
    if (this.summary) {
      var err = this.summary.querySelector("[data-error-for=\"" + field.name + "\"]");
      if (err) {
        err.parentNode.removeChild(err);
      }
    }
  }
  validateField(field) {
    var formData = this.formToObject();
    return this.blurValidator.validate(formData, {
      firstFields: true
    }).then(() => {
      this.clearErrors(field);
      return true;
    }).catch(_ref2 => {
      var {
        errors,
        fields
      } = _ref2;
      this.handleFieldError(errors, fields, field);
      return false;
    });
  }
  formToObject() {
    var formData = new FormData(this.form);
    var object = {};
    formData.forEach((value, key) => {
      if (key === '') {
        return;
      }
      if (!Reflect.has(object, key)) {
        object[key] = value;
        return;
      }
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      object[key].push(value);
    });
    return object;
  }
}
exports.FormValidation = FormValidation;