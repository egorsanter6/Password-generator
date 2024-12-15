const elementsArray = ['length', 'upperCase', 'lowerCase',
                      'digits', 'symbols', 'space',
                      'pwdGenBtn', 'passwords', 'errors',
                      'overriddenSymbols', 'includeSymbols', 'excludeSymbols',
                      'requiredSymbols', 'numberOfPasswords', 'requiredWord',
                      'randomLength', 'randomLengthBlock', 'hidePasswords',
                      'excludeSymbolsCombination', 'copyAllPwdsBtn', 'passwordStatus',
                      'randomWord'
                      ]
const checkboxFieldsToListen = ['upperCase', 'lowerCase', 'digits',
                        'symbols', 'space'
]
const inputFieldsToListen = ['overriddenSymbols', 'includeSymbols', 'excludeSymbols',
  'requiredSymbols', 'requiredWord'
]

let elements = {}

let passwordSymbols = ''
let generatedPassword = ''
let generatedPasswords = []
let pwdOrPwds = 'password'

const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz'
const digits = '0123456789'
const symbols = '!"#$%&()*+,-./:;<=>?@[]^_`{|}~' + "'"
const space = ' '


// Make elementsArray DOMS
elementsArray.forEach(element => elements[element] = document.getElementById(element))

elements['pwdGenBtn'].onclick = function () {
  updatePasswordSymbols()
  passwordGenerator()
}


// Event listeners
checkboxFieldsToListen.forEach(field => elements[field].addEventListener('change', updatePasswordSymbols))
inputFieldsToListen.forEach(field => elements[field].addEventListener('input', updatePasswordSymbols))

elements['hidePasswords'].addEventListener('change', hidePasswords)
elements['length'].addEventListener('input', () => {
  validateRange(5, 100, elements['length'])
  getLength()
  updatePasswordSymbols()
})
elements['numberOfPasswords'].addEventListener('input', () => {
  pwdOrPwdsLogic()
  validateRange(1, 20, elements['numberOfPasswords'])
})
elements['randomLength'].addEventListener('change', () => {
  pwdLengthChecker()
  updatePasswordSymbols()
})


function updatePasswordSymbols() {
  passwordSymbols = ''
  elements['numberOfPasswords'].addEventListener('input', pwdOrPwdsLogic)
  passwordSymbolsChecker()

  console.log(pwdOrPwds)
  const errorId = 'definedSymbolsError'
  const errorText = 'Please define some symbols for your future ' + pwdOrPwds + ' or override your own symbols'
  const definedSymbolsError = document.getElementById(errorId)

  if (passwordSymbols == '' || passwordSymbols == ' ') {
    fieldsToDisable(true)
    checkFieldsValidity(definedSymbolsError, errorId, errorText)

  } else if (definedSymbolsError) {
    fieldsToDisable(false)

    if (definedSymbolsError) definedSymbolsError.remove()
  }
}


function pwdOrPwdsLogic() {
  const numberOfPasswords = Number(elements['numberOfPasswords'].value);
  pwdOrPwds = numberOfPasswords > 1 ? 'passwords' : 'password';
}


elements['excludeSymbolsCombination'].addEventListener('input', () => {
  updatePasswordSymbols()
  excludeSymbolsCombinationLogic()
})

function excludeSymbolsCombinationLogic() {
  const errorId = 'exceptSymbolsCombinationLengthError'
  const errorText = 'Please define more than 1 symbol'
  const exceptSymbolsCombinationLengthError = document.getElementById(errorId)

  if (elements['excludeSymbolsCombination'].value) {
    elements['requiredSymbols'].disabled = true
    elements['requiredWord'].disabled = true
  } else {
    if (!elements['excludeSymbols'].value) elements['requiredSymbols'].disabled = false
    elements['requiredWord'].disabled = false
  }
  
  // const uniqueSymbols = new Set(elements['excludeSymbolsCombination'].value.split(''))

  if (elements['excludeSymbolsCombination'].value.length == 1 || (passwordSymbols.length == 1 && elements['excludeSymbolsCombination'].value)) {
    elements['pwdGenBtn'].disabled = true
    checkFieldsValidity(exceptSymbolsCombinationLengthError, errorId, errorText)
  }

  if ((exceptSymbolsCombinationLengthError && !elements['excludeSymbolsCombination'].value) || passwordSymbols.length > 1) {
    if (elements['excludeSymbolsCombination'].value.length != 1) elements['pwdGenBtn'].disabled = false
    if (exceptSymbolsCombinationLengthError) {
      exceptSymbolsCombinationLengthError.remove()
    }
  }
}


