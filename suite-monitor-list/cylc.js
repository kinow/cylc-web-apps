
// Are we running in browser or electron native app?
var native_app = true;
try {
 // var os = require('os');
  var d3 = require('d3')
} catch(err) {
  var native_app = false;
}

var state_color_map = {
  "held": "magenta",
  "running": "green",
  "succeeded": "black",
  "failed": "red",
  "queued": "blue",
  "submitted": "pink",
  "submit-failed": "orange",
  "waiting": "blue",
  "ready": "#8f8",
  "ghost": "#ccc",
  "runahead": "skyblue",
  "FAMILY": "#aaa"
}

function color_by_state(state) {
  col = state_color_map[state];
  if (col === undefined) {
    return "purple";
  } else { 
    return col;
  }
}

// Notes:
//  - to collapse all, don't stop event propagation
//  - collapse removes nodes, so internal collapsed state isn't retained
//  - currently only does a first update

function nestedList(states) {
    var parent = d3.select("#cylc");
    var list = parent.selectAll("li")
      .data([states])
      .enter()
      .append("li")
      .text(function (d, i) {
        return d.name;
      })
    .on("click", expand);

    function expand() {
      d3.event.stopPropagation()
        d3.select(this)
        .on("click", collapse)
        .append("ul")
        .selectAll("li")
        .data(function (d, i) {
           if (d.hasOwnProperty("children")) {
             return d.children;
           } else {
             return [];
           }
        })
      .enter()
        .append("li")
        .attr("id", "child")
        .text(function (d, i) {
          return d.name + '...' + d.batch_sys;
        })
      .style("color", function (d, i) {
        return color_by_state(d.state);
      });
      d3.select(this).selectAll("li#child").on("click", expand);
    }

    function collapse() {
      d3.event.stopPropagation()
        d3.select(this)
        .on("click", expand)
        .select("ul")
        .remove();
    }
}

window.onload = function() {
  var inputServer = document.getElementById("textServer");
  if (inputServer.value == "HOSTNAME:PORT") {
    if (native_app) {
      inputServer.value = os.hostname() + ":43001";
    } else {
      // For browser "file://" location.hostname etc. is not defined.
      inputServer.value = "HOSTNAME:43001";
    }
  }
  var loadButton = document.getElementById("loadButton");
  loadButton.onclick = function() {
    make_request(inputServer.value.trim(), 'get_task_states_tree');
  }
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
  request.onload = function() {
    updatePageMessage("GOOD:  <a href=" + URL + ">" + URL + "</a>", false);
    nestedList(request.response);
  }
  request.onerror = function(e) {
    updatePageMessage("ERROR: <a href=" + URL + ">" + URL + "</a>", true);
  }
  request.open('GET', URL);
  request.responseType = 'json';
  request.send();
}

function updatePageMessage(message, error) {
  var mes = document.getElementById("message")
  d3.select("svg").remove()
  mes.innerHTML = message;
  if (error) {
    mes.style.backgroundColor = "#ff5596";
  } else {
    mes.style.backgroundColor = "#00c798";
  }
}
