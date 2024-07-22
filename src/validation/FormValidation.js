import Schema from 'async-validator'
import { submitAjaxForm } from './submitAjaxForm'

const ruleDefinitions = []

const inputValidClass = 'input-validation-valid'
const inputErrorClass = 'input-validation-error'

const summaryValidClass = 'validation-summary-valid'
const summaryErrorClass = 'validation-summary-errors'

const messageValidClass = 'field-validation-valid'
const messageErrorClass = 'field-validation-error'

export const updatedEvent = 'form-updated'

export const addRule = function (attribute, rule, fireOnlyOnSubmit = false) {
  ruleDefinitions.push({ attribute, rule, fireOnlyOnSubmit })
  document.dispatchEvent(new CustomEvent(updatedEvent))
}

export class FormValidation {
  constructor (form) {
    this.form = form
    this.init()
  }

  init () {
    this.fields = this.form.querySelectorAll('[data-val="true"]')
    this.summary = this.form.querySelector('[data-valmsg-summary="true"]')
    this.nonce = Math.random().toString(36).slice(2)
    this.initRules()
  }

  setUpEvents () {
    this.form.noValidate = true
    if (!this.form.dataset.ajax) {
      this.form.addEventListener('submit', (e) => {
        if (e.submitter) {
          e.submitter.disabled = true
        }
        if (!this.form.dataset.valid) {
          e.preventDefault()
          this.validateForm().then(() => {
            this.form.dataset.valid = true
            this.form.submit()
          }).catch(function (errors, fields) {
            e.preventDefault()
            if (e.submitter) {
              e.submitter.disabled = false
            }
          })
        }
      })
    } else if (this.form.dataset.ajax === 'auto' || this.form.dataset.ajax === 'true') {
      this.form.addEventListener('submit', (e) => {
        if (e.submitter) {
          e.submitter.disabled = true
        }
        if (!this.form.dataset.valid) {
          e.preventDefault()

          this.validateForm().then(() => {
            this.form.dataset.valid = true
            submitAjaxForm(this.form)
          }).catch(function (errors, fields) {
            e.preventDefault()
            if (e.submitter) {
              e.submitter.disabled = false
            }
          })
        }
      })
    }

    this.form.addEventListener('blur', (e) => {
      try {
        this.validateField(e.target)
      } catch (err) {
      }
    }, { passive: true })

    this.form.addEventListener('input', (e) => {
      try {
        this.validateField(e.target)
      } catch (err) {
      }
    }, { passive: true })

    this.form.addEventListener('change', (e) => {
      try {
        this.validateField(e.target)
      } catch (err) {
      }
    }, { passive: true })
  }

  initRules () {
    const definition = {}
    const blurDefinition = {}
    for (const field of this.fields) {
      const rules = this.setupRules(field)
      if (rules) {
        definition[field.name] = rules
      }

      const blurRules = this.setupBlurRules(field)
      if (blurRules) {
        blurDefinition[field.name] = rules
      }
    }
    this.blurValidator = new Schema(blurDefinition)
    this.validator = new Schema(definition)
  }

  setupRules (field) {
    const rules = []
    for (const rule of ruleDefinitions) {
      if (field.dataset[rule.attribute]) {
        const newRule = rule.rule(field)
        if (newRule) {
          rules.push(newRule)
        }
      }
    }

    if (rules.length > 0 & field.name.length > 0) {
      return rules.length > 1 ? rules : rules[0]
    }
  }

  setupBlurRules (field) {
    const rules = []
    for (const rule of ruleDefinitions.filter(x => x.fireOnlyOnSubmit == false)) {
      if (field.dataset[rule.attribute]) {
        const newRule = rule.rule(field)
        if (newRule) {
          rules.push(newRule)
        }
      }
    }

    if (rules.length > 0 & field.name.length > 0) {
      return rules.length > 1 ? rules : rules[0]
    }
  }

  handleErrors (errors, fields) {
    for (const key in fields) {
      const field = fields[key]
      this.displayError(field[0])
    }
    this.focusFirst()
    this.validationSummary(errors)
  }

  focusFirst() {
    const error = this.form.querySelector(`.${inputErrorClass}`)

    if (error) {
      error.focus()
    }
  }

  handleFieldError (errors, fields, field) {
    if (Object.hasOwn(fields, field.name)) {
      const err = fields[field.name]
      this.displayError(err[0])
    } else {
      this.clearErrors(field)
    }
  }

  clearPreviousErrors () {
    const errors = this.form.querySelectorAll(`.${inputErrorClass}`)
    for (const error of errors) {
      error.classList.remove(inputErrorClass)
      error.removeAttribute('aria-describedby')
    }
    if (this.summary) {
      if (!this.summary.classList.contains(summaryValidClass)) {
        this.summary.classList.add(summaryValidClass)
      }
      if (this.summary.classList.contains(summaryErrorClass)) {
        this.summary.classList.remove(summaryErrorClass)
      }
    }

    const messages = this.form.querySelectorAll(`.${messageErrorClass}`)

    for (const message of messages) {
      message.classList.remove(messageErrorClass)
      message.classList.add(messageValidClass)
      message.innerText = ''
    }

    if (this.summary) {
      const list = this.summary.firstChild
      list.innerHTML = ''
    }
  }

  validationSummary (errors) {
    if (this.summary) {
      const list = this.summary.firstChild
      list.innerHTML = ''
      for (let i = 0; i < errors.length; i++) {
        const error = errors[i]
        const li = document.createElement('li')
        li.innerText = error.message
        li.setAttribute('data-error-for', error.field)
        list.appendChild(li)
      }
      this.summary.classList.remove(summaryValidClass)
      this.summary.classList.add(summaryErrorClass)
    }
  }

  displayError (field) {
    const elem = this.form.querySelector(`[name="${field.field}"]`)

    if (elem) {
      elem.classList.add(inputErrorClass)

      const label = this.form.querySelector(`[data-valmsg-for="${field.field}"]`)

      if (label && label.dataset.valmsgReplace === 'true') {
        const valId = `${field.field}-val-${this.nonce}`
        label.id = valId
        elem.setAttribute('aria-describedby', valId)
        label.innerText = field.message
        label.classList.remove(messageValidClass)
        label.classList.add(messageErrorClass)
      }
    }
  }

  validateForm () {
    this.clearPreviousErrors()
    const formData = this.formToObject()
    return new Promise((resolve, reject) => {
      this.validator.validate(formData, { firstFields: true }).then(() => {
        resolve(new FormData(this.form))
      }).catch(({ errors, fields }) => {
        this.handleErrors(errors, fields)
        reject(errors, fields)
      })
    })
  }

  clearErrors (field) {
    if (field.classList.contains(inputErrorClass)) {
      field.classList.remove(inputErrorClass)
    }
    if (!field.classList.contains(inputValidClass)) {
      field.classList.add(inputValidClass)
    }

    const label = this.form.querySelector(`[data-valmsg-for="${field.name}"]`)

    if (label && label.dataset.valmsgReplace === 'true') {
      label.innerText = ''
      if (!label.classList.contains(messageErrorClass)) {
        label.classList.add(messageErrorClass)
      }
      if (label.classList.contains(messageErrorClass)) {
        label.classList.remove(messageErrorClass)
      }
    }

    if (this.summary) {
      const err = this.summary.querySelector(`[data-error-for="${field.name}"]`)
      if (err) {
        err.parentNode.removeChild(err)
      }
    }
  }

  validateField (field) {
    const formData = this.formToObject()
    return this.blurValidator.validate(formData, { firstFields: true }).then(() => {
      this.clearErrors(field)
      return true
    }).catch(({ errors, fields }) => {
      this.handleFieldError(errors, fields, field)
      return false
    })
  }

  formToObject () {
    const formData = new FormData(this.form)
    const object = {}
    formData.forEach((value, key) => {
      if (key === '') {
        return
      }

      if (!Reflect.has(object, key)) {
        object[key] = value
        return
      }
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]]
      }
      object[key].push(value)
    })

    return object
  }
}