function fieldsToDisable(arg) {
  let elementsToBlock = ['requiredWord',
    'excludeSymbolsCombination', 'randomWord', 'space', 'includeSymbols']
  
  if (!elements['excludeSymbolsCombination'].value) elementsToBlock.push('pwdGenBtn')
  if (!elements['excludeSymbols'].value) elementsToBlock.push('requiredSymbols')
  
  elementsToBlock.forEach(element => elements[element].disabled = arg)
  // if (elements['excludeSymbolsCombination'].value && passwordSymbols.length > 1) elements['pwdGenBtn'].disabled = false
}


function passwordSymbolsChecker() {
  if (elements['upperCase'].checked) passwordSymbols += upperCaseLetters
  if (elements['lowerCase'].checked) passwordSymbols += lowerCaseLetters
  if (elements['digits'].checked) passwordSymbols += digits
  if (elements['symbols'].checked) passwordSymbols += symbols
  if (elements['space'].checked) passwordSymbols += space

  if (elements['overriddenSymbols'].value) {
    passwordSymbols = elements['overriddenSymbols'].value
    requiredSymbolsLogic()
    requiredWordLogic()
    excludeSymbolsLogic()
    overriddenSymbolsChecker(true)
  } else {
    overriddenSymbolsChecker(false)
  }
  
  if (!elements['overriddenSymbols'].value) {
    includeSymbolsLogic()
    requiredSymbolsLogic()
    excludeSymbolsLogic()
    requiredWordLogic()
  }
}


function requiredWordLogic() {
  const requiredWord = elements['requiredWord'].value

  const errorId = 'requiredWordLengthError'
  const errorText = "The length of required word exceeds 20% of password's length"
  const requiredWordLengthError = document.getElementById(errorId)

  const currentLength = getCurrentLength()

  if (requiredWord) {
    if (currentLength / requiredWord.length < 5) {
      checkFieldsValidity(requiredWordLengthError, errorId, errorText)
      elements['pwdGenBtn'].disabled = true
    } else if (!elements['excludeSymbolsCombination'].value) {
      elements['pwdGenBtn'].disabled = false
      if (requiredWordLengthError) requiredWordLengthError.remove()
    }
  } else {
    if (!elements['excludeSymbolsCombination'].value) elements['pwdGenBtn'].disabled = false
    if (requiredWordLengthError) requiredWordLengthError.remove()
  }
}


function includeSymbolsLogic() {
  if (passwordSymbols && passwordSymbols != ' ') {
    if (elements['includeSymbols'].value) {
      passwordSymbols += elements['includeSymbols'].value
    }
    elements['includeSymbols'].disabled = false
  } else {
    elements['includeSymbols'].disabled = true
  }
}


function requiredSymbolsLogic() {
  let errorId = 'requiredSymbolsError'
  let errorText = 'Some required symbols are not present in the defined password symbols.'
  const requiredSymbolsError = document.getElementById(errorId)

  if (elements['requiredSymbols'].value) {
    const allSymbolsIsValid = elements['requiredSymbols'].value
      .split('')
      .every(symbol => passwordSymbols.includes(symbol))

    if (!allSymbolsIsValid) {
      checkFieldsValidity(requiredSymbolsError, errorId, errorText)

      elements['pwdGenBtn'].disabled = true
      return
    }
  }

  if (requiredSymbolsError) requiredSymbolsError.remove()
    if (!elements['excludeSymbolsCombination'].value) elements['pwdGenBtn'].disabled = false

  elements['excludeSymbols'].disabled = !!elements['requiredSymbols'].value

  errorId = 'requiredSymbolsLengthError'
  errorText = "The length of required symbols exceeds 20% of password's length"
  const requiredSymbolsLengthError = document.getElementById(errorId)

  const currentLength = getCurrentLength()
  const requiredSymbolsValue = Number(elements['requiredSymbols'].value.length)

  if ((currentLength / requiredSymbolsValue) < 5.0) {
    elements['pwdGenBtn'].disabled = true
    checkFieldsValidity(requiredSymbolsLengthError, errorId, errorText)
  } else {
    if (!elements['excludeSymbolsCombination'].value) elements['pwdGenBtn'].disabled = false
    if (requiredSymbolsLengthError) requiredSymbolsLengthError.remove()
  }
}


function getCurrentLength() {
  let randomLengthMin = elements['randomLengthBlock'].getElementsByTagName('input')[1]
  
  const check = randomLengthMin ? Number(randomLengthMin.value) :
                                  Number(document.getElementById('length').value)
  return check
}


function excludeSymbolsLogic() {
  excludeSymbolsCombinationLogic()

  if (elements['excludeSymbols'].value) {
    elements['excludeSymbols'].disabled = false
    elements['requiredSymbols'].disabled = true

    if (passwordSymbols.length > 1 && elements['excludeSymbolsCombination'].value) {
      const filteredSymbols = passwordSymbols
        .split('')
        .filter(char => !elements['excludeSymbols'].value.includes(char))
        .join('')

      if (filteredSymbols.length < 2 && elements['excludeSymbolsCombination'].value) {
        elements['pwdGenBtn'].disabled = true
      } else {
        elements['pwdGenBtn'].disabled = false
      }
    } else if (passwordSymbols.length == 1 && elements['excludeSymbolsCombination'].value) {
      elements['pwdGenBtn'].disabled = true
    }

    passwordSymbols = passwordSymbols
      .split('')
      .filter(char => !elements['excludeSymbols'].value.includes(char))
      .join('')
  } else {
    if (!passwordSymbols || passwordSymbols === ' ') {
      elements['excludeSymbols'].disabled = true
    }
    if (!elements['excludeSymbolsCombination'].value) {
      elements['requiredSymbols'].disabled = false
    }
  }
}


function overriddenSymbolsChecker(arg) {
  elementsToBlock = ['upperCase', 'lowerCase', 'digits',
                     'symbols', 'space', 'includeSymbols', 'randomWord'
  ]

  elementsToBlock.forEach(element => elements[element].disabled = arg)
}


function checkFieldsValidity(error, id, errorText) {
  if (!error) {
    const paragraph = document.createElement('p')
    paragraph.id = id
    paragraph.textContent = errorText
    paragraph.style.color = 'red'
    paragraph.classList.add("center-inside")
    elements['errors'].appendChild(paragraph)
  }
}


