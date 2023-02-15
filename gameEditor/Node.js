export default class Node {
    text = '';
    children = [];
    parents = [];
    constructor(text) {
        this.text = text;
    }

    addChild(newNode, prompt) {
        this.children.push({prompt: prompt, node: newNode});
        newNode.parents.push(this);
    }

    changeText(newText) {
        this.text = newText;
    }

}