class Node {
    text = '';
    children = [];
    parents = [];
    constructor(text, children) {
        this.text = text;
        this.children = children;
    }

    addChild(newNode, prompt) {
        this.children.push((newNode, prompt));
        newNode.parents.push(this, this.parents.length);
    }

    changeText(newText) {
        this.text = newText;
    }

}