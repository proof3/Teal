# TEAL: TE(xt) A(dventure) L(oader)

A simple Rust program that allows one to play text adventures.

## Usage

* [Install rust](https://www.rust-lang.org/tools/install).
* Build and run with a TEAL adventure:

```
$cargo build && cargo run <PATH_TO_TEAL_FILE>
```

## TEAL Schemas

TEAL uses the following basic JSON schema to load text adventures:

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

### State Management

TEAL Schemas support the introduction of state for more complex adventures. State can be specified for an option using the optional `state_change` parameter as follows:

```
{ "option": String, "node_id": String, "state_change": Object }
```

where the object can be an arbitrary JSON object with key-value pairs. In order to make a node's prompt or options dependent on some state, we can use the `state_required` parameter like so:

```
{
    "name": String,
    "start_node": String,
    "nodes": {
        "<node_id>": {
            "prompt": String,
            "options": [
                { "option": String, "node_id": String, "state_change": Object, "state_required": Object }, ...
            ],
            "state_based_prompts": [
                { "prompt": String, "state_required": Object }
            ]
        },
        ...
    }
}
```

### State Semantics

State changes are additive, i.e, successive selections of options that change state will add to and not replace the overall state. To make this concrete, consider the following example:

```
"<node_id>": {
    ...
    "options": [
        { "option": String, "node_id": String, "state_change": { "foo": 1 } }
    ]
}
// Processing the above node's option leads to the global state being: {foo:1}
"<node_id>": {
    ...
    "options": [
        { "option": String, "node_id": String, "state_change": { "bar": 2 } }
    ]
}
// Processing the above node's option next leads to the global state being: {foo:1, bar:2}
"<node_id>": {
    ...
    "options": [
        { "option": String, "node_id": String, "state_change": { "foo": "Hello" } }
    ]
}
// Processing the above node's option next leads to the global state being: {foo:"Hello", bar:2}

```

### Examples

See the [TEALs directory](teals/README.md) for examples of text adventures constructed using this schema.
