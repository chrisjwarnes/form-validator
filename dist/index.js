"use strict";

exports.__esModule = true;
exports.setupValidation = exports.setupKenticoValidation = void 0;
var _init = require("./validation/init.js");
exports.initForms = _init.initForms;
var _FormValidation = require("./validation/FormValidation.js");
exports.addRule = _FormValidation.addRule;
var _required = _interopRequireDefault(require("./validation-rules/required.js"));
var _kenticoRequired = _interopRequireDefault(require("./validation-rules/kentico-required.js"));
var _email = _interopRequireDefault(require("./validation-rules/email.js"));
var _maxLength = _interopRequireDefault(require("./validation-rules/maxLength.js"));
var _minLength = _interopRequireDefault(require("./validation-rules/minLength.js"));
var _number = _interopRequireDefault(require("./validation-rules/number.js"));
var _phone = _interopRequireDefault(require("./validation-rules/phone.js"));
var _regex = _interopRequireDefault(require("./validation-rules/regex.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// rules

var setupValidation = exports.setupValidation = function setupValidation() {
  (0, _required.default)();
  (0, _email.default)();
  (0, _maxLength.default)();
  (0, _minLength.default)();
  (0, _number.default)();
  (0, _phone.default)();
  (0, _regex.default)();
};
var setupKenticoValidation = exports.setupKenticoValidation = function setupKenticoValidation() {
  (0, _kenticoRequired.default)();
  (0, _email.default)();
  (0, _maxLength.default)();
  (0, _minLength.default)();
  (0, _number.default)();
  (0, _phone.default)();
  (0, _regex.default)();
};