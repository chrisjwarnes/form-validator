# form-validator
replacement for jquery-validate / jquery-validate-unobtrusive, aimed at dot net projects to remove jquery dependency

[![Node.js CI](https://github.com/chrisjwarnes/form-validator/actions/workflows/node.js.yml/badge.svg)](https://github.com/chrisjwarnes/form-validator/actions/workflows/node.js.yml)

## Installation (npm)
```
npm install '@chrisjwarnes/form-validator'

```

## Basic usage

```javascript
import { initForms, setupValidation } from '@chrisjwarnes/form-validator'

setupValidation()
initForms()

```

## ES6 modules

to use ES6 modules use the following syntax, you will need to do your own transcribing to meet your browser requirements.

```javascript
import { initForms, setupValidation } from '@chrisjwarnes/form-validator/src' 
setupValidation()
initForms()

```

## Example html for form fields.

All form fields that need to be validated should have the `data-val="true"` attribute, and at least one other additional attribute to describe the validation type/error message for failure.

### Required Field
```html
   <div>
      <label for="name">Name</label>
      <input id="name" name="name" type="text" value="" data-val="true" data-val-required="There are errors in this field">
      <span data-valmsg-for="name" data-valmsg-replace="true"></span>
    </div>

```

### Email (plus required)

```html
 <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" data-val="true" data-val-required="This field is required" data-val-email="The email address is invalid">
    <span data-valmsg-for="email" data-valmsg-replace="true"></span>
  </div>

```

### Phone number

```html
  <div>
    <label for="phone">Phone</label>
    <input type="tel" id="phone" name="phone" data-val="true" data-val-phone="this appears to be an invalid phone number">
    <span data-valmsg-for="phone" data-valmsg-replace="true"></span>
  </div>

```

### Regular Expression

```html
   <div>
      <label for="name">Name</label>
      <input id="name" name="name" type="text" value="" data-val="true" data-val-regex-pattern="/^([^0-9]*)$/" data-val-regex="the name field shouldn't contain any numbers">
      <span data-valmsg-for="name" data-valmsg-replace="true"></span>
    </div>

```

### Numeric field

```html
   <div>
      <label for="number">Number</label>
      <input id="number" name="number" type="number" value="" data-val="true" data-val-number="this field should contain numbers only">
      <span data-valmsg-for="number" data-valmsg-replace="true"></span>
    </div>

```
### Maximum length

```html
   <div>
      <label for="name">Name</label>
      <input id="name" name="name" type="text" value="" data-val="true" data-val-regex-pattern="/^([^0-9]*)$/" data-val-max-length-max="50" data-val-max-length="this field shouldn't contain more than 50 characters">
      <span data-valmsg-for="name" data-valmsg-replace="true"></span>
    </div>

```

### Minimum length

```html
   <div>
      <label for="name">Name</label>
      <input id="name" name="name" type="text" value="" data-val="true" data-val-regex-pattern="/^([^0-9]*)$/" data-val-min-length-min="50" data-val-min-length="this field should contain at least 50 characters">
      <span data-valmsg-for="name" data-valmsg-replace="true"></span>
    </div>

```


## Adding additional rules

rules use [Async Validation](https://github.com/yiminghe/async-validator) syntax

in order to create a new Rule 

```javascript
import { addRule } from '@chrisjwarnes/form-validator'

```

The `addRule` function takes three arguments the first is the attribute for the validation, this is in dataset format i.e. for required validation an attribute of `data-val-required` will be added to the input therefore the first argument is `'valRequired'` as it would appear under the data set property for that input, see [Dataset Documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) for more details.

The second argument of addRule is an anonymous function with the argument of a field and returning an object containing the `async-validator` rule details.

the third argument is an optional boolean field (default: false) which specifys whether or not the rule should only be run on form submission (for example if the rule carrys out ajax requests to the server e.g. recaptcha?) other rules will be fired on blur/input events of the field.

### Example rules
```javascript
  addRule('valMaxlength', function (field) {
    return {
      type: 'string',
      max: parseInt(field.dataset.valMaxlengthMax),
      message: field.dataset.valMaxlength
    }
  })

  addRule('valRecaptcha', function (field) {
    return {
      type: 'string',
      asyncValidator: (rule, value) => {
        return new Promise((resolve, reject) => {
          if (!window.grecaptcha) {
            reject(new Error('grecaptcha script is missing.'))
          }
          window.grecaptcha.execute(field.dataset.valRecaptchaKey, { action: field.dataset.valRecaptchaAction }).then(function (token) {
            field.value = token
            resolve()
          })
        })
      },
      message: field.dataset.valRecaptcha
    }
  }, true)

```

## Async Forms

To make a form ajax use use the `data-ajax` attribute.

If `data-ajax` is true or 'auto' then the library will look for the `data-ajax-update` and `data-ajax-mode` to decide the behavior.

The `data-ajax-update` method is a css selector pointing to an individual element, this will be used as a reference point for the response to the form submission.

The `data-ajax-mode` attribute determines what to do with the response to the submitted form in relation to the element referenced by the `data-ajax-update` attribute.

| **Ajax Method**    | **Behavior**                                                          |
| :----------------  | :-------------------------------------------------------------------  |
| Before             | Insert the response from the server before the element                |
| After              | Insert the response from the server after the element                 |
| Replace-With       | replace the element with the response from the server                 |
| Update             | Update the contents of the element  with the response from the server |

if there is no `data-ajax-mode` attribute the default is `Update`.

An example may look like this:

```html
<div id="form-container">
  <form method="post" data-ajax="true" data-ajax-mode="replace" data-ajax-update="#form-container" >
    <!-- form contents -->
    </form>
</div>

```

The library will submit the form using the method specified against the form, and will expect an html partial as a response.

### Form redirection

If you wish to redirect your form to a new page upon submission i would suggest using a non-ajax form, however if for whatever reason you are unable to do so, you may return a json response that will redirect to a new page, the json must be an exact match to the following example, the redirectTo property will be the url to which you wish to redirect the user.

```json
{
  "redirectTo": "/contact-us/success" 
}

```

### Manual Async Forms

If you have a form you want to handle manually you can remove the `data-ajax-mode` and the `data-ajax-update` attribute and set the `data-ajax` property to 'manual' i.e.


```html
<div>
  <form method="post" id="my-form" data-ajax="manual">
    <!-- form contents -->
    </form>
</div>

```
This form can then be handled via javascript as follows.

```javascript
const form = document.querySelector('#my-form')

form.addEventListener('submit', function() {
  form.validator.validateForm().then(function(formData) {
    // form has successfully validated.
    // form data is a javascript FormData object
    // form can now be submitted via fetch or whatever is desired.

    // the form can be converted to a json object by calling the following
    const formJson = form.validator.formToObject()

  }).catch(function(errors, fields) {
    // handle any errors here as desired.
  })
})

```
