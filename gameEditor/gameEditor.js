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
        this.nodes[num] = new Node(text);
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
        createBlob();
    }

}

function createGameEditor(gameData) {
    editor = new GameEditor(gameData);
}

function createBlob() {
    const nodeUI = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const attributes = {
        width:"1000",
        rx:"20",
        ry:"20",
        height:"100",
        fill:"#44ffd1"
    };
    for (let attribute in attributes) {
        nodeUI.setAttributeNS(null, attribute, attributes[attribute]);
    }
    document.getElementById("gametree-svg").appendChild(nodeUI);
    //const Buble = document.createElement('div');
}