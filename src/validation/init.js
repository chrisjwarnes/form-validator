import { FormValidation } from './FormValidation.js'

export const initForm = function (form) {
  if (form.validator) {
    form.validator.init()
  } else {
    const val = new FormValidation(form)

    if (val.fields.length > 0) {
      val.setUpEvents()
  
      form.validator = val
    }
  }
}

export const initForms = function () {
  var forms = document.querySelectorAll('form')

  for (const form of forms) {
    initForm(form)
  }

  document.addEventListener('form-updated', function (e) {
    const forms = [...e.target.querySelectorAll('form')]

    if (e.target.tagName.toLowerCase() == 'form') {
      forms.push(e.target)
    }

    for (const form of forms) {
      initForm(form)
    }
  })
}
