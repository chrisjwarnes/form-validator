"use strict";

exports.__esModule = true;
exports.submitAjaxForm = void 0;
var ie11 = typeof document.documentMode !== 'undefined';

var parseHTML = function parseHTML(str) {
  var tmp = document.implementation.createHTMLDocument();
  tmp.body.innerHTML = str;
  return tmp.body.children;
};

var updateContents = function updateContents(mode, cssElem, content) {
  var elem = document.querySelector(cssElem);
  var lowerMode = mode.toLowerCase();
  var html = parseHTML(content);

  switch (lowerMode) {
    case 'before':
      for (var _content of html.length) {
        elem.insertBefore(_content, elem.firstChild);
      }

      break;

    case 'after':
      for (var _content2 of html.length) {
        elem.appendChild(_content2);
      }

      break;

    case 'replace-with':
      elem.outerHTML = content;
      break;

    default:
      elem.innerHTML = content;
      break;
  }

  if (!isElementInViewport(elem)) {
    window.setTimeout(() => {
      elem.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }, 200);
  }

  elem.parentNode.dispatchEvent(new CustomEvent('form-updated', {
    bubbles: true
  }));
};

var submitAjaxForm = function submitAjaxForm(form) {
  var submit = form.querySelector('[type="submit"]');

  if (submit != null) {
    submit.disabled = true;
  }

  var mode = form.dataset.ajaxMode || 'replace';
  var update = form.dataset.ajaxUpdate;
  var formData = new FormData(form);
  var fetchOptions = {
    method: form.method,
    credentials: 'same-origin',
    cache: 'no-cache',
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  if (ie11) {
    var formParams = new URLSearchParams(formData);
    fetchOptions.body = formParams;
    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  }

  return fetch(form.action, fetchOptions).then(response => response.text()).then(data => {
    updateContents(mode, update, data);
  }).catch(err => {
    console.error(err);

    if (submit != null) {
      submit.disabled = false;
    }
  });
};

exports.submitAjaxForm = submitAjaxForm;

var isElementInViewport = function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
};