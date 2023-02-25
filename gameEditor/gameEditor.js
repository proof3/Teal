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
}


function visualize(root) {
    let visited = new Set();
    d3.select("#teal-ui").append("svg").attr("viewBox", "0 0 2000 2000").attr("id", "editor-canvas");

    var rootSvg = visualizeNode(root);
    visited.add(root.num, "50");
    var dpOneSvg = [];
    var dpTwoSvg = [];

    
    for (let keyOne in root.children) {
        let child = root.children[keyOne]["node"];
        if (visited.has(child.num)) {
            continue;
        }

        dpOneSvg.push(visualizeNode(child, "150"));
        for(let keyTwo in child.children) {
            if (visited.has(child.children[keyTwo]["node"].num)) {
                continue;
            }

            dpTwoSvg.push(visualizeNode(child.children[keyTwo]["node"], "300"));
            visited.add(child.children[keyTwo]["node"].num);
        }
    }

    // translate all created nodes to correct position and add arrows
    translateNodes(rootSvg, dpOneSvg, dpTwoSvg);
    
}

function visualizeNode(node, yVal) {
    var g = d3.select("#editor-canvas").append("g").attr("id", node.num).attr("class", "node");
    var svg = g.append("svg").attr("width" , "200").attr("height", "60").attr("y", yVal);
    svg.append('rect')
        .attr("fill", "black")
        .attr('stroke', 'black')
        .attr('width', 200)
        .attr('height', 50)
        .attr("rx", "10%")
        .attr("ry", "10%")

    svg.append('text')
        .attr("transform", "translate(90,30)")
        .attr("fill", "#00a6fb")
        .text(node.num);

    return g;
}

/* 
    This function takes svg elements corresponding to depths 0-2 and translates
    the nodes so that they are spaced evenly from the center at a given depth.
    It calculates spacing depending on the number of elements at any depth.
    It only translates the x cordinates as the y coordinates are fixed.
*/
function translateNodes(rootSvg, dpOneSvg, dpTwoSvg) {
    //the root is translated to the middle
    rootSvg.attr("transform", "translate(900 0)");
    
    const minTransOne = (2000/dpOneSvg.length);
    var translation = minTransOne - ((2000/dpOneSvg.length)/2);
    let dpOneCords = {}
    for(let elem of dpOneSvg) {
        elem.attr("transform", "translate("+ (translation - 100).toString() + " 0)");
        drawArrow({x: 1000, y: 50}, {x: translation, y: elem.node().getBBox().y});

        dpOneCords[elem.attr("id")] = {x: translation, y: elem.node().getBBox().y + 50}
        translation+= minTransOne;
    }

    const minTransTwo = (2000/dpTwoSvg.length) - ((2000/dpTwoSvg.length)/2);
    translation = minTransTwo;
    for(let elem of dpTwoSvg) {
        elem.attr("transform", "translate("+ (translation - 100).toString() + " 0)");
        console.log(editor.nodes[elem.attr("id")]);
        for (parent of editor.nodes[elem.attr("id")].parents) {
            if (dpOneCords[parent.num] == undefined) continue;
            drawArrow({x: dpOneCords[parent.num].x, y: dpOneCords[parent.num].y}, {x: translation, y: elem.node().getBBox().y});
        }

        translation+= minTransOne;
    }
}

function drawArrow(parent, child) {

    const link = d3
        .linkVertical()
        .x(d => d.x)
        .y(d => d.y)({
        source: parent,
        target: child
    });

    var svg = d3.select("#editor-canvas");

    svg
        .append('path')
        .attr('d', link)
        .attr('stroke', 'black')
        .attr('stroke-width', 3)
        .attr('fill', 'none');
    
}