var numWorkers = 8
var workers = []
var startTime = +new Date

for (var i = 0; i < numWorkers; i++) {


  var worker = new Worker('worker.js')
  workers.push(worker)


  worker.addEventListener('message', function (e) {
    switch (e.data.cmd) {
      case "status":
        status(e.data.data, e.data.id)
        break

      case "log":
        log(e.data.data, e.data.id)
        break

      case "setRate":
        status(addCommasToInteger(e.data.data) + " passwords/second", e.data.id)
        break

      case "foundPassword":
        log("Password Found: " + e.data.data)

        var totalTime = (+new Date - startTime) / 1000
        log("TOTAL TIME: " + totalTime + " seconds")

        workers.forEach(function(worker) {
          worker.terminate()
        })
        log("All Workers Have Been Terminated.")
        break

      default:
        log("Main page doesn't understand command " + e.data.cmd)
        break
    }
  })

  // Error handler
  worker.addEventListener('error', function(e) {
    log(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''))
  })

  // Set worker settings
  worker.postMessage({ cmd: "setWorkerId", data: i })
  worker.postMessage({ cmd: "setMaxPassLength", data: 10 })
  worker.postMessage({ cmd: "setPassToCrack", data: "d8578edf8458ce06fbc5bb76a58c5ca4" })

  // Start worker
  worker.postMessage({ cmd: "performCrack", data: {start: i, hop: numWorkers} })
}

status("Searching for password match for hash 'd8578edf8458ce06fbc5bb76a58c5ca4'.")
log("Testing uppercase, lowercase, and numbers.")


// Helper functions

function addCommasToInteger(x) {
  x = parseInt(x) + ''
  var rgx = /(\d+)(\d{3})/
  while (rgx.test(x)) {
    x = x.replace(rgx, '$1' + ',' + '$2')
  }
  return x
}

function status(msg, workerId) {
  var prefix = workerId != null
    ? "Worker " + workerId + " Status: "
    : "! "

  var selector = workerId != null
    ? "#worker" + workerId
    : "#main"

  document.querySelector(selector).textContent = prefix + msg
}

function log(msg, workerId) {
  var prefix = workerId != null
    ? "Worker " + workerId + " says: "
    : " # "

  var fragment = document.createDocumentFragment();
  fragment.appendChild(document.createTextNode(prefix + msg));
  fragment.appendChild(document.createElement('br'));

  var selector = workerId != null
    ? "#worker" + workerId + "log"
    : "#mainlog"

  document.querySelector(selector).appendChild(fragment)
}
