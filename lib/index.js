/* global window: true */
import isPlainObject from 'is-plain-object'
import util from './utils'
import parseNative from './parse_native'

let win = typeof window !== 'undefined' ? window : null

function parseQuery (vm, query, meta) {
  if (!query) return
  let {pathInfo: { assignPath }, typeInfo} = meta

  for (let name in query) {
    let path = assignPath[name]
    if (path) {
      let value = query[name]
      let type = typeInfo[name]
      if (type) {
        value = parseNative(value, type)
        if (value !== null && value !== undefined) {
          vm.$set(path, value)
        }
      } else {
        vm.$set(path, value)
      }
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

  target = [].concat(target)
  target.forEach((path) => {
    let t = typeof path
    if (t === 'string') {
      resetPath.push(path)
      let value = vm.$get(path)
      let name = util.getLastSecOfObjPath(path)
      if (isPlainObject(value)) {
        collectObjPathInfo(value, assignPath, path)
      } else {
        assignPath[name] = path
      }
    } else if (t === 'object') {
      // query 中的 name 和 data 中的 name 不一致
      // 以 { queryName: dataPath } 声明
      for (let queryName in path) {
        let dataPath = path[queryName]
        assignPath[queryName] = dataPath
        resetPath.push(dataPath)
      }
    }
  })
  resetPath = util.filterSubPath(resetPath)

  return { assignPath, resetPath }
}

function routeQueryWatcher (query) {
  let vm = this
  let winHistoryLen = win.history.length

  // 用户正在使用浏览器的前进后退导航，不会导致 history 的长度增加
  if (vm.__winHistoryLen__ === winHistoryLen) {
    let meta = vm.__queryParser__
    if (!meta) return

    // reset data to initial value
    let resetPath = meta.pathInfo.resetPath
    if (resetPath.length) {
      let data = vm.$options.data()
      resetPath.forEach(function (path) {
        vm.$set(path, util.findMemberByObjPath(data, path))
      })
    }

    // parse query and assigning to data
    if (query) {
      parseQuery(vm, query, meta)
    }
  } else {
    vm.__winHistoryLen__ = winHistoryLen
  }
}

function vueCreatedHandler () {
  let parserOption = this.$options.queryParser
  if (!parserOption) return

  if (parserOption.window) win = parserOption.window

  let meta = this.__queryParser__ = {}
  meta.pathInfo = collectPathInfo(this, parserOption.target)
  meta.typeInfo = collectTypeInfo(parserOption.type)

  let query = this.$route.query
  if (query) parseQuery(this, query, meta)

  this.__winHistoryLen__ = win.history.length
  this.$watch('$route.query', routeQueryWatcher.bind(this))
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
  created: vueCreatedHandler
}

function install (Vue) {
  Vue.mixin({ created: vueCreatedHandler })
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
