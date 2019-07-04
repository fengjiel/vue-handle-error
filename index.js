function getComponentName (vm) {
  try {
    if (vm.$root === vm) return 'root'
    var name = vm._isVue
      ? (vm.$options && vm.$options.name) ||
      (vm.$options && vm.$options._componentTag)
      : vm.name
    return (
      (name ? 'component <' + name + '>' : 'anonymous component') +
      (vm._isVue && vm.$options && vm.$options.__file
        ? ' at ' + (vm.$options && vm.$options.__file)
        : '')
    )
  } catch (err) {
    return null
  }
}

function getDetectOS () {
  let sUserAgent = navigator.userAgent
  let isWin = ['Win32', 'Windows'].includes(navigator.platform)
  let isMac = ['Mac68K', 'MacPPC', 'Macintosh', 'MacIntel'].includes(navigator.platform)
  if (isMac) return 'MacOS'

  let isUnix = (navigator.platform === 'X11') && !isWin && !isMac
  if (isUnix) return 'Unix'

  let isLinux = String(navigator.platform).includes('Linux')
  if (isLinux) return 'Linux'

  if (isWin) {
    let isWin2K = sUserAgent.includes('Windows NT 5.0') || sUserAgent.includes('Windows 2000')
    if (isWin2K) return 'Windows2000'

    let isWinXP = sUserAgent.includes('Windows NT 5.1') || sUserAgent.includes('Windows XP')
    if (isWinXP) return 'WindowsXP'

    let isWin2003 = sUserAgent.includes('Windows NT 5.2') || sUserAgent.includes('Windows 2003')
    if (isWin2003) return 'Windows2003'

    let isWinVista = sUserAgent.includes('Windows NT 6.0') || sUserAgent.includes('Windows Vista')
    if (isWinVista) return 'Windows Vista'

    let isWin7 = sUserAgent.includes('Windows NT 6.1') || sUserAgent.includes('Windows 7')
    if (isWin7) return 'Windows7'

    let isWin10 = sUserAgent.includes('Windows NT 10.0') || sUserAgent.includes('Windows 10')
    if (isWin10) return 'Windows10'

    return 'Windows other'
  }
  return 'other'
}

function getBrowserInfo () {
  let Sys = {}
  let ua = navigator.userAgent.toLowerCase()
  let re = /(msie|firefox|chrome|opera|version).*?([\d.]+)/
  let m = ua.match(re)
  Sys.browser = m[1].replace(/version/, "'safari")
  Sys.version = m[2]
  return Sys
}
function _handleEvent (opt, event) {
  if (event && event.currentTarget && event.currentTarget.status !== 200) {
    notify(opt, 'requestError', {
      type: ['JsError', 'requestErr'],
      info: {
        reqUrl: event.currentTarget.responseURL,
        reqStatus: event.currentTarget.status,
        reqStatusText: event.currentTarget.statusText,
        reqTimeout: event.currentTarget.timeout
      }
    })
  }
}
function reWriteXML (opt) {
  if (!window.XMLHttpRequest) return
  var xmlhttp = window.XMLHttpRequest
  var _oldSend = xmlhttp.prototype.send

  xmlhttp.prototype.send = function () {
    if (this['addEventListener']) {
      this['addEventListener']('error', _handleEvent)
      this['addEventListener']('load', _handleEvent)
      this['addEventListener']('abort', _handleEvent)
    } else {
      var _oldStateChange = this['onreadystatechange']
      this['onreadystatechange'] = function (event) {
        if (this.readyState === 4) {
          _handleEvent(opt, event)
        }
        _oldStateChange && _oldStateChange.apply(this, arguments)
      }
    }
    return _oldSend.apply(this, arguments)
  }
}

function rewriteFetch (opt) {
  if (!window.fetch) return
  let _oldFetch = window.fetch
  window.fetch = function () {
    return _oldFetch.apply(this, arguments)
      .then(res => {
        if (!res.ok) { // True if status is HTTP 2xx
          // 上报错误
          _handleEvent(opt, res)
        }
        return res
      })
      .catch(error => {
        // 上报错误
        _handleEvent(opt, error)
        throw error
      })
  }
}

function notify (option, err, info) {
  let url = window.location.href
  option.notifyError(err, {
    browserInfo,
    detectOS,
    url,
    ...info
  })
}
const browserInfo = getBrowserInfo()
const detectOS = getDetectOS()

/**
 *
 * @param {*} option
 * @param     option.detectionRequest //Boolean
 * @param     option.useWindowErr //Boolean
 * @param     option.detectionSourceError //Boolean
 * @param     option.notifyError:function for notify error
 * @param {*} Vue
 */

export default function (opt, Vue) {
  if (!Vue) {
    throw new Error('无法找到Vue实例')
  }
  if (process.env.NODE_ENV === 'development') {
    return
  }

  let defaultOption = {
    detectionRequest: true,
    useWindowErr: false,
    detectionSourceError: true,
    notifyError () {}
  }
  let option = {}
  Object.assign(option, defaultOption, opt)

  if (option.detectionRequest !== false) {
    reWriteXML(option)
    rewriteFetch(option)
  }

  window.addEventListener('error', e => {
    e.stopImmediatePropagation()
    const srcElement = e.srcElement
    if (srcElement === window && option.useWindowErr) {
      notify(option, e.message, {
        type: ['windowErr', 'sourceError'],
        info: {
          filename: e.filename,
          type: e.type,
          lineno: e.lineno,
          colno: e.colno
        }
      })
    }

    if (srcElement !== window && option.detectionSourceError) {
      notify(option, `tag:${srcElement.tagName} src:${srcElement.src} error`, {
        type: ['windowErr', 'sourceError'],
        info: {
          tagName: srcElement.tagName,
          src: srcElement.src,
          type: e.type
        }
      })
    }
  }, true)
  if (!option.useWindowErr) {
    Vue.config.errorHandler = function (err, vm, info) {
      try {
        if (vm) {
          let componentName = getComponentName(vm)
          let propsData = vm.$options && vm.$options.propsData
          notify(option, err, {
            type: ['vueHandlerErr', 'JsError'],
            componentName,
            propsData,
            info
          })
        } else {
          option.notifyError(err)
          notify(option, err, {
            type: ['vueHandlerErr', 'JsError']
          })
        }
      } catch (e) {}
    }
  }
}
