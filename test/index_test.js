import chai from 'chai'
let { assert } = chai
chai.should()

import queryParser from '../lib/index';
import Vue from 'vue'

describe('vue-query-parser', () => {
  let vm, mockRouter, mockWindow

  beforeEach(() => {
    mockWindow = {
      history: {
        length: 1
      }
    }

    mockRouter = {
      init: function () {
        Object.assign(this, {
          $route: new Vue({
            data: {
              query: {}
            }
          })
        })
      }
    }

    vm = new Vue({
      mixins: [mockRouter, queryParser.vueMixin],
      data: {
        pager: {
          pageIndex: 0,
          pageSize: 10
        }
      },
      queryParser: {
        window: mockWindow,
        target: ['pager'],
        type: {
          Number: ['pageIndex', 'pageSize']
        }
      }
    })
  })

  it('normal', (done) => {
    vm.$route.query = {
      pageIndex: '8',
      pageSize: '20',
      fruits: ['apple', 'banana']
    }

    vm.$nextTick(() => {
      let pager = vm.pager
      assert.equal(pager.pageIndex, 8)
      assert.equal(pager.pageSize, 20)
      done()
    })
  })

  it('will reset data before parse query', () => {
    vm.pager = {
      pageIndex: 3,
      pageSize: 20
    }

    vm.$route.query = {
      pageIndex: '8'
    }

    vm.$nextTick((done) => {
      let pager = vm.pager
      assert.equal(pager.pageIndex, 8)
      assert.equal(pager.pageSize, 10)
      done()
    })
  })
})
