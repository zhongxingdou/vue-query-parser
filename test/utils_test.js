import utils from '../lib/utils';
import chai from 'chai'
let { assert, expect } = chai
chai.should()

describe('utils', () => {
  describe('.getLastSecOfObjPath()', () => {
    let getLastSecOfObjPath = utils.getLastSecOfObjPath
    it('normal', () => {
      assert.equal(getLastSecOfObjPath('a.b.c'), 'c')
      assert.equal(getLastSecOfObjPath('student.name'), 'name')
      assert.equal(getLastSecOfObjPath('student'), 'student')
    })
  })

  describe('.isValueType()', () => {
    let isValueType = utils.isValueType
    it('normal', () => {
      assert.ok(isValueType(8))
      assert.ok(isValueType('8'))
      assert.ok(isValueType(''))
      assert.ok(isValueType(true))
      assert.ok(isValueType(false))

      assert.isNotOk(isValueType(null))
      assert.isNotOk(isValueType(undefined))
      assert.isNotOk(isValueType({}))
      assert.isNotOk(isValueType([]))
      assert.isNotOk(isValueType(new Date))
    })
  })

  describe('.getPathValue()', () => {
    let getPathValue = utils.getPathValue
    it('normal', () => {
      let obj = {
        a: {
          b: {
            c: {}
          }
        }
      }

      assert.equal(getPathValue(obj, 'a.b.c'), obj.a.b.c)
      assert.equal(getPathValue(obj, 'a.b'), obj.a.b)
      assert.equal(getPathValue(obj, 'a'), obj.a)

      expect(getPathValue(obj, 'a.b.d')).be.an('undefined')
      expect(getPathValue(obj, 'b.d')).be.an('undefined')
    })
  })

  describe('.filterSubPath()', () => {
    let filterSubPath = utils.filterSubPath
    it('normal', () => {
      let ret = filterSubPath(['a.b.c', 'a.b', 'a'])

      ret.should.have.length(1)
      assert.equal(ret[0], 'a')
    })
  })
});
