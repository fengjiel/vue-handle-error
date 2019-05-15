## Vue错误监控插件


####安装

```bash
npm install vue-handle-error --save
```

####使用

```javascript
import Vue from 'vue'
import handleError from "vue-handle-error";
handleError(option, Vue);
```

##### option list
      notifyError:接收到错误触发的回调，含有两个入参
                  ~ err：错误信息
                  ~ metaData：
                      - componentName：产生错误的组建
                      - propsData：vm.$options.propsData
                      - info：Vue 特定的错误信息，比如错误所在的生命周期钩子
                      - url：错误发生时所在的url
        
      ...
      //TODO