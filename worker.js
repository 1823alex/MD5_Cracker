importScripts('md5.js', 'chars.js')

var workerId
  , maxPassLength = undefined
  , passToCrack = undefined

var interval = 100000
  , count = 0
  , startTime = +new Date

function status(msg) {
  this.postMessage( {cmd: "status", data: msg, id: workerId })
}
function log(msg) {
  this.postMessage( {cmd: "log", data: msg, id: workerId })
}

function crack(options) {
  status("Started cracking")

  var hop = options.hop
    , length = 1
    , buf = new ArrayBuffer(maxPassLength)
    , bufView = new Uint8Array(buf)
    , view = bufView.subarray(maxPassLength - length)
    , numBefore, num, pw

  bufView[maxPassLength - 1] = from + options.start 

  while (true) {
    pw = String.fromCharCode.apply(null, view)

    if (md5(pw) == passToCrack) {
      this.postMessage({ cmd: "foundPassword", data: pw, id: workerId })
      return
    }

    numBefore = view[length - 1]
    num = (view[length - 1] += hop)

    if (numBefore < skip1_from && num >= skip1_from) {
      view[length - 1] = skip1_to + (num - skip1_from)
    
    } else if (numBefore < skip2_from && num >= skip2_from) {
      view[length - 1] = skip2_to + (num - skip2_from)
    }

    for (var i = length - 1; i >= 0; --i) {

      if (view[i] >= to) {    

        view[i] = (view[i] % to) + from

        if (i == 0) {

          length += 1
          view = bufView.subarray(maxPassLength - length)
          view[0] = from

          if (length > maxPassLength)
            return

        } else {

          num = (view[i - 1] += 1)

          if (num == skip1_from) {
            num = (view[i - 1] = skip1_to)
          }
          if (num == skip2_from) {
            num = (view[i - 1] = skip2_to)
          }
        }

      }
    }

    count += 1
    if (count % interval == 0) {
      this.postMessage({ cmd: "setRate", data: interval / ((new Date - startTime) / 1000), id: workerId })
      count = 0
      startTime = +new Date
    }
  }

}

this.addEventListener('message', function(e) {

  switch (e.data.cmd) {
    case "setWorkerId":
      workerId = e.data.data
      break

    case "setMaxPassLength":
      maxPassLength = e.data.data
      break

    case "setPassToCrack":
      passToCrack = e.data.data
      break

    case "performCrack":
      crack(e.data.data)
      break

    default:
      this.postMessage({ cmd: "log", data: "Worker doesn't understand command " + e.data.cmd })
      break

  }

})

