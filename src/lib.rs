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

            match nodes.get(&option.node_id) {
                Some(node) => {
                    return Some(String::from(&node.prompt));
                }
                None => None,
            }
        },
        None => None
    }
}

#[wasm_bindgen]
pub fn process_node_js(nodes: JsValue, game_state: JsValue, selection: JsValue) -> Option<String> {
    let r_nodes: HashMap<String, TealNode> = serde_wasm_bindgen::from_value(nodes).unwrap();
    let mut r_game_state: HashMap<String, Value> = serde_wasm_bindgen::from_value(game_state).unwrap();
    let r_selection: String = serde_wasm_bindgen::from_value(selection).unwrap();
    let u32_selection = match r_selection.trim().parse::<u32>() {
        Ok(number) => number,
        Err(_e)    => panic!("Error processing TEAL selection!")
    };
    
    let node = match r_nodes.get(&r_selection) {
        Some(node) => node,
        None       => panic!("Error processing TEAL graph!")
    };

    let option_map = build_option_map(&node, &r_game_state);

    return process_node(&r_nodes, &mut r_game_state, u32_selection, &option_map);
}
