use std::env;
use std::fs;
use std::io::{self, Write};
use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Result;

// TEAL Schema.
#[derive(Serialize, Deserialize)]
struct TealOption {
    option  : String,
    node_id : String
}

#[derive(Serialize, Deserialize)]
struct TealNode {
    prompt  : String,
    options : Vec<TealOption>
}

#[derive(Serialize, Deserialize)]
struct TealSchema {
    name       : String,
    start_node : String,
    nodes      : HashMap<String, TealNode>
}

// We define a custom result type so that we can deal with errors.
type TealResult<T> = std::result::Result<T, &'static str>;

fn teal_prompt<'a>() -> TealResult<u32> {
    let mut selection = String::new();
    io::stdin()
        .read_line(&mut selection)
        .expect("Failed to read line.");

    match selection.trim().parse::<u32>() {
        Ok(number) => return Ok(number),
        Err(_e)     => {
            return Err("Enter a valid option number!")
        }
    }
}

fn flush_output() {
    match io::stdout().flush() {
        Ok(_r)  => return,
        Err(_e) => panic!("Could not flush to stdout!") 
    }
}

fn process_node<'a>(nodes: &'a HashMap<String, TealNode>, node: &'a TealNode) {
    println!("\n{}\n", &node.prompt);

    let mut option_counter = 1;
    let mut option_map     = HashMap::new();
    for option in node.options.iter() {
        println!("{}: {}", option_counter, &option.option);
        option_map.insert(option_counter, option.node_id.to_string());
        option_counter += 1;
    }

    if option_map.is_empty() {
        println!("And thus ends this adventure!");
        return;
    }

    println!("\nHow do you want to proceed? (Pick a number)");
    print!("Option>");
    flush_output();

    let mut selected        = false;
    let mut selected_option = 0;
    while !selected {
        let selection = teal_prompt();
        match selection {
            Ok(number) => {
                if option_map.contains_key(&number) {
                    selected        = true;
                    selected_option = number;
                }
                else {
                    println!("{} is not in the list of options!", number);
                    print!("Option>");
                    flush_output();
                }
                continue;
            },
            Err(e) => {
                println!("{}", e);
                print!("Option> ");
                flush_output();
            }
        }
    }

    match option_map.get(&selected_option) {
        Some(node_id) => {
            let next_node = nodes.get(node_id);
            match next_node {
                Some(new_node) => process_node(nodes, new_node),
                None           => panic!("You selected an invalid option!")
            }
        },
        None => panic!("You selected an invalid option!")
    }
}

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 2 {
        println!("Invalid arguments! Please run as follows:\n\n ./teal <PATH_TO_TEAL_FILE>");
        return Ok(());
    }

    let file_name         = &args[1];
    let contents          = fs::read_to_string(file_name)
                                .expect("Something went wrong reading the file");

    let teal: TealSchema = serde_json::from_str(&contents)?;
    println!("Text Adventure Loaded: {}\n.\n.\n.\n", teal.name);

    let story_nodes = teal.nodes;
    let start_node  = story_nodes.get(&teal.start_node);
    let result      = match start_node {
        Some(node) => node,
        None       => panic!("Error parsing TEAL file.")
    };

    process_node(&story_nodes, result);
    Ok(())
}
