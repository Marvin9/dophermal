#!/bin/bash

create_file_recursively() {
    local filepath="$1"
    local directory=$(dirname "$filepath")

    # Check if directory exists, if not create it recursively
    if [ ! -d "$directory" ]; then
        mkdir -p "$directory" || {
            echo "Error: Unable to create directory $directory"
            exit 1
        }
    fi

    # Check if file exists, if not create it
    if [ ! -e "$filepath" ]; then
        touch "$filepath" || {
            echo "Error: Unable to create file $filepath"
            exit 1
        }
        echo "File $filepath created successfully."
    else
        echo "File $filepath already exists."
    fi
}

create_file_recursively ./db/dophermal.db
