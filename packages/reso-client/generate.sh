#!/bin/bash

FILE_OUT="./reso.openapi3.json"
OPEN_API_URL="https://raw.githubusercontent.com/RESOStandards/web-api-commander/main/src/main/resources/RESODataDictionary-1.7.openapi3.json"
OUT_PATH="generated"

cd "$(dirname "$0")"

# Delete the file if it exists
if [ -f $FILE_OUT ]; then
  rm $FILE_OUT
fi

# if [ -d $OUT_PATH ]; then
#   rm -rf $OUT_PATH
# fi


# Download the file and save it to the output path
curl -s $OPEN_API_URL > $FILE_OUT
 
# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "Docker is not running!\n"

    # Helpful message on how to start docker
    if [ "$(uname)" == "Darwin" ]; then
        echo -e "Try running: \033[0;32mopen /Applications/Docker.app\033[0m"
    elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
        echo -e "Try running: \033[0;32msudo systemctl start docker\033[0m"
    elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
        echo -e "Try running: \033[0;32mdocker-machine start\033[0m"
    elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
        echo -e "Try running: \033[0;32mdocker-machine start\033[0m"
    fi

    exit 1
fi

# Generate the client using openapi-generator-cli and docker
docker run --rm \
    -v ${PWD}:/local openapitools/openapi-generator-cli generate \
    -i /local/$FILE_OUT \
    -g typescript-axios \
    -o /local/$OUT_PATH \
    --additional-properties=typescriptThreePlus=true \
    --additional-properties=useSingleRequestParameter=true \