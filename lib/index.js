/* global window: true */
import isPlainObject from 'is-plain-object'
import util from './utils'
import parseNative from './parse_native'

/*
-------------------------------------------------------
Action              |  Parse  |  Reset  | New Component
-------------------------------------------------------
Refresh             |    ✔    |    ✖   |    ✔
-------------------------------------------------------
Navigation a->a     |    ✔    |    ✔   |    ✖
-------------------------------------------------------
router.go a->b      |    ✔    |    ✖   |    ✔
-------------------------------------------------------
router.go a->a      |    ✖    |    ✖   |    ✖
-------------------------------------------------------
router.go a->a ?t=n |    ✔    |    ✔   |    ✖
-------------------------------------------------------
*/

let $win = typeof window !== 'undefined' ? window : null

function findSetterPath(setterMap, path) {
  return Object.keys(setterMap).find(_ => path.startsWith(_))
}

function parseQuery (vm, query, meta) {
  if (!query) return
  let {pathInfo: { assignPath, pathSetter }, typeInfo} = meta

  let setValue = (name, path, val) => {
    let setterPath = pathSetter && findSetterPath(pathSetter, path)
    if (setterPath) {
      const DOT_LEN = 1
      let setPath = path.substr(setterPath.length + DOT_LEN)
      pathSetter[setterPath].call(vm, val, setPath)
    } else {
      vm.$set(path, val)
    }
  }

  for (let name in query) {
    let path = assignPath[name]
    if (!path) continue

    let value = query[name]
    let type = typeInfo[name]
    if (type) {
      value = parseNative(value, type)
      if (value !== null && value !== undefined) {
        setValue(name, path, value)
      }
    } else {
      setValue(name, path, value)
    }
  }
}

function collectTypeInfo (typeOption) {
  let typeInfo = {}
  for (let typeName in typeOption) {
    ([].concat(typeOption[typeName])).forEach((queryName) => {
      typeInfo[queryName] = typeName
    })
  }
  return typeInfo
}

function collectObjPathInfo (obj, pathInfo, basePath) {
  for (let name in obj) {
    let value = obj[name]
    let path = basePath + '.' + name
    if (isPlainObject(value)) {
      collectObjPathInfo(value, pathInfo, path)
    } else {
      pathInfo[name] = path
    }
  }
}

function collectPathInfo (vm, target) {
  let resetPath = []
  let assignPath = {}
  let pathSetter = {}

  target = [].concat(target)
  target.forEach((path) => {
    let t = typeof path
    if (t === 'string') {
      resetPath.push(path)
      let value = vm.$get(path)
      if (isPlainObject(value)) {
        collectObjPathInfo(value, assignPath, path)
      } else {
        let name = util.getLastSecOfObjPath(path)
        assignPath[name] = path
      }
    } else if (t === 'object') {
      // query 中的 name 和 data 中的 name 不一致，或者还有其他选项
      // 以 { queryName: dataPath } 声明
      // 或以 { queryName: { path: dataPath }} 声明
      for (let queryName in path) {
        let dataPath = path[queryName]

        if (typeof dataPath === 'object') {
          let option = dataPath
          dataPath = option.path || queryName
          if (option.set) {
            pathSetter[dataPath] = option.set
          }
        }

        resetPath.push(dataPath)

        let value = vm.$get(dataPath)
        if (isPlainObject(value)) {
          collectObjPathInfo(value, assignPath, dataPath)
        } else {
          assignPath[queryName] = dataPath
        }
      }
    }
  })
  resetPath = util.filterSubPath(resetPath)

  return { assignPath, resetPath, pathSetter }
}

function resetData (vm, meta) {
  let resetPath = meta.pathInfo.resetPath
  let setter = meta.pathInfo.pathSetter
  if (resetPath.length) {
    let data = vm.$options.data()
    resetPath.forEach(function (path) {
      let set = setter[path]
      let value = util.getPathValue(data, path)
      if (set) {
        set.call(vm, value)
      } else {
        vm.$set(path, value)
      }
    })
  }
}

