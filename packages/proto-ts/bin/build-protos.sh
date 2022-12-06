#!/usr/bin/env bash

OUT_DIR="./out"
TS_OUT_DIR="./out"
IN_DIR="./proto"
PROTOC="$(npm bin)/grpc_tools_node_protoc"
PROTOC_GEN_TS_PATH="$(npm bin)/protoc-gen-ts"
PROTOC_GEN_GRPC_PATH="$(npm bin)/grpc_tools_node_protoc_plugin"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

$PROTOC \
    -I="./" \
    --plugin=protoc-gen-ts=$PROTOC_GEN_TS_PATH \
    --plugin=protoc-gen-grpc=$PROTOC_GEN_GRPC_PATH \
    --js_out=import_style=commonjs:$OUT_DIR \
    --grpc_out=grpc_js:$OUT_DIR \
    --ts_out=service=grpc-node,mode=grpc-js:$TS_OUT_DIR \
    "$IN_DIR"/*.proto