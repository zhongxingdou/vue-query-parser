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
              query: {
                pageIndex: '9'
              }
            }
          })
        })
      }
    }

    vm = new Vue({
      mixins: [mockRouter, queryParser.vueMixin],
      data: {
        fruits: [],
        pager: {
          pageIndex: 0,
          pageSize: 10
        }
      },
      queryParser: {
        window: mockWindow,
        target: ['pager', 'fruits'],
        type: {
          Number: ['pageIndex', 'pageSize'],
          '[String]': ['fruits']
        }
      }
    })
  })

  it.skip('normal', (done) => {
    let fruits = ['apple', 'banana']
    vm.$route.query = {
      pageIndex: '8',
      pageSize: '20',
      fruits
    }

    vm.$nextTick(() => {
      let pager = vm.pager
      assert.equal(pager.pageIndex, 8)
      assert.equal(pager.pageSize, 20)
      assert.deepEqual(vm.fruits, fruits)
      done()
    })
  })

  it.skip('sync query on created', function () {
    assert.equal(vm.pager.pageIndex, 9)
  })

  it.skip('reset data before sync query', () => {
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
