import "./Node"

class GameEditor {
    nodes = [];
    constructor(nodes) {
        this.nodes = nodes;
    }

    createNode(text, children) {
        this.nodes.push(new Node());
    }

    linkNodes(parent, child, prompt) {
        parent.children.push((child, prompt));
    }

    deleteNodes(node) {
        for (var index in node.parents) {
            parent = node.parents[index][0];
            delete parent[node.parents[index][1]];
        }
        delete this.nodes.map(e => e.text).indexOf(node.text);
    }
}
