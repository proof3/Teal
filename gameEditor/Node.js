export default class Node {
    text = '';
    num;
    children = [];
    parents = [];
    constructor(text, num) {
        this.text = text;
        this.num = num;
    }

    addChild(newNode, prompt) {
        this.children.push({prompt: prompt, node: newNode});
        newNode.parents.push(this);
    }

    changeText(newText) {
        this.text = newText;
    }

}