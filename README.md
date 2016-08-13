# vue-query-parser

A Vue plugin used to sync data between vue-router query and component data.

Sync is automatically invoked after user trigger browser navigate or refresh page.

## Install
npm install vue-query-parser --save

## Usage

componentName.vue

```javascript
import vueQueryParser from 'vue-query-parser'

export default {
  mixin: [vueQueryParser.vueMixin]
  queryParser: {
    target: ['pager']
    type: {
      'Number': ['pageIndex', 'pageSize']
    }
  },
  data () {
    list: [],
    pager: {
      pageIndex: 1,
      pageSize: 10
    }
  }
}
```
