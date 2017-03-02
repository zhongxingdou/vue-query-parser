function getLastSecOfObjPath (path) {
  let i = path.lastIndexOf('.')
  return i > 0 ? path.substr(i + 1) : path
}

const VALUE_TYPE = ['string', 'number', 'boolean']
function isValueType (obj) {
  return VALUE_TYPE.indexOf(typeof obj) !== -1
}

const NATIVE_OBJECT = [Array, RegExp, Date, Error, Object]
function isNativeObject (obj) {
  return NATIVE_OBJECT.indexOf(obj.constructor) !== -1
}

function getPathValue (obj, path) {
  let names = path.split('.')
  let firstName = names.shift()
  let member = obj[firstName]
  if (member && names.length) {
    return getPathValue(member, names.join('.'))
  }
  return member
}

function filterSubPath (path) {
  return path.sort().reduce(function (prev, curr) {
    if (!prev.some(item => curr.startsWith(item))) {
      prev.push(curr)
    }
    return prev
  }, [])
}

function flattenObj (obj, to) {
  if (!to) to = {}

  for(let p in obj) {
    let val = obj[p]

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      flattenObj(val, to)
    } else {
      to[p] = val
    }
  }

  return to
}

export default {
  VALUE_TYPE,
  NATIVE_OBJECT,
  isValueType,
  isNativeObject,
  getLastSecOfObjPath,
  getPathValue,
  filterSubPath,
  flattenObj
}
