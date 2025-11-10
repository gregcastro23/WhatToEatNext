#!/usr/bin/env python3
"""
Systematically fix all remaining ESLint errors
"""

import json
import subprocess
import re

def get_lint_errors():
    """Get all ESLint errors as structured data"""
    result = subprocess.run(
        ['yarn', 'lint', '--format', 'json'],
        capture_output=True,
        text=True,
        cwd='/Users/GregCastro/Desktop/WhatToEatNext'
    )

    try:
        data = json.loads(result.stdout)
        return data
    except:
        return []

def fix_await_thenable_errors(file_path, lines_to_fix):
    """Remove await from non-promise values"""
    with open(file_path, 'r') as f:
        lines = f.readlines()

    for line_num in sorted(lines_to_fix, reverse=True):
        idx = line_num - 1
        if idx < len(lines):
            lines[idx] = re.sub(r'\bawait\s+', '', lines[idx], count=1)

    with open(file_path, 'w') as f:
        f.writelines(lines)

def fix_floating_promises(file_path, lines_to_fix):
    """Add void operator to floating promises"""
    with open(file_path, 'r') as f:
        lines = f.readlines()

    for line_num in sorted(lines_to_fix, reverse=True):
        idx = line_num - 1
        if idx < len(lines):
            line = lines[idx]
            # Add void if not already present
            if 'void ' not in line:
                # Get indentation
                indent = re.match(r'^(\s*)', line).group(1)
                trimmed = line.lstrip()
                lines[idx] = indent + 'void ' + trimmed

    with open(file_path, 'w') as f:
        f.writelines(lines)

def fix_misused_promises(file_path, lines_to_fix):
    """Fix misused promises in setInterval/setTimeout"""
    with open(file_path, 'r') as f:
        content = f.read()

    # Fix setInterval(asyncFunc, ...) => setInterval(() => void asyncFunc(), ...)
    content = re.sub(
        r'setInterval\((\w+),',
        r'setInterval(() => void \1(),',
        content
    )
    content = re.sub(
        r'setTimeout\((\w+),',
        r'setTimeout(() => void \1(),',
        content
    )

    with open(file_path, 'w') as f:
        f.write(content)

def main():
    print("🔧 Fixing remaining ESLint errors...")

    data = get_lint_errors()

    files_fixed = 0
    errors_fixed = 0

    for file_info in data:
        file_path = file_info['filePath']
        messages = file_info['messages']

        await_lines = []
        floating_lines = []
        misused_lines = []

        for msg in messages:
            if msg.get('severity') != 2:  # Only errors
                continue

            rule_id = msg.get('ruleId', '')
            line = msg.get('line')

            if 'await-thenable' in rule_id:
                await_lines.append(line)
                errors_fixed += 1
            elif 'no-floating-promises' in rule_id:
                floating_lines.append(line)
                errors_fixed += 1
            elif 'no-misused-promises' in rule_id:
                misused_lines.append(line)
                errors_fixed += 1

        if await_lines or floating_lines or misused_lines:
            print(f"\n📝 {file_path.split('/')[-1]}")

            if await_lines:
                fix_await_thenable_errors(file_path, await_lines)
                print(f"  ✓ Fixed {len(await_lines)} await-thenable errors")

            if floating_lines:
                fix_floating_promises(file_path, floating_lines)
                print(f"  ✓ Fixed {len(floating_lines)} floating promise errors")

            if misused_lines:
                fix_misused_promises(file_path, misused_lines)
                print(f"  ✓ Fixed {len(misused_lines)} misused promise errors")

            files_fixed += 1

    print(f"\n✅ Fixed {errors_fixed} errors in {files_fixed} files")

    # Run final lint
    print("\n🔍 Running final lint check...\n")
    subprocess.run(
        ['yarn', 'lint', '2>&1', '|', 'tail', '-5'],
        shell=True,
        cwd='/Users/GregCastro/Desktop/WhatToEatNext'
    )

if __name__ == '__main__':
    main()
