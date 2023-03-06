export default class Node {
    
    constructor(text, num) {
        this.text = text || '';
        this.num = num;
        this.children = [];
        this.parents = [];
    }

    addChild(node, prompt) {
        this.children.push({prompt, node});
        node.parents.push(this);
    }

    changeText(newText) {
        this.text = newText;
    }

}