# TEAL: TE(xt) A(dventure) L(oader)

A simple Rust program that allows one to play text adventures.

## TEAL Schemas

TEAL uses the following JSON schema to load text adventures:

```
{
    "name": String,
    "start_node": String,
    "nodes": [
        {
            "id": String,
            "prompt": String,
            "options": [
                { "option": String, "node_id": String }, ...
            ]
        },
        ...
    ]
}
```

Each adventure is graph of connecting nodes that are each identified by a `node_id`. A node with empty `"options"` is considered to be leaf node that ends an adventure. 