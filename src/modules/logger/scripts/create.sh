#!/bin/bash
set -e

LOG_DIR=$1
LOG_FILE=$2

if [ -z "$LOG_DIR" ] || [ -z "$LOG_FILE" ]; then
  echo "Usage: $0 <log_directory> <log_file>"
  exit 1
fi

# Create the log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Create the log file if it doesn't exist
if [ ! -f "$LOG_DIR/$LOG_FILE" ]; then
  touch "$LOG_DIR/$LOG_FILE"
fi

# Set permissions to allow writing to the log file
chmod 666 "$LOG_DIR/$LOG_FILE"
