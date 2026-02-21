#!/bin/bash
# Batch fix parsing errors in service files

# Fix pattern: semicolon instead of comma in arrow functions
# Pattern: => msg.ruleId === 'error';)
find src/services -name "*.ts" -exec sed -i '' 's/);$/)/g' {} \;

# Fix pattern: comma after class properties
find src/services -name "*.ts" -exec sed -i '' 's/^\([[:space:]]*\)\(private\|public\|protected\|readonly\)\([[:space:]]\+\)\([^:]*\):\([^,;]*\),$/\1\2\3\4:\5;/g' {} \;

# Fix pattern: comma instead of semicolon at end of statements
find src/services -name "*.ts" -exec sed -i '' 's/^\([[:space:]]*\)\([a-zA-Z_][a-zA-Z0-9_]*\):\([^,]*\),$/\1\2:\3;/g' {} \;

# Fix pattern: Missing semicolon after closing brace for object/interface
find src/services -name "*.ts" -exec sed -i '' 's/^}$/};/g' {} \;

echo "Batch fixes applied to service files"
