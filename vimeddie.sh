#!/bin/zsh

# Launcher script for MacVim with VimEddie

# Ensure we're using the vimeddie-env Python environment
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
pyenv activate vimeddie-env

# Get the Python path from the activated environment
PYTHON_PATH=$(pyenv which python)
echo "Using Python at: $PYTHON_PATH"

# Ensure requests is installed
if ! $PYTHON_PATH -c "import requests" 2>/dev/null; then
    echo "Installing requests library..."
    $PYTHON_PATH -m pip install requests
fi

# Create config file if it doesn't exist
VIMEDDIE_CONFIG="$HOME/.vimeddie.json"
if [ ! -f "$VIMEDDIE_CONFIG" ]; then
    echo "Creating VimEddie config file..."
    cat > "$VIMEDDIE_CONFIG" << EOF
{
  "api_key": "$ANTHROPIC_API_KEY",
  "model": "claude-3-7-sonnet-20250219",
  "temperature": 0.7,
  "max_tokens": 500,
  "default_mode": "critique",
  "feedback_buffer_name": "VimEddie Feedback",
  "custom_prompts": {}
}
EOF
    echo "Please add your Anthropic API key to $VIMEDDIE_CONFIG"
fi

# Create .vimrc.vimeddie file with the correct Python path
VIMRC_VIMEDDIE="$HOME/.vimrc.vimeddie"
cat > "$VIMRC_VIMEDDIE" << EOF
" VimEddie specific configuration
let g:python3_host_prog = "$PYTHON_PATH"

" Source the main vimrc if it exists
if filereadable(expand("~/.vimrc"))
    source ~/.vimrc
endif

" Add VimEddie to the Python path
python3 << PYCODE
import sys
import os
import vim
plugin_path = vim.eval('expand("~/.vim/pack/plugins/start/vimeddie/pythonx")')
if os.path.exists(plugin_path) and plugin_path not in sys.path:
    sys.path.insert(0, plugin_path)
PYCODE
EOF

# Launch MacVim with the custom vimrc
echo "Launching MacVim with VimEddie configuration..."
mvim -u "$VIMRC_VIMEDDIE" "$@"