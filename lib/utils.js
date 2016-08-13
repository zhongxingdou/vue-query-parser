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

const NATIVE_TYPE = {
  'String': String,
  'Number': Number,
  'Object': Object,
  'RegExp': RegExp,
  'Date': Date,
  'Boolean': Boolean,
  'Error': Error,
  'Array': Array
}

// shim: ensure native constructor has name property
function nativeConstructorNameShim () {
  for (let t in NATIVE_TYPE) {
    let constructor = NATIVE_TYPE[t]
    if (constructor.name !== t) {
      try {
        constructor.name = t
      } catch (e) {/* no-empty */}
    }
  }
}

function findMemberByObjPath (obj, path) {
  let names = path.split('.')
  let firstName = names.shift()
  let member = obj[firstName]
  if (member && names.length) {
    return findMemberByObjPath(member, names.join('.'))
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

export default {
  VALUE_TYPE,
  NATIVE_TYPE,
  NATIVE_OBJECT,
  nativeConstructorNameShim,
  isValueType,
  isNativeObject,
  getLastSecOfObjPath,
  findMemberByObjPath,
  filterSubPath
}
