import Node from "./node.js";

class GameEditor {
    nodes = {};
    constructor(gameData) {
        for (var num in gameData["nodes"]) {
            this.createNode(num, gameData["nodes"][num]["prompt"]);
        }
        this.linkallNodes(gameData);
    }

    createNode(num, text) {
        this.nodes[num] = new Node(text);
    }

    linkallNodes(gameData) {
        for (var num in gameData["nodes"]) {
            for (var opnum in gameData["nodes"][num]["options"]) {
                let node_id = gameData["nodes"][num]["options"][opnum]["node_id"];
                let prompt = gameData["nodes"][num]["options"][opnum]["option"];
                //console.log(this.nodes[node_id]);
                this.nodes[num].addChild(this.nodes[node_id], prompt);
            }
        }
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

    var reader = new FileReader();
    reader.readAsText(file);

    reader.onload = readerEvent => {
        var gameData = readerEvent.target.result;
        createGameEditor(JSON.parse(gameData));
    }

}

function createGameEditor(gameData) {
    console.log(gameData);
    const editor = new GameEditor(gameData);
    console.log(editor.nodes);
}