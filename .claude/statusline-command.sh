#!/bin/bash

# Read JSON input from stdin
input=$(cat)

# Extract data from JSON
cwd=$(echo "$input" | jq -r '.workspace.current_dir')
model_name=$(echo "$input" | jq -r '.model.display_name // "Unknown"')

# Extract context window data
total_input=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0')
total_output=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0')
context_size=$(echo "$input" | jq -r '.context_window.context_window_size // 200000')

# Calculate total tokens used
total_used=$((total_input + total_output))

# Build git info (simplified)
git_info=""
if git -C "$cwd" rev-parse --git-dir > /dev/null 2>&1; then
    git_dir=$(git -C "$cwd" rev-parse --git-dir 2>/dev/null)
    branch=$(git -C "$cwd" --git-dir="$git_dir" --work-tree="$cwd" branch --show-current 2>/dev/null)

    # If no branch name (detached HEAD), get short commit hash
    if [ -z "$branch" ]; then
        branch=$(git -C "$cwd" --git-dir="$git_dir" rev-parse --short HEAD 2>/dev/null)
    fi

    git_info=$(printf " on \033[1;34mgit\033[0m:\033[1;36m%s\033[0m" "$branch")
fi

# Build context usage progress bar
bar_width=30
if [ "$context_size" -gt 0 ]; then
    percentage=$((total_used * 100 / context_size))
    filled=$((total_used * bar_width / context_size))

    # Ensure filled doesn't exceed bar_width
    if [ "$filled" -gt "$bar_width" ]; then
        filled=$bar_width
    fi

    # Choose color based on usage
    if [ "$percentage" -ge 80 ]; then
        bar_color="\033[1;31m"  # red for high usage
    elif [ "$percentage" -ge 60 ]; then
        bar_color="\033[1;33m"  # yellow for medium usage
    else
        bar_color="\033[1;32m"  # green for low usage
    fi

    # Build the progress bar
    bar=""
    for ((i=0; i<bar_width; i++)); do
        if [ $i -lt "$filled" ]; then
            bar="${bar}█"
        else
            bar="${bar}░"
        fi
    done

    # Format token counts (show in K for readability)
    used_k=$((total_used / 1000))
    size_k=$((context_size / 1000))

    context_line=$(printf "\n\033[1;35m%s\033[0m | Context: %b%s\033[0m \033[1m%dk/%dk (%d%%)\033[0m" "$model_name" "$bar_color" "$bar" "$used_k" "$size_k" "$percentage")
else
    context_line=$(printf "\n\033[1;35m%s\033[0m" "$model_name")
fi

# Build the status line
# Format: # directory on git:branch
# Line 2: Model | Context: [progress bar] usage
printf "\033[1;34m#\033[0m \033[1;33m%s\033[0m%s%s" \
    "$cwd" \
    "$git_info" \
    "$context_line"