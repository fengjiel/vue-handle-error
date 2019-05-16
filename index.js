function getComponentName(vm) {
  try {
    if (vm.$root === vm) return 'root'
    var name = vm._isVue ?
      (vm.$options && vm.$options.name) ||
      (vm.$options && vm.$options._componentTag) :
      vm.name
    return (
      (name ? 'component <' + name + '>' : 'anonymous component') +
      (vm._isVue && vm.$options && vm.$options.__file ?
        ' at ' + (vm.$options && vm.$options.__file) :
        '')
    )
  } catch (err) {}
}

function detectOS() {
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

function getBrowserInfo() {
  let Sys = {}
  let ua = navigator.userAgent.toLowerCase()
  let re = /(msie|firefox|chrome|opera|version).*?([\d.]+)/
  let m = ua.match(re)
  Sys.browser = m[1].replace(/version/, "'safari")
  Sys.version = m[2]
  return Sys
}
const browserInfo = getBrowserInfo()
const detectOS = detectOS()
/**
 *
 * @param {*} option
 * @param     option.notifyError:function for notify error
 * @param {*} Vue
 */
export default function (option, Vue) {
  Vue.config.errorHandler = function (err, vm, info) {
    try {
      if (vm) {
        let componentName = getComponentName(vm)
        let propsData = vm.$options && vm.$options.propsData
        let url = window.location.href
        option.notifyError(err, {
          metaData: {
            browserInfo,
            detectOS,
            componentName,
            propsData,
            info,
            url
          }
        })
      } else {
        option.notifyError(err)
      }
    } catch (e) {}
  }
}