async function passwordGenerator() {
  generatedPasswords = []
  let word

  const requiredSymbolsArray = elements['requiredSymbols'].value ? elements['requiredSymbols'].value.split('') : []
  const requiredSymbolsCounts = requiredSymbolsArray.reduce((acc, char) => {
    acc[char] = (acc[char] || 0) + 1
    return acc
  }, {})

  const numberOfPasswords = Number(elements['numberOfPasswords'].value)
  elements['passwords'].innerHTML = ''

  const passwordList = numberOfPasswords > 1 ? document.createElement('ol') : document.createElement('ul')

  for (let x = 0; x < numberOfPasswords; x++) {
    let pwdLength = getLength()

    if (elements['requiredWord'].value) {
      pwdLength -= Number(elements['requiredWord'].value.length)
    }

    if (elements['randomWord'].checked && !elements['randomWord'].disabled) {
      word = await randomWord(pwdLength)
      pwdLength -= Math.ceil((pwdLength / 2) - 0.5)
    }

    do {
      generatedPassword = ''
      
      for (let i = 0; i < pwdLength; i++) {
        const randomIndex = Math.floor(Math.random() * passwordSymbols.length)
        generatedPassword += passwordSymbols[randomIndex]
      }

      if (elements['requiredWord'].value) {
        const randomIndex = Math.floor(Math.random() * generatedPassword.length)
        const requiredWord = elements['requiredWord'].value
        generatedPassword = 
          generatedPassword.slice(0, randomIndex) +
          requiredWord +
          generatedPassword.slice(randomIndex)
      }

      if (elements['randomWord'].checked && !elements['randomWord'].disabled) {
        const randomIndex = Math.floor(Math.random() * generatedPassword.length)
        generatedPassword = 
          generatedPassword.slice(0, randomIndex) +
          word +
          generatedPassword.slice(randomIndex)
      }

      Object.entries(requiredSymbolsCounts).forEach(([char, count]) => {
        let occurrences = (generatedPassword.match(new RegExp(char, 'g')) || []).length

        while (occurrences < count) {
          const randomIndex = Math.floor(Math.random() * generatedPassword.length)
          generatedPassword =
            generatedPassword.slice(0, randomIndex) +
            char +
            generatedPassword.slice(randomIndex)
          occurrences++
        }
      })

    } while (
      !requiredSymbolsArray.every(
        char =>
          (generatedPassword.match(new RegExp(char, 'g')) || []).length >= requiredSymbolsCounts[char]
      ) || 
      (elements['excludeSymbolsCombination'].value &&
       generatedPassword.includes(elements['excludeSymbolsCombination'].value))
    )
    
    generatedPasswords.push(generatedPassword)

    const passwordItem = document.createElement('li')

    const passwordText = document.createElement('span')
      passwordText.id = `password-${x}`
      passwordText.textContent = elements['hidePasswords'].checked ? '******': generatedPassword
    
    const passwordHider = document.createElement('input')
      passwordHider.type = 'checkbox'
      passwordHider.id = `hider-${x}`
      passwordHider.checked = elements['hidePasswords'].checked

    const copyPassword = document.createElement('button')
      copyPassword.id = `copyPassword-${x}`
      copyPassword.textContent = 'Copy'
      copyPassword.classList.add("btn", "btn-light", "btn-sm", "shadow-lg")

    const pwdSecurity = document.createElement('span')
    pwdSecurity.textContent = 'Security: ' + passwordStatus(generatedPassword)
    passwordItem.appendChild(copyPassword)
    passwordItem.appendChild(passwordHider)
    passwordItem.appendChild(pwdSecurity)
    passwordItem.appendChild(passwordText)

    passwordList.appendChild(passwordItem)
    elements['passwords'].appendChild(passwordList)
  }

  copyPassword()
  copyPasswords()
  hideSinglePassword()

  elements['copyAllPwdsBtn'].disabled = false
  elements['hidePasswords'].disabled = false
}


function validateRange(min, max, elementToCheck) {
  const length = Number(elementToCheck.value)
  if (length < min) return elementToCheck.value = min
  else if (length > max) return elementToCheck.value = max
}


function pwdLengthChecker() {
  if (elements['randomLength'].checked) {
    let minValue = createValue('minValue')
    elements['randomLengthBlock'].appendChild(minValue)
    
    let maxValue = createValue('maxValue')
    elements['randomLengthBlock'].appendChild(maxValue)

    minValue.addEventListener('input', () => {
      validateRange(5, 100, minValue)
      randomlengthChecker(minValue, maxValue)
    })

    maxValue.addEventListener('input', () => {
      validateRange(5, 100, maxValue)
      randomlengthChecker(minValue, maxValue)
    })

    elements['length'].disabled = true
  } else {
    const inputElements = elements['randomLengthBlock'].getElementsByTagName('input')
  
    for (let i = 0; i < 2; i++)
      inputElements[1].remove()

    elements['length'].disabled = false
  }
}


function createValue(id) {
  const randomLengthValue = document.createElement('input')

  randomLengthValue.id = id
  randomLengthValue.type = 'number'
  randomLengthValue.value = id == 'minValue' ? 15 : 30
  randomLengthValue.min = '5'
  randomLengthValue.max = '100'

  return randomLengthValue
}


