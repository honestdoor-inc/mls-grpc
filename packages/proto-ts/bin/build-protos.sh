#!/usr/bin/env bash

OUT_DIR="./out"
TS_OUT_DIR="./out"
IN_DIR="./proto"
PROTOC="$(npm bin)/grpc_tools_node_protoc"
# PROTOC_GEN_TS_PATH="$(npm bin)/protoc-gen-ts"
PROTOC_GEN_TS_PATH="$(npm bin)/protoc-gen-ts_proto"
PROTOC_GEN_GRPC_PATH="$(npm bin)/grpc_tools_node_protoc_plugin"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Copy proto files from node_modules/database/generated/proto to ./proto
cp -r ./node_modules/database/generated/proto/* ./proto

$PROTOC \
    -I="./" \
    --plugin=protoc-gen-ts_proto=$PROTOC_GEN_TS_PATH \
    --ts_proto_out=$TS_OUT_DIR \
    --ts_proto_opt=outputServices=grpc-js \
    --ts_proto_opt=useOptionals=all \
    "$IN_DIR"/*.proto

# $PROTOC \
#     -I="./" \
#     --plugin=protoc-gen-ts_proto=$PROTOC_GEN_TS_PATH \
#     --plugin=protoc-gen-grpc=$PROTOC_GEN_GRPC_PATH \
#     --js_out=import_style=commonjs:$OUT_DIR \
#     --grpc_out=grpc_js:$OUT_DIR \
#     --ts_out=service=grpc-node,mode=grpc-js:$TS_OUT_DIR \
#     --ts_opt=esModuleInterop=true \
#     "$IN_DIR"/*.proto
