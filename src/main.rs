use std::collections::HashMap;
use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::io::{self, Write};

use serde_json::Value;
use serde_json::Result;

use teal::build_option_map;
use teal::process_node;
use teal::TealOption;
use teal::TealSchema;


// We define a custom result type so that we can deal with errors.
type TealResult<T> = std::result::Result<T, &'static str>;

fn teal_prompt<'a>() -> TealResult<u32> {
    let mut selection = String::new();
    io::stdin()
        .read_line(&mut selection)
        .expect("Failed to read line.");

    match selection.trim().parse::<u32>() {
        Ok(number) => return Ok(number),
        Err(_e)    => {
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

fn prompt_to_select(option_map: &BTreeMap<u32, &TealOption>) -> u32 {
    loop {
        let selection = teal_prompt();
        match selection {
            Ok(number) => {
                if option_map.contains_key(&number) {
                    return number;
                }
                else {
                    println!("{} is not in the list of options!", number);
                    print!("Option>");
                    flush_output();
                    continue;
                }
            },
            Err(e) => {
                println!("{}", e);
                print!("Option> ");
                flush_output();
                continue;
            }
        }
    }
}

fn print_option_map(option_map: &BTreeMap<u32, &TealOption>) {
    for (key, option) in option_map.iter() {
        println!("{}: {}", key, &option.option);
    }
}

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 2 {
        panic!("Invalid arguments! Please run as follows:\n\n ./teal <PATH_TO_TEAL_FILE>");
    }

    let file_name         = &args[1];
    let contents          = fs::read_to_string(file_name)
                                .expect("Something went wrong reading the file");

    let teal: TealSchema = serde_json::from_str(&contents)?;
    println!("Text Adventure Loaded: {}\n.\n.\n.\n", teal.name);

    let story_nodes = teal.nodes;
    let start_node  = story_nodes.get(&teal.start_node);
    let mut cur_node  = match start_node {
        Some(node) => node,
        None       => panic!("Error parsing TEAL file!")
    };

    let mut game_state: HashMap<String, Value> = HashMap::new();

    loop {
        // 1. Build and print option map
        let option_map = build_option_map(&cur_node, &game_state);
        if option_map.is_empty() {
            println!("And thus ends this adventure!");
            break;
        }

        println!("\n{}\n", &cur_node.prompt);

        print_option_map(&option_map);

        // 2. Prompt user for selection
        let selection = prompt_to_select(&option_map);

        // 3. Process selection
        cur_node = match process_node(&story_nodes, &mut game_state, selection, &option_map) {
            Some(node) => node,
            None       => panic!("Error processing TEAL graph!")
        };
    }

    Ok(())
}
