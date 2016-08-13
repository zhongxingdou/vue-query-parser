import parseNative from '../lib/parse_native';
import chai from 'chai'
let { assert, expect } = chai
chai.should()

describe('parseNative()', () => {
  it('parse string normal', () => {
    assert.equal(parseNative('', 'String'), '')
    assert.equal(parseNative('8', 'String'), '8')
    assert.equal(parseNative('hello', 'String'), 'hello')
  })

  it('parse number normal', () => {
    assert.equal(parseNative('8', 'Number'), 8)
    assert.equal(parseNative('-1', 'Number'), -1)
    assert.equal(parseNative('0', 'Number'), 0)
    assert.equal(parseNative('0.3', 'Number'), 0.3)
  })

  it('parse boolean normal', () => {
    assert.equal(parseNative('true', 'Boolean'), true)
    assert.equal(parseNative('false', 'Boolean'), false)

    expect(parseNative('1', 'Boolean')).to.be.an('null')
    expect(parseNative('0', 'Boolean')).to.be.an('null')
  })

  it('parse array normal', () => {
    let ret = parseNative(['8', '3'], '[Number]')

    ret.should.have.length(2)
    ret.should.have.members([8, 3])
  })

  it('parse date normal', () => {
    let ret = parseNative('2014-08-03', 'Date')

    expect(ret).to.be.an.instanceof(Date)
    assert.equal(ret.getFullYear(), 2014)
    assert.equal(ret.getMonth(), 8 - 1)
    assert.equal(ret.getDate(), 3)
  })

  it('parse regexp normal', () => {
    let ret = parseNative('/abc\//', 'RegExp')

    expect(ret).to.be.an.instanceof(RegExp)
    assert.ok(ret.test('abc/'))
  })
})
