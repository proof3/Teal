import { process_node_js } from "./pkg/teal.js";


function tealLoop(story_nodes, game_state, node_id, node_selection, next) {
    console.log("Processing selection for node ", node_id, ", selection ", node_selection);
    // Process node selection
    const { result, state, options } = process_node_js(story_nodes, game_state, node_id, node_selection);

    console.log("Result is:", result);
    console.log("Game state is: ", [...state.entries()]);
    console.log("Next option map is: ", [...options.entries()]);

    // Build UI for processing result
    next(story_nodes, state, result, Array.from(options.values()));
}

function buildTealSelectionPrompt(story_nodes, game_state, node_selection, options) {
    console.log("Building selection for node: ", node_selection);
    // Set prompt
    const { prompt } = story_nodes.get(node_selection);
    document.getElementById("teal-prompt").innerHTML = prompt;
    console.log();

    // Create options
    document.getElementById("teal-options").innerHTML = "";
    if (options.length === 0) {
        const optionDiv = document.createElement("div");
        optionDiv.innerHTML = "Your adventure has ended. Return to the menu.";

        optionDiv.addEventListener("click", buildMenu);
        document.getElementById("teal-options").appendChild(optionDiv);
    }
    let optionCounter = 1;
    options.forEach(({option, node_id, state_required}) => {
        const optionDiv = document.createElement("div");
        optionDiv.innerHTML = option;

        optionDiv.addEventListener("click", tealLoop.bind(
            null, story_nodes, game_state, node_selection, optionCounter, buildTealSelectionPrompt));
        document.getElementById("teal-options").appendChild(optionDiv);
        optionCounter++;
    });
}

export function startTeal(tealData) {
    const {name, start_node, nodes} = tealData;
    const story_nodes = new Map();
    const game_state  = new Map();
    Object.keys(nodes).forEach((key) => story_nodes.set(key, nodes[key]));
    buildTealSelectionPrompt(
      story_nodes, game_state, start_node, story_nodes.get(start_node).options);
}