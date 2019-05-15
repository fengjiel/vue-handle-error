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
  } catch (err) {}
}
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
