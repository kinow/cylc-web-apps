// Are we running in browser or electron native app?
var native_app = true;
try {
  var os = require('os');
} catch(err) {
  var native_app = false;
}

window.onload = function() {
  var inputServer = document.getElementById("textServer");
  if (inputServer.value == "HOSTNAME:PORT") {
    if (native_app) {
      inputServer.value = os.hostname() + ":43001";
    } else {
      // For browser "file://" location.hostname etc. is not defined.
      inputServer.value = "vagrant:43002";
    }
  }
  var selectAPI = document.getElementById("selectAPI");
  var loadButton = document.getElementById("loadButton");
  loadButton.onclick = function() {
    make_request(inputServer.value.trim(), selectAPI.value);
  }
  selectAPI.addEventListener("change", function(event) {
    // Generate loadButton click on select change.
    loadButton.click();
  });
  inputServer.addEventListener("keyup", function(event) {
    // Generate loadButton click event on input <enter>.
    event.preventDefault();
    if (event.keyCode === 13) {
      loadButton.click();
    }
  });
}

function make_request(server, call) {
  var request = new XMLHttpRequest();
  var URL = "https://" + server + "/" + call;
  console.log(URL);
  request.onload = function() {
    updatePageMessage("GOOD:  <a href=" + URL + ">" + URL + "</a>", false);
    updatePageJSON(request.response);
  }
  request.onerror = function(e) {
    updatePageMessage("ERROR: <a href=" + URL + ">" + URL + "</a>", true);
    updatePageJSON();
  }
  request.open('GET', URL);
  request.responseType = 'json';
  request.send();
}

function updatePageMessage(message, error) {
  var mes = document.getElementById("message")
  mes.innerHTML = message;
  if (error) {
    mes.style.backgroundColor = "#ff5596";
  } else {
    mes.style.backgroundColor = "#00c798";
  }
}

function updatePageJSON(jsonObj) {
  document.getElementById("cylc-data").textContent =
    JSON.stringify(jsonObj, null, 4);
}