function getLength() {
  let pwdLength

  if (elements['randomLength'].checked) {
    let min = Number(document.getElementById('minValue').value)
    let max = Number(document.getElementById('maxValue').value)
    
    pwdLength = Math.floor(Math.random() * (max - min) + min)
  } else {
    pwdLength = Number(elements['length'].value)
  }

  return pwdLength
}


function randomlengthChecker(min, max) {
  if (Number(min.value) > Number(max.value)) max.value = min.value

  updatePasswordSymbols()
}


function hidePasswords() {
  generatedPasswords.forEach((pwd, index) => {
    const passwordItem = document.getElementById(`password-${index}`)
    const passwordHider = document.getElementById(`hider-${index}`)
    if (passwordItem && passwordHider) {
      passwordHider.checked = elements['hidePasswords'].checked
      passwordItem.textContent = elements['hidePasswords'].checked
        ? '******'
        : pwd
    }
  })
}


function hideSinglePassword() {
  for (let i = 0; i < generatedPasswords.length; i++) {
    const pwdHider = document.getElementById(`hider-${i}`)
    if (pwdHider) {
      pwdHider.addEventListener('change', function () {
        const passwordItem = document.getElementById(`password-${i}`)
        if (passwordItem) {
          passwordItem.textContent = pwdHider.checked ? '******' : generatedPasswords[i]
        }
      })
    }
  }
}


function copyPassword() {
  if (generatedPasswords) {
    generatedPasswords.forEach((_, index) => {
      const copyBtn = document.getElementById(`copyPassword-${index}`)
      if (!copyBtn) {
        return
      }

      copyBtn.onclick = function () {
        const passwordText = generatedPasswords[index]

        const tempTextarea = document.createElement('textarea')
        tempTextarea.value = passwordText
        document.body.appendChild(tempTextarea)
        tempTextarea.select()

        try {
          document.execCommand('copy')
        } catch (err) {}

        document.body.removeChild(tempTextarea)
      }
    })
  }
}


function copyPasswords() {
  if (generatedPasswords) {
    const copyAllPwdsBtn = document.getElementById('copyAllPwdsBtn')

    copyAllPwdsBtn.onclick = function() {
      const passwordTexts = []
      
      generatedPasswords.forEach((password, index) => {
        const passwordText = generatedPasswords.length == 1
          ? password
          : `${index + 1}. ${password}`

        passwordTexts.push(passwordText)
      })

      const allPasswordsText = passwordTexts.join('\n')
      
      const tempTextarea = document.createElement('textarea')
      tempTextarea.value = allPasswordsText
      document.body.appendChild(tempTextarea)

      tempTextarea.select()

      document.execCommand('copy')

      document.body.removeChild(tempTextarea)
    }
  }
}


function passwordStatus(pwdItem) {
  const uniquePwdSymbols = new Set(pwdItem).size
  const hasLetters = /[a-zA-Z]/.test(pwdItem)
  const hasNumbers = /\d/.test(pwdItem)
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(pwdItem)
  const length = pwdItem.length

  if (length < 7 || uniquePwdSymbols < 4) {
    return 'Bad'
  }
  if (length < 11 || uniquePwdSymbols < 6 || !(hasLetters && hasNumbers)) {
    return 'So so'
  }
  if (length < 15 || uniquePwdSymbols < 8 || !(hasLetters && hasNumbers && hasSpecialChars)) {
    return 'Pretty good'
  }
  if (length < 19 || uniquePwdSymbols < 10) {
    return 'Very good'
  }
  return 'Excellent'
}


async function randomWord(pwdLen) {
  const availableLength = Math.ceil((pwdLen / 2) - 0.5)

  const response = await fetch('./1000_words/1000_words.json')
  const data = await response.json()
  const wordsArray = data.filter(value => value.length <= availableLength)

  if (wordsArray.length == 0) {
    return ''
  }

  const randomWordIndex = Math.floor(Math.random() * wordsArray.length)

  return wordsArray[randomWordIndex]
}
