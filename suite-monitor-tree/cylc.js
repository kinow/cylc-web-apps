var d3 = require('d3')

var state_color_map = {
  "held": "magenta",
  "running": "green",
  "succeeded": "black",
  "failed": "red",
  "queued": "blue",
  "submitted": "pink",
  "submit-failed": "orange",
  "waiting": "blue",
  "ready": "#afa",
  "ghost": "#ccc",
  "runahead": "skyblue",
  "FAMILY": "#aaa"
}

function color_by_state(state) {
  col = state_color_map[state];
  if (col === undefined) {
    console.log("ERROR", state);
    return "purple";
  } else { 
    return col;
  }
}

function hello(states) {

// https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd 
// API ref: https://github.com/d3/d3-hierarchy 
// see also:
//   http://www.d3noob.org/2014/01/tree-diagrams-in-d3js_11.html
//   with panning: http://bl.ocks.org/robschmuecker/7926762

// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 900 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
d3.select("svg").remove()
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

var i = 0,
    root;

// declare a tree or cluster layout and assign the size
//var treemap = d3.cluster().size([height, width]);
var tree = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
root = d3.hierarchy(states, function(d) { return d.children; });
root.x0 = height / 2;
root.y0 = 0;

// Sort the children.
root.sort(function(a,b) { return a.data['name'] < b.data['name'] ? 0 : 1 });

// Collapse after the second level
//root.children.forEach(collapse);
update(root, duration=0);

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source, duration) {

  // Assigns the x and y position for the nodes
  var states = tree(root);

  var nodes = states.descendants(),
      links = states.descendants().slice(1);

  // Normalize for fixed-depth.
  // nodes.forEach(function(d){ d.y = d.depth * 150 });

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          //return d._children ? "lightsteelblue" : "#fff";
          return color_by_state(d.data["state"]);
      });

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? -18 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.data.name; });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', function(d) {
      return d._children ? 16 : 10;
    })
    .style("fill", function(d) {
        // return d._children ? "lightsteelblue" : "#fff";
        return color_by_state(d.data["state"]);
    })
    .attr('cursor', 'pointer');

  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d, duration=250);
  }
}
}

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
      console.log("location.pathname: " + location.pathname);
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
    hello(request.response);
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
  d3.select("svg").remove()
  mes.innerHTML = message;
  if (error) {
    mes.style.backgroundColor = "#ff5596";
  } else {
    mes.style.backgroundColor = "#00c798";
  }
}
