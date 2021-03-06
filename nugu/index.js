const uuid = require('uuid').v4
const _ = require('lodash')
const { DOMAIN } = require('../config')

class Directive {
  constructor({ type, audioItem }) {
    this.type = type
    this.audioItem = audioItem
  }
}

function audioPlayerDirective() {

  return new Directive({
    type: 'AudioPlayer.Play',
    audioItem: {
      stream: {
        url: `${DOMAIN}`,
        offsetInMilliseconds: 0,
        token: uuid(),
        expectedPreviousToken: 'expectedPreviousToken',
      }
    }
  })
}

let midText
let sum
function throwDice(diceCount) {
  const results = []
  midText = ''
  sum = 0

  console.log(`throw ${diceCount} times`)
  for (let i = 0; i < diceCount; i++) {
    const rand = Math.floor(Math.random() * 6) + 1
    console.log(`${i + 1} time: ${rand}`)
    results.push(rand)
    sum += rand
    midText += `${rand}, `
  }

  midText = midText.replace(/, $/, '')
  return { midText, sum, diceCount }
}

class NPKRequest {
  constructor(httpReq) {
    this.context = httpReq.body.context
    this.action = httpReq.body.action
    console.log(`NPKRequest: ${JSON.stringify(this.context)}, ${JSON.stringify(this.action)}`)
  }

  do(npkResponse) {
    this.actionRequest(npkResponse)
  }

  actionRequest(npkResponse) {
    console.log('actionRequest')
    console.dir(this.action)

    const actionName = this.action.actionName
    const parameters = this.action.parameters

    switch (actionName) {
      case 'ThrowDiceAction' || 'ThrowYesAction':
        let diceCount = 1
        if (!!parameters) {
          const diceCountSlot = parameters.diceCount
          if (parameters.length != 0 && diceCountSlot) {
            diceCount = parseInt(diceCountSlot.value)
          }

          if (isNaN(diceCount)) {
            diceCount = 1
          }
        }
        const throwResult = throwDice(diceCount)
        npkResponse.setOutputParameters(throwResult)
        npkResponse.addDirective(audioPlayerDirective())
        break
      case 'ThrowFinishedDiceAction':
        npkResponse.setOutputParameters({ sum: sum, midText: midText })
    }
  }
}

class NPKResponse {
  constructor() {
    console.log('NPKResponse constructor')

    this.version = '2.0'
    this.resultCode = 'OK'
    this.output = {}
    this.directives = []
  }

  setOutputParameters(throwResult) {

    this.output = {
      diceCount: throwResult.diceCount,
      diceCountConfig: throwResult.diceCount,
      sum: throwResult.sum,
      midText: throwResult.midText,
    }
  }

  addDirective(directive) {
    this.directives.push(directive)
  }
}

const nuguReq = function (httpReq, httpRes, next) {
  npkResponse = new NPKResponse()
  npkRequest = new NPKRequest(httpReq)
  npkRequest.do(npkResponse)
  console.log(`NPKResponse: ${JSON.stringify(npkResponse)}`)
  return httpRes.send(npkResponse)
};

module.exports = nuguReq;
