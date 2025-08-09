# 🤖 Kiro Integration Issues

This guide addresses common issues with Kiro integration, including steering
files, agent hooks, MCP servers, and workspace optimization features.

## 🎯 Quick Diagnostics

### Kiro Health Check Commands

```bash
# Comprehensive Kiro system check
npm run kiro:health-check

# Check specific Kiro components
npm run kiro:check-steering
npm run kiro:check-hooks
npm run kiro:check-mcp
npm run kiro:check-settings
```

### Kiro Status Indicators

```typescript
interface KiroSystemHealth {
  steeringFiles: 'loaded' | 'partial' | 'failed';
  agentHooks: 'active' | 'inactive' | 'error';
  mcpServers: 'connected' | 'degraded' | 'disconnected';
  workspaceSettings: 'optimized' | 'default' | 'error';
  overallStatus: 'healthy' | 'degraded' | 'critical';
}
```

## 📄 Steering Files Issues

### Common Steering File Problems

#### Issue: Steering Files Not Loading

**Symptoms:**

```
Kiro doesn't understand project context
Generic responses instead of domain-specific help
No astrological knowledge in suggestions
```

**Debugging Steps:**

```bash
# 1. Check if steering files exist
ls -la .kiro/steering/
# Should show: product.md, structure.md, tech.md, astrology-rules.md, etc.

# 2. Validate file syntax
npm run validate:steering-syntax

# 3. Check file permissions
chmod 644 .kiro/steering/*.md

# 4. Verify file encoding
file .kiro/steering/*.md
# Should show: UTF-8 Unicode text
```

**Solutions:**

```bash
# Recreate missing steering files
npm run kiro:setup-steering

# Fix file permissions
find .kiro/steering -name "*.md" -exec chmod 644 {} \;

# Validate and fix syntax
npm run kiro:fix-steering-syntax

# Restart Kiro to reload files
# Close and reopen Kiro application
```

#### Issue: Steering File Syntax Errors

**Symptoms:**

```
Kiro shows parsing errors
Steering files partially loaded
Inconsistent context understanding
```

**Common Syntax Issues:**

```markdown
<!-- WRONG: Invalid front-matter -->
---
inclusion: fileMatch
fileMatchPattern: 'src/calculations/**
---

<!-- CORRECT: Proper front-matter -->
---
inclusion: fileMatch
fileMatchPattern: 'src/calculations/**'
---

<!-- WRONG: Invalid file reference -->
#[file:src/utils/reliableAstronomy.ts]

<!-- CORRECT: Proper file reference -->
#[[file:src/utils/reliableAstronomy.ts]]
```

**Validation Script:**

```typescript
// Validate steering file syntax
function validateSteeringFiles() {
  const steeringDir = '.kiro/steering';
  const files = fs.readdirSync(steeringDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(steeringDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check front-matter syntax
    if (content.startsWith('---')) {
      const frontMatterEnd = content.indexOf('---', 3);
      if (frontMatterEnd === -1) {
        console.error(`❌ Invalid front-matter in ${file}: missing closing ---`);
      } else {
        const frontMatter = content.substring(3, frontMatterEnd);
        try {
          yaml.parse(frontMatter);
          console.log(`✅ Valid front-matter in ${file}`);
        } catch (error) {
          console.error(`❌ Invalid YAML in ${file}:`, error.message);
        }
      }
    }

    // Check file references
    const fileRefs = content.match(/#\[\[file:[^\]]+\]\]/g) || [];
    for (const ref of fileRefs) {
      const filePath = ref.match(/#\[\[file:([^\]]+)\]\]/)?.[1];
      if (filePath && !fs.existsSync(filePath)) {
        console.warn(`⚠️ Referenced file not found in ${file}: ${filePath}`);
      }
    }
  }
}
```

#### Issue: Steering File Context Not Applied

**Symptoms:**

```
Kiro loads files but doesn't apply context
Suggestions don't reflect project knowledge
Astrological principles not enforced
```

**Debugging Process:**

```bash
# 1. Check inclusion patterns
grep -r "inclusion:" .kiro/steering/

# 2. Test manual inclusion
# In Kiro chat, try: #astrology-rules

# 3. Verify file content relevance
head -20 .kiro/steering/astrology-rules.md

# 4. Check for conflicting steering files
find .kiro/steering -name "*.md" -exec grep -l "conflicting" {} \;
```

**Solutions:**

```markdown
<!-- Ensure proper inclusion patterns -->
---
inclusion: always
---

<!-- For conditional inclusion -->
---
inclusion: fileMatch
fileMatchPattern: 'src/calculations/**'
---

<!-- For manual inclusion -->
---
inclusion: manual
contextKey: 'astrology'
---
```

## 🔗 Agent Hooks Issues

### Common Agent Hook Problems

#### Issue: Agent Hooks Not Triggering

**Symptoms:**

```
File changes don't trigger hooks
Planetary data validation not running
Ingredient consistency checks not executing
Campaign triggers not activating
```

**Debugging Steps:**

```bash
# 1. Check hook configurations
ls -la .kiro/hooks/
cat .kiro/hooks/planetary-data-validator.md

# 2. Test file change detection
# Make a change to src/data/planets/mars.ts
# Save file and check Kiro's Agent Hooks panel

# 3. Check hook syntax
npm run validate:hook-syntax

# 4. Verify file patterns
grep -r "file_change:" .kiro/hooks/
```

**Hook Configuration Validation:**

```yaml
# Correct hook configuration format
name: "Planetary Data Validator"
trigger:
  - file_change: "src/data/planets/*.ts"
  - file_change: "src/calculations/culinary/*.ts"
scope: "planetary-calculations"
actions:
  - validate_transit_dates
  - check_position_consistency
  - run_astronomical_tests
  - update_fallback_positions
approval: auto
rollback: git_stash
```

**Common Hook Configuration Errors:**

```yaml
# WRONG: Invalid trigger syntax
trigger: "src/data/planets/*.ts"

# CORRECT: Proper trigger format
trigger:
  - file_change: "src/data/planets/*.ts"

# WRONG: Missing required fields
name: "Test Hook"
actions:
  - test_action

# CORRECT: All required fields
name: "Test Hook"
trigger:
  - file_change: "src/**/*.ts"
scope: "testing"
actions:
  - test_action
approval: manual
rollback: git_stash
```

#### Issue: Hook Actions Failing

**Symptoms:**

```
Hooks trigger but actions fail
Error messages in Kiro's Agent Hooks panel
Validation scripts not executing properly
```

**Debugging Process:**

```bash
# 1. Check action script existence
ls -la src/scripts/validate-planetary-data.js

# 2. Test action scripts manually
node src/scripts/validate-planetary-data.js

# 3. Check script permissions
chmod +x src/scripts/*.js

# 4. Verify script dependencies
npm list --depth=0
```

**Action Script Template:**

```javascript
// src/scripts/validate-planetary-data.js
const fs = require('fs');
const path = require('path');

async function validatePlanetaryData() {
  try {
    console.log('🌟 Validating planetary data...');

    // Check all planet files
    const planetsDir = 'src/data/planets';
    const planetFiles = fs.readdirSync(planetsDir).filter(f => f.endsWith('.ts'));

    for (const file of planetFiles) {
      const filePath = path.join(planetsDir, file);
      const planet = path.basename(file, '.ts');

      console.log(`Validating ${planet}...`);

      // Validate file can be required
      try {
        const planetData = require(path.resolve(filePath));

        if (!planetData.TransitDates) {
          throw new Error(`Missing TransitDates in ${planet}`);
        }

        // Validate date formats
        for (const [sign, dates] of Object.entries(planetData.TransitDates)) {
          if (!dates.Start || !dates.End) {
            throw new Error(`Invalid dates for ${planet} in ${sign}`);
          }

          const startDate = new Date(dates.Start);
          const endDate = new Date(dates.End);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error(`Invalid date format for ${planet} in ${sign}`);
          }
        }

        console.log(`✅ ${planet} validation passed`);

      } catch (error) {
        console.error(`❌ ${planet} validation failed:`, error.message);
        process.exit(1);
      }
    }

    console.log('🎉 All planetary data validated successfully');

  } catch (error) {
    console.error('❌ Planetary data validation failed:', error);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validatePlanetaryData();
}

module.exports = { validatePlanetaryData };
```

## 🔌 MCP Server Issues

### Common MCP Server Problems

#### Issue: MCP Servers Not Connecting

**Symptoms:**

```
MCP servers show as "Disconnected" in Kiro
API calls through MCP failing
Fallback to local data always triggered
```

**Debugging Steps:**

```bash
# 1. Check MCP configuration
cat .kiro/settings/mcp.json

# 2. Verify uv/uvx installation
uv --version
uvx --version

# 3. Test MCP server manually
uvx mcp-servers/astrology-server.py

# 4. Check Python environment
python3 --version
pip3 list | grep mcp
```

**MCP Configuration Validation:**

```json
{
  "mcpServers": {
    "astrology-server": {
      "command": "uvx",
      "args": ["mcp-servers/astrology-server.py"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR",
        "API_TIMEOUT": "5000"
      },
      "disabled": false,
      "autoApprove": ["get_planetary_positions", "get_lunar_phase"]
    }
  }
}
```

**Common MCP Configuration Errors:**

```json
// WRONG: Missing required fields
{
  "mcpServers": {
    "astrology-server": {
      "command": "uvx"
    }
  }
}

// CORRECT: All required fields
{
  "mcpServers": {
    "astrology-server": {
      "command": "uvx",
      "args": ["mcp-servers/astrology-server.py"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### Issue: MCP Server Installation Problems

**Symptoms:**

```
"uvx: command not found"
"No module named 'mcp'"
Python dependency errors
```

**Installation Solutions:**

```bash
# 1. Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Verify installation
uv --version
uvx --version

# 3. Test MCP server installation
uvx --help

# 4. Install MCP dependencies manually if needed
pip3 install mcp fastmcp

# 5. Test server directly
python3 mcp-servers/astrology-server.py
```

**MCP Server Test Script:**

```python
#!/usr/bin/env python3
# test-mcp-server.py

import sys
import subprocess
import json

def test_mcp_server():
    """Test MCP server functionality"""

    print("🧪 Testing MCP Server...")

    # Test 1: Check uvx availability
    try:
        result = subprocess.run(['uvx', '--version'],
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ uvx is available")
        else:
            print("❌ uvx not working properly")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("❌ uvx not found - install uv first")
        return False

    # Test 2: Check MCP server file
    import os
    if not os.path.exists('mcp-servers/astrology-server.py'):
        print("❌ MCP server file not found")
        return False
    else:
        print("✅ MCP server file exists")

    # Test 3: Test server execution
    try:
        result = subprocess.run(['python3', 'mcp-servers/astrology-server.py', '--test'],
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print("✅ MCP server executes successfully")
        else:
            print(f"❌ MCP server execution failed: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("❌ MCP server test timed out")
        return False

    print("🎉 MCP server test completed successfully")
    return True

if __name__ == "__main__":
    success = test_mcp_server()
    sys.exit(0 if success else 1)
```

#### Issue: MCP Server API Failures

**Symptoms:**

```
MCP server connects but API calls fail
Timeout errors from external APIs
Rate limiting issues
Authentication failures
```

**API Debugging Process:**

```bash
# 1. Test API connectivity directly
curl -X GET "https://api.astronomyapi.com/api/v2/studio/moon-phase" \
  -H "Authorization: Basic $(echo -n 'app-id:app-secret' | base64)"

# 2. Check API credentials
echo $ASTRONOMY_API_KEY
echo $SPOONACULAR_API_KEY

# 3. Test with different timeout values
# Edit mcp.json to increase timeout values

# 4. Check API rate limits
npm run check:api-limits
```

**MCP Server Error Handling:**

```python
# mcp-servers/astrology-server.py
import asyncio
import aiohttp
from typing import Optional

class AstrologyMCPServer:
    def __init__(self):
        self.timeout = aiohttp.ClientTimeout(total=5.0)
        self.session: Optional[aiohttp.ClientSession] = None

    async def get_planetary_positions(self, date: str = None):
        """Get planetary positions with proper error handling"""

        try:
            if not self.session:
                self.session = aiohttp.ClientSession(timeout=self.timeout)

            # Try primary API
            try:
                async with self.session.get(
                    f"https://api.astronomyapi.com/api/v2/positions",
                    params={"date": date or "today"},
                    headers={"Authorization": f"Bearer {self.api_key}"}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {"source": "api", "data": data}
                    else:
                        print(f"API returned status {response.status}")

            except asyncio.TimeoutError:
                print("API request timed out")
            except aiohttp.ClientError as e:
                print(f"API request failed: {e}")

            # Fallback to local data
            return self.get_fallback_positions()

        except Exception as e:
            print(f"Unexpected error: {e}")
            return self.get_fallback_positions()

    def get_fallback_positions(self):
        """Return reliable fallback positions"""
        return {
            "source": "fallback",
            "data": {
                "sun": {"sign": "aries", "degree": 8.5},
                "moon": {"sign": "aries", "degree": 1.57},
                # ... other planets
            }
        }
```

## ⚙️ Workspace Settings Issues

### Common Workspace Settings Problems

#### Issue: TypeScript IntelliSense Not Working

**Symptoms:**

```
No auto-completion for astrological types
Import suggestions not working
Type errors not showing in editor
```

**Solutions:**

```json
// .kiro/settings/workspace.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,

  // Ensure TypeScript server is using project config
  "typescript.preferences.useAliasesForRenames": true,
  "typescript.updateImportsOnFileMove.enabled": "always",

  // Path mapping for astrological modules
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

#### Issue: File Associations Not Working

**Symptoms:**

```
.astro files not recognized as TypeScript
.alchm files not getting syntax highlighting
Custom file types not supported
```

**File Association Configuration:**

```json
// .kiro/settings/workspace.json
{
  "files.associations": {
    "*.astro": "typescript",
    "*.alchm": "typescript",
    "*.planetary": "json",
    "*.elemental": "yaml"
  },

  "emmet.includeLanguages": {
    "astro": "html",
    "alchm": "typescript"
  }
}
```

#### Issue: Search and Navigation Problems

**Symptoms:**

```
Search includes too many irrelevant files
Navigation slow in large directories
File explorer not optimized for project structure
```

**Search Optimization:**

```json
// .kiro/settings/workspace.json
{
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/*.log": true,
    "**/metrics": true,
    "**/.tsbuildinfo": true,
    "**/coverage": true
  },

  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.next": true
  },

  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.next/**": true,
    "**/dist/**": true
  }
}
```

## 🔧 Advanced Kiro Troubleshooting

### Kiro Performance Issues

#### Issue: Kiro Slow or Unresponsive

**Symptoms:**

```
Kiro takes long time to respond
High CPU usage from Kiro process
Memory usage continuously growing
```

**Performance Optimization:**

```json
// .kiro/settings/workspace.json
{
  // Reduce file watching overhead
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.next/**": true,
    "**/dist/**": true,
    "**/*.log": true
  },

  // Optimize TypeScript performance
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.suggest.autoImports": false,

  // Reduce extension overhead
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false,

  // Optimize editor performance
  "editor.semanticHighlighting.enabled": false,
  "editor.bracketPairColorization.enabled": false
}
```

#### Issue: Kiro Context Confusion

**Symptoms:**

```
Kiro provides conflicting advice
Context switching between different domains
Inconsistent understanding of project
```

**Context Management:**

```bash
# 1. Clear Kiro context cache
rm -rf ~/.kiro/cache/

# 2. Restart Kiro with fresh context
# Close Kiro completely and reopen

# 3. Verify steering file priorities
grep -r "inclusion:" .kiro/steering/ | sort

# 4. Test context with specific queries
# In Kiro: "What are the elemental principles?"
# Should reference elemental-principles.md
```

### Kiro Integration Testing

#### Automated Kiro Testing

```bash
#!/bin/bash
# test-kiro-integration.sh

echo "🤖 Testing Kiro Integration..."

# Test 1: Steering files
echo "Testing steering files..."
if [ -d ".kiro/steering" ]; then
    echo "✅ Steering directory exists"

    for file in product.md structure.md tech.md astrology-rules.md elemental-principles.md campaign-integration.md; do
        if [ -f ".kiro/steering/$file" ]; then
            echo "✅ $file exists"
        else
            echo "❌ $file missing"
        fi
    done
else
    echo "❌ Steering directory missing"
fi

# Test 2: Agent hooks
echo "Testing agent hooks..."
if [ -d ".kiro/hooks" ]; then
    echo "✅ Hooks directory exists"

    hook_count=$(ls .kiro/hooks/*.md 2>/dev/null | wc -l)
    if [ $hook_count -gt 0 ]; then
        echo "✅ Found $hook_count hook files"
    else
        echo "❌ No hook files found"
    fi
else
    echo "❌ Hooks directory missing"
fi

# Test 3: MCP configuration
echo "Testing MCP configuration..."
if [ -f ".kiro/settings/mcp.json" ]; then
    echo "✅ MCP configuration exists"

    # Validate JSON syntax
    if python3 -m json.tool .kiro/settings/mcp.json > /dev/null 2>&1; then
        echo "✅ MCP configuration is valid JSON"
    else
        echo "❌ MCP configuration has invalid JSON"
    fi
else
    echo "❌ MCP configuration missing"
fi

# Test 4: Workspace settings
echo "Testing workspace settings..."
if [ -f ".kiro/settings/workspace.json" ]; then
    echo "✅ Workspace settings exist"
else
    echo "❌ Workspace settings missing"
fi

echo "🎉 Kiro integration test completed"
```

#### Manual Kiro Testing Checklist

```
□ Steering files load correctly
□ Kiro understands astrological concepts
□ Agent hooks trigger on file changes
□ MCP servers connect successfully
□ TypeScript IntelliSense works
□ File associations work correctly
□ Search excludes work properly
□ Performance is acceptable
□ Context switching works smoothly
□ Error messages are helpful
```

---

**Remember**: Kiro integration issues are often configuration-related. Start
with the basics: file existence, syntax validation, and permissions. Most issues
can be resolved by restarting Kiro after fixing configuration problems. 🤖
