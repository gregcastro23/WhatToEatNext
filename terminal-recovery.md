# Kiro Terminal Recovery Guide

## Immediate Steps (Terminal Completely Blank)

### Step 1: Force Kill All Node Processes
```bash
# In a new terminal window/tab:
sudo pkill -9 node
sudo pkill -9 tsc
sudo pkill -9 yarn
```

### Step 2: Clear All Locks and Caches
```bash
# Remove all campaign locks
rm -f .explicit-any-campaign-progress.json
rm -f .typescript-campaign-progress.json
rm -f .campaign-lock

# Clear build caches
rm -rf node_modules/.cache
rm -rf .next/cache
rm -f tsconfig.tsbuildinfo
rm -f tsconfig.jest.tsbuildinfo

# Clear Jest cache
rm -rf .jest-cache
```

### Step 3: Reset Terminal State
```bash
# Reset terminal
reset

# Or try:
tput reset

# Or force clear:
clear && printf '\e[3J'
```

### Step 4: Restart Kiro
1. Close Kiro completely
2. Wait 10 seconds
3. Reopen Kiro
4. Open a new terminal

## If Terminal Still Blank

### Check System Resources
```bash
# Check memory usage
free -h

# Check CPU usage
top -n 1

# Check disk space
df -h
```

### Check for Zombie Processes
```bash
# Find zombie processes
ps aux | grep -E "(tsc|lint|campaign|batch)" | grep -v grep

# Kill by process name
sudo pkill -9 -f "tsc"
sudo pkill -9 -f "lint"
sudo pkill -9 -f "campaign"
```

### Nuclear Option - Complete Reset
```bash
# Kill ALL Node.js processes system-wide
sudo pkill -9 node

# Clear ALL caches
npm cache clean --force
yarn cache clean

# Restart system services (if needed)
sudo systemctl restart nodejs || echo "No nodejs service"
```

## Prevention Measures

The fixes I implemented include:
1. **Timeout Protection**: All execSync calls now have 30-second timeouts
2. **Loop Limits**: While loops now have maximum iteration counts
3. **Process Monitoring**: TerminalFreezePreventionSystem monitors long-running processes
4. **Emergency Stop**: SIGINT/SIGTERM handlers for clean shutdown

## Manual Recovery Commands

If you can access any terminal:

```bash
# Make the emergency fix executable
chmod +x emergency-terminal-fix.sh

# Run the fix
./emergency-terminal-fix.sh

# Or run the diagnostic
node src/services/campaign/terminal-freeze-diagnostic.js --emergency
```

## Root Cause Analysis

The terminal freeze was caused by:
1. **Infinite while(true) loops** in campaign systems
2. **No timeouts** on execSync calls to TypeScript/lint
3. **No process monitoring** for stuck operations
4. **No emergency stop mechanisms**

All of these have been fixed in the updated code.