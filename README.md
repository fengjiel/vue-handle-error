## Vue错误监控插件


#### 安装

```bash
npm install vue-handle-error --save
```

#### 使用

```javascript
import Vue from 'vue'
import handleError from "vue-handle-error";
handleError(option, Vue);
```

##### option list
      option.detectionRequest:是否监听XMLHttpRequest/fetch错误 Boolean（默认为true）

      option.useWindowErr:是否使用window的error事件进行监听错误，如果设置为true则会取消vue的errorHandler监听事件（默认为false）

      option.detectionSourceError:是否监听资源错误捕获 （默认为true）

      option.notifyError:接收到错误触发的回调，含有两个入参
                  ~ err：错误信息
                  ~ metaData：
                      - browserInfo：浏览器信息
                      - detectOS：系统信息
                      - componentName：产生错误的组件Name
                      - propsData：vm.$options.propsData
                      - info：Vue 特定的错误信息，比如错误所在的生命周期钩子
                      - url：错误发生时所在的url
        
      ...
