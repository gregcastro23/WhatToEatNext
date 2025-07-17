# WhatToEatNext - Development Setup Guide

## Node.js Version Management

This project requires **Node.js 20.18.0** or higher. To avoid version conflicts, we recommend using one of these approaches:

### Option 1: Use the Safe Development Script (Recommended)

Instead of running `yarn dev` directly, use our safe wrapper script:

```bash
# This automatically switches to the correct Node.js version
yarn dev:safe
```

Or run the script directly:

```bash
./scripts/dev.sh
```

### Option 2: Install and Configure nvm (Node Version Manager)

1. **Install nvm** (if not already installed):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. **Restart your terminal** or source your profile:
   ```bash
   source ~/.bashrc  # or ~/.zshrc if using zsh
   ```

3. **Install and use the correct Node.js version**:
   ```bash
   nvm install 20.18.0
   nvm use 20.18.0
   ```

4. **Set as default** (optional):
   ```bash
   nvm alias default 20.18.0
   ```

### Option 3: Automatic Directory-based Version Switching

#### Using direnv (Recommended for automatic switching)

1. **Install direnv**:
   ```bash
   # macOS with Homebrew
   brew install direnv
   
   # Ubuntu/Debian
   sudo apt install direnv
   ```

2. **Add direnv to your shell**:
   ```bash
   # For bash
   echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
   
   # For zsh
   echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
   ```

3. **Allow the .envrc file** (already created in the project):
   ```bash
   direnv allow
   ```

Now whenever you `cd` into the project directory, it will automatically switch to the correct Node.js version!

#### Using nvm with shell hooks

Add this to your `~/.bashrc` or `~/.zshrc`:

```bash
# Automatically use .nvmrc version when entering a directory
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

## Quick Start

1. **Clone the repository**
2. **Use the safe development script**:
   ```bash
   yarn dev:safe
   ```

That's it! The script will handle everything automatically.

## Troubleshooting

### "nvm: command not found"

If you get this error, nvm is not installed or not properly configured. Follow Option 2 above.

### "Node.js version incompatible"

If you see this error when running `yarn dev`, use `yarn dev:safe` instead, which will automatically fix the version issue.

### Manual Version Check

You can always check your current Node.js version:

```bash
node --version
```

And verify it meets the requirement (20.18.0 or higher).

## Files That Help Prevent Version Issues

- `.nvmrc` - Specifies the required Node.js version
- `.envrc` - Used by direnv for automatic version switching
- `scripts/dev.sh` - Safe development script that handles version switching
- `scripts/use-correct-node.sh` - Manual version switching script
- `scripts/check-node-version.cjs` - Version validation script (runs automatically)

## Development Commands

- `yarn dev:safe` - Start development server with automatic Node.js version handling
- `yarn dev` - Start development server (requires correct Node.js version)
- `yarn build` - Build for production
- `yarn lint` - Run linting
- `yarn test` - Run tests 