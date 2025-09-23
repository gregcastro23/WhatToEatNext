#!/usr/bin/env python3
"""
Fast syntax error fixer for TypeScript files.
Focuses on the most common corruption patterns.
"""

import os
import re
import glob

def fix_file_syntax(filepath):
    """Fix common syntax errors in a TypeScript file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Fix 1: Missing commas in object properties
        # Pattern: "  property: value" (end of line) should be "  property: value,"
        # But avoid adding comma before closing braces
        lines = content.split('\n')
        fixed_lines = []

        for i, line in enumerate(lines):
            # Check if line ends with a property value (not a brace or already has comma)
            if (re.match(r'^(\s+)(\w+):\s*[^,{}\s].*[^,{}]$', line) and
                i + 1 < len(lines) and
                not re.match(r'^\s*[})]', lines[i + 1])):
                line += ','

            # Fix 2: Missing commas between object methods
            if (re.match(r'^(\s+)}$', line) and
                i + 1 < len(lines) and
                re.match(r'^(\s+)\w+:', lines[i + 1])):
                line = line.replace('}', '},')

            fixed_lines.append(line)

        content = '\n'.join(fixed_lines)

        # Fix 3: Broken import statements
        content = re.sub(r"} from '([^']+)',", r"} from '\1';", content)

        # Fix 4: Broken CSS class syntax (hover: should be hover:)
        content = re.sub(r'hover:\s+([a-zA-Z])', r'hover:\1', content)

        # Fix 5: Trailing commas in exports
        content = re.sub(r'export\s*{\s*([^}]*)\s*},\s*$', r'export { \1 };', content, flags=re.MULTILINE)

        # Fix 6: Object property spacing issues
        content = re.sub(r'(\w+):\s*{\s*,', r'\1: {', content)

        # Fix 7: Remove double commas
        content = re.sub(r'},\s*,', r'},', content)

        # Fix 8: Fix type annotation spacing
        content = re.sub(r'(\w+\??)\s*:\s+(\w+)\s*;', r'\1: \2;', content)

        # Fix 9: More aggressive object brace comma fixing
        content = re.sub(r'(["\'])\s*}\s*,', r'\1 }', content, flags=re.MULTILINE)
        content = re.sub(r'(["\'])\s*}\s*([a-zA-Z])', r'\1 },\n        \2', content)

        # Fix 10: Function parameter comma issues
        content = re.sub(r'(\w+):\s*([^,)]+)\s*([,)])', lambda m: f"{m.group(1)}: {m.group(2).strip()}{m.group(3)}", content)

        # Fix 11: Fix missing semicolons after statements
        content = re.sub(r'(\w+\s*=\s*[^;,}]+)\s*$', r'\1;', content, flags=re.MULTILINE)

        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Fix syntax errors in all TypeScript files."""
    ts_files = glob.glob('src/**/*.ts', recursive=True) + glob.glob('src/**/*.tsx', recursive=True)

    print(f"Processing {len(ts_files)} TypeScript files...")

    fixed_count = 0
    for filepath in ts_files:
        if fix_file_syntax(filepath):
            fixed_count += 1
            if fixed_count % 50 == 0:
                print(f"Fixed {fixed_count} files...")

    print(f"Fixed syntax in {fixed_count} files out of {len(ts_files)} total files.")

if __name__ == '__main__':
    main()