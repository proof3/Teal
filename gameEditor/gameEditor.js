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

    visualizeNode(root, "#depth0");
    visited.add(root.num);

    for (let keyOne in root.children) {
        let child = root.children[keyOne]["node"];
        if (visited.has(child.num)) {
            continue;
        }

        visualizeNode(child, "#depth1");
        visited.add(child.num);
        for(let keyTwo in child.children) {
            if (visited.has(child.children[keyTwo]["node"].num)) {
                continue;
            }

            visualizeNode(child.children[keyTwo]["node"], "#depth2");
            visited.add(child.children[keyTwo]["node"].num);
        }
    }

    
}

function visualizeNode(node, depthId) {
    var svg = d3.select(depthId).append("svg").attr("viewBox", "0 0 200 100").attr("style", "max-height: 400px; max-width:200px;");
    svg.append('rect')
        .attr("fill", "black")
        .attr('stroke', 'black')
        .attr('width', 200)
        .attr('height', 50)
        .attr("rx", "10%")
        .attr("ry", "10%");

    svg.append('text')
        .attr("transform", "translate(90,30)")
        .attr("fill", "#00a6fb")
        .text(node.num);
}