import Node from "./node.js";

var editor;

class GameEditor {
    nodes = {};
    root = null;
    constructor(gameData) {
        this.root = this.#createGameTree(gameData, gameData["start_node"], new Set([]));
    }

    #createGameTree(gameData, current_num, visited) {
        if (visited.has(current_num)) {
            return this.nodes[current_num];
        }

        visited.add(current_num);
        this.createNode(current_num, gameData["nodes"][current_num]["prompt"]);

        let children = [];
        let options = gameData["nodes"][current_num]["options"];
        for (let option in options) {
            let child_node = this.#createGameTree(gameData, options[option]["node_id"], visited, current_num);
            let child_prompt = options[option]["option"];
            children.push({prompt: child_prompt, node: child_node});
            child_node.parents.push(this.nodes[current_num]);
        }

        
        this.nodes[current_num].children = children;
        return this.nodes[current_num];
    }

    createNode(num, text) {
        this.nodes[num] = new Node(text, num);
    }

    linkNodes(parent, child, prompt) {
        parent.children.push((child, prompt));
    }

    deleteNode(node) {
        for (var index in node.parents) {
            parent = node.parents[index][0];
            delete parent[node.parents[index][1]];
        }
        delete this.nodes.map(e => e.text).indexOf(node.text);
    }
}

export function editGameFile() {

    const fileInput = document.getElementById("game-file");
    const file = fileInput.files[0];

    const fileDiv = document.getElementById("file-div");
    fileDiv.parentNode.removeChild(fileDiv);

    d3.select("#teal-options").remove();

    var reader = new FileReader();
    reader.readAsText(file);

    reader.onload = readerEvent => {
        var gameData = readerEvent.target.result;
        createGameEditor(JSON.parse(gameData));
        visualize(editor.root);
    }

}

function createGameEditor(gameData) {
    
    editor = new GameEditor(gameData);
    console.log(editor);
}


function visualize(root) {

    d3.select("#teal-ui").append("svg").attr("viewBox", "0 0 2000 800").attr("id", "editor-canvas");

    let visited = new Set();
    var dpOne = [];
    var dpTwo = [];

    visited.add(root.num);
    for (var child of root.children) {
        if (visited.has(child.node.num)) {
            continue;
        }

        dpOne.push(child.node.num);
        for(let child2 of child.node.children) {
            if (visited.has(child2.node.num)) {
                continue;
            }

            dpTwo.push(child2.node.num);
            visited.add(child2.node.num);
        }
    }

    // created nodes at their positions
    visualizeNode(root, "100", "900");
    drawNodesAtDepth(dpOne, "200");
    drawNodesAtDepth(dpTwo, "300");

    const rootsvg = d3.select(`[id="${root.num}"]`);
    //draw arrows from root to depthOne
    for (var child of root.children) {
        let elem = d3.select(`[id="${child.node.num}"]`);
        drawArrow(rootsvg, elem);
        for (var child2 of child.node.children) {
            let childSvg = d3.select(`[id="${child2.node.num}"]`);
            drawArrow(elem, childSvg);
        }
    }

}

function visualizeNode(node, yVal, xVal) {
    var g = d3.select("#editor-canvas").append("g").attr("id", node.num).attr("class", "node");
    var svg = g.append("svg").attr("width" , "200").attr("height", "60").attr("y", yVal).attr("x", xVal);
    svg.append('rect')
        .attr("fill", "black")
        .attr('stroke', 'black')
        .attr('width', 200)
        .attr('height', 50)
        .attr("rx", "10%")
        .attr("ry", "10%")

    svg.append('text')
        .attr("transform", "translate(18,30)")
        .attr("fill", "#00a6fb")
        .attr("font-size", "13")
        .text(`${node.num}: ${node.text.substring(0,15)} ...`);
    
    g.on("click", function() {
        // need to display details of this story node.
        const nodeNum = d3.select(this).attr("id");
        const svg = document.getElementById("editor-canvas");
        svg.parentNode.removeChild(svg);

        const tealOp = d3.select("#teal-ui").attr("id", "teal-options");

        tealOp.append("svg")
            .attr("width" , "100")
            .attr("height", "30")
            .append("text")
            .attr("y", "25")
            .attr("x", "10")
            .text("Prompt:")
            .attr("font-size", "22")
            .attr("fill", "#44ffd1");
        
        tealOp.append("br");

        tealOp.append("input")
            .attr("class", "node-view")
            .attr("type", "text")
            .attr("value", editor.nodes[nodeNum].text);

        tealOp.append("br");

        tealOp.append("svg")
            .attr("width" , "110")
            .attr("height", "30")
            .append("text")
            .attr("y", "25")
            .attr("x", "10")
            .text("Options:")
            .attr("font-size", "22")
            .attr("fill", "#44ffd1");

        tealOp.append("br");
        
        for (let child of editor.nodes[nodeNum].children) {
            tealOp.append("input")
            .attr("class", "node-view")
            .attr("id", child.node.num)
            .attr("type", "text")
            .attr("value", child.prompt);
        }

    });
}

/* 
    This function takes svg elements corresponding to depths 0-2 and draws
    the nodes so that they are spaced evenly from the center at a given depth.
    It calculates spacing depending on the number of elements at any depth.
*/
function drawNodesAtDepth(nodesAtDepth, yVal) {
    //the root is translated to the middle
    
    const minTransOne = (2000/nodesAtDepth.length);
    var x = minTransOne - ((2000/nodesAtDepth.length)/2);
    var svgs = [];

    for (var nodeNum of nodesAtDepth) {
        svgs.push(visualizeNode(editor.nodes[nodeNum], yVal, (x - 100).toString()));
        x += minTransOne;
    }
    return svgs;
}

function drawArrow(root, child) {

    const parent = {x: root.node().getBBox().x + 100 , y: root.node().getBBox().y + 50};
    const _child = {x: child.node().getBBox().x + 100, y: child.node().getBBox().y};
    const svg = d3.select("#editor-canvas");

    //check if parent is below child
    if (parent.y > _child.y) {

        const curve = d3.line().curve(d3.curveNatural);
        var points;


        if (parent.x > _child.x) 
            points = [[parent.x, parent.y], [parent.x + 200,  parent.y + 10], [parent.x + 200, _child.y - 10], [_child.x , _child.y - 50], [_child.x, _child.y]]; 
        else 
            points = [[parent.x, parent.y], [parent.x - 200,  parent.y + 10], [_child.x, _child.y]];
            

        svg.append('path')
            .attr('d', curve(points))
            .attr('stroke', 'black')
            .attr('stroke-width', 3)
            .attr('fill', 'none');

        return;
    }

    const link = d3
        .linkVertical()
        .x(d => d.x)
        .y(d => d.y)({
        source: parent,
        target: _child
    });

    svg.append('path')
        .attr('d', link)
        .attr('stroke', 'black')
        .attr('stroke-width', 3)
        .attr('fill', 'none');
    
}