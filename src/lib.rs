use wasm_bindgen::prelude::*;

use std::collections::HashMap;
use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

// TEAL Schema.
#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub struct TealOption {
    pub option  : String,
    pub node_id : String,
    pub state_change : Option<Value>,
    pub state_required : Option<Value>,
}

#[derive(Serialize, Deserialize)]
pub struct TealNode {
    pub prompt  : String,
    pub options : Vec<TealOption>
}

#[derive(Serialize, Deserialize)]
pub struct TealSchema {
    pub name       : String,
    pub start_node : String,
    pub nodes      : HashMap<String, TealNode>
}

#[derive(Serialize, Deserialize)]
pub struct TealResult {
    pub result  : String,
    pub state   : HashMap<String, Value>,
    pub options : BTreeMap<u32, TealOption>
}

pub fn build_option_map<'a>(node: &'a TealNode,
                            game_state: &HashMap<String, Value>) -> BTreeMap<u32, &'a TealOption> {
    let mut option_counter = 1;
    let mut option_map : BTreeMap<u32, &TealOption> = BTreeMap::new();

    for option in node.options.iter() {
        let state_required = &option.state_required;
        match state_required {
            Some(state) => {
                let mut state_matches = true;
                for (key, value) in state.as_object().unwrap() {
                    match game_state.get(key) {
                        Some(game_state_value) => {
                            if value != game_state_value {
                                state_matches = false;
                            }
                        },
                        None => {
                            state_matches = false;
                        }
                    }
                }

                if state_matches {
                    option_map.insert(option_counter, option);
                    option_counter += 1;
                }
            },
            None => {
                option_map.insert(option_counter, option);
                option_counter += 1;
            },
        }
    }

    return option_map;
}

pub fn process_node(nodes: &HashMap<String, TealNode>,
                    game_state: &mut HashMap<String, Value>,
                    selection: u32,
                    option_map: &BTreeMap<u32, &TealOption>) -> Option<String> {

    if !option_map.contains_key(&selection) {
        return None;
    }

    match option_map.get(&selection) {
        Some(option) => {
            // Apply state change.
            let state_change = &option.state_change;
            match state_change {
                Some(state) => {
                    for (key, value) in state.as_object().unwrap() {
                        game_state.insert(key.to_string(), value.clone());
                    }
                }
                None        => (),
            }
            // Map to next node.
            if nodes.contains_key(&option.node_id) {
                return Some(String::from(&option.node_id));
            }
            else {
                return None;
            }
        },
        None => None
    }
}

#[wasm_bindgen]
pub fn process_node_js(nodes: JsValue, game_state: JsValue, node_id: JsValue, selection: JsValue) -> Result<JsValue, JsValue> {
    let r_nodes: HashMap<String, TealNode> = serde_wasm_bindgen::from_value(nodes).unwrap();
    let mut r_game_state: HashMap<String, Value> = serde_wasm_bindgen::from_value(game_state).unwrap();
    let node_id: String = serde_wasm_bindgen::from_value(node_id).unwrap();
    let r_selection: u32 = serde_wasm_bindgen::from_value(selection).unwrap();
    
    let node = match r_nodes.get(&node_id) {
        Some(node) => node,
        None       => panic!("Error processing TEAL graph!")
    };

    let option_map = build_option_map(&node, &r_game_state);

    let processed_result = match process_node(&r_nodes, &mut r_game_state, r_selection, &option_map) {
        Some(id) => id,
        None => panic!("Error processing TEAL graph!")
    };

    let new_node = match r_nodes.get(&processed_result) {
        Some(node) => node,
        None       => panic!("Error processing TEAL graph!")
    };
    let new_option_map = build_option_map(&new_node, &r_game_state);
    let mut js_option_map : BTreeMap<u32, TealOption> = BTreeMap::new();

    for (k, v) in &new_option_map {
        js_option_map.insert(
            *k,
            TealOption {
                option: v.option.clone(), 
                node_id: v.node_id.clone(),
                state_change: v.state_change.clone(),
                state_required: v.state_required.clone()
            });
    }

    let result = TealResult {
        result : processed_result,
        state  : r_game_state,
        options: js_option_map
    };

    Ok(serde_wasm_bindgen::to_value(&result)?)
}
