# TEAL: TE(xt) A(dventure) L(oader)

A simple Rust program that allows one to play text adventures.

## Usage

* [Install rust](https://www.rust-lang.org/tools/install).
* Build and run with a TEAL adventure:

```
$cargo build && cargo run <PATH_TO_TEAL_FILE>
```

## TEAL Schemas

TEAL uses the following JSON schema to load text adventures:

```
{
    "name": String,
    "start_node": String,
    "nodes": {
        "<node_id>": {
            "prompt": String,
            "options": [
                { "option": String, "node_id": String }, ...
            ]
        },
        ...
    }
}
```

Each adventure is a directed graph of connecting nodes that are each identified by a `node_id`. A node with empty `"options"` is considered to be a leaf node that ends an adventure.

See the [TEALs directory](teals/README.md) for examples of text adventures constructed using this schema.