function resetDateAndParseQuery (vm, meta, query) {
  if (!meta) return

  resetData(vm, meta)

  // parse query and assigning to data
  if (query) {
    parseQuery(vm, query, meta)
  }
}

function vueCreatedHandler () {
  let parserOption = this.$options.queryParser
  if (!parserOption) return

  if (parserOption.window) $win = parserOption.window

  let meta = this.__queryParser__ = {}
  meta.pathInfo = collectPathInfo(this, parserOption.target)
  meta.typeInfo = collectTypeInfo(parserOption.type)
  meta.urlVersionKey = parserOption.urlVersionKey || 't'

  this.__winHistoryLen__ = $win.history.length
}

function optionMergeStrategy (toVal, fromVal) {
  if (!toVal) return fromVal
  if (!fromVal) return toVal

  let result = {
    target: toVal.target || fromVal.target,
    type: {}
  }

  let type = result.type

  // copy to type
  let toType = toVal.type
  for (let p in toType) {
    type[p] = [].concat(toType[p])
  }

  // merge from type
  let fromType = fromVal.type
  for (let p in fromType) {
    let typeP = type[p]
    if (typeP) {
      [].concat(fromType[p]).forEach(function (item) {
        if (!typeP.includes(item)) typeP.push(item)
      })
    } else {
      type[p] = fromType[p]
    }
  }

  return result
}

let mixin = {
  init () {
    let vm = this
    let options = vm.$options
    let parserOption = options.queryParser

    if (!parserOption || !parserOption.target) {
      return
    }

    if (!options.computed) options.computed = {}

    options.computed.urlQuery = function () {
      let vm = this
      let parserOption = vm.$options.queryParser

      if (!parserOption || !parserOption.target) {
        return null
      }

      let target = [].concat(parserOption.target)
      let ret = {}

      target.forEach(path => {
        let type = typeof path
        if (type === 'string') {
          util.flattenObj(vm.$get(path), ret)
        } else if (type === 'object') {
          let queryMap = path
          Object.keys(queryMap).forEach(name => {
            let option = queryMap[name]
            util.flattenObj(vm.$get(option.path || name), ret)
          })
        }
      })

      return ret
    }
  },
  created: vueCreatedHandler,
  route: {
    data ({from, to}) {
      let vm = this
      let meta = vm.__queryParser__

      if (!meta) return {}

      let hisLen = $win.history.length
      let lastHisLen = vm.__winHistoryLen__
      vm.__winHistoryLen__ = hisLen

      try {
        if (from.name === to.name) {
          // 用户使用浏览器的前进后退导航，不会导致 history 的长度增加
          let isNavBackForward = lastHisLen === hisLen
          // 当用户通过点击菜单 url 或者手动修改 url 时
          // 改变了 urlVersionKey 为名称的 query 参数
          // 那么也将重设 data 并解析 url query
          let ver = meta.urlVersionKey
          let toVer = to.query[ver]
          let fromVer = from.query[ver]
          if (isNavBackForward || (toVer && toVer !== fromVer)) {
            resetDateAndParseQuery(vm, meta, to.query)
          }
        } else {
          parseQuery(vm, to.query, meta)
        }
      } catch(e) {
        /* eslint-disable no-console */
        console.warn(e)
      }

      return {}
    }
  }
}

function install (Vue) {
  Vue.mixin(mixin)
  Vue.config.optionMergeStrategies.queryParser = optionMergeStrategy
}

// 使用 Vue.use() 安装后就不再使用 vueMixin 和 initOptionMergeStrategy
export default {
  install: install,
  vueMixin: mixin,
  initOptionMergeStrategy: function (Vue) {
    Vue.config.optionMergeStrategies.queryParser = optionMergeStrategy
  }
}
