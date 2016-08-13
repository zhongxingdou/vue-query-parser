// convert string to native type
function parseNative (value, type) {
  if (value === undefined || value === null) return value
  if (!type) return value

  var result = null
  switch (type) {
    case 'String':
      result = value.toString()
      break
    case 'Number':
      var n = new Number(value)
      if (!isNaN(n)) {
        result = n.valueOf()
      }
      break
    case 'Boolean':
      if (value === 'true' || value === 'false') {
        result = value === 'true'
      }
      break
    case 'Date':
      var d = new Date()
      if (!isNaN(d.setTime(Date.parse(value)))) {
        result = d
      }
      break
    case 'RegExp':
      try {
        if (value.startsWith('/')) {
          let i = value.lastIndexOf('/')
          if (i > 1) {
            result = new RegExp(value.substr(1, i - 1), value.substr(i + 1))
          }
        }
      } catch (e) {
        /* no-empty */
      }
      break
    case '[String]':
    case '[Number]':
    case '[Boolean]':
    case '[Date]':
    case '[RegExp]':
      var itemType = type.substring(1, type.length - 1)
      result = value.map((item) => parseNative(item, itemType))
      break
  }
  return result
}

export default parseNative
