#!/bin/bash

# Daggerheart Converter & Creator - Claude Code Skills Installer
# This script installs the Daggerheart skills for Claude Code

set -e

echo "=========================================="
echo "Daggerheart Converter & Creator Installer"
echo "=========================================="
echo ""

# Check if Claude Code skills directory exists
CLAUDE_SKILLS_DIR="$HOME/.claude/skills"
if [ ! -d "$CLAUDE_SKILLS_DIR" ]; then
    echo "Creating Claude Code skills directory..."
    mkdir -p "$CLAUDE_SKILLS_DIR"
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing Daggerheart skills from: $SCRIPT_DIR"
echo ""

# Create skill directories
echo "[1/4] Creating skill directories..."
mkdir -p "$CLAUDE_SKILLS_DIR/dh-convert"
mkdir -p "$CLAUDE_SKILLS_DIR/dh-adversary"
mkdir -p "$CLAUDE_SKILLS_DIR/dh-environment"
mkdir -p "$CLAUDE_SKILLS_DIR/dh-npc"
mkdir -p "$CLAUDE_SKILLS_DIR/daggerheart-docs"

# Copy skill files
echo "[2/4] Copying skill files..."
cp "$SCRIPT_DIR/skills/dh-convert/SKILL.md" "$CLAUDE_SKILLS_DIR/dh-convert/"
cp "$SCRIPT_DIR/skills/dh-adversary/SKILL.md" "$CLAUDE_SKILLS_DIR/dh-adversary/"
cp "$SCRIPT_DIR/skills/dh-environment/SKILL.md" "$CLAUDE_SKILLS_DIR/dh-environment/"
cp "$SCRIPT_DIR/skills/dh-npc/SKILL.md" "$CLAUDE_SKILLS_DIR/dh-npc/"

# Copy reference documentation
echo "[3/4] Copying reference documentation..."
cp "$SCRIPT_DIR/docs/daggerheart-reference.md" "$CLAUDE_SKILLS_DIR/daggerheart-docs/"

# Verify installation
echo "[4/4] Verifying installation..."
MISSING=0

if [ ! -f "$CLAUDE_SKILLS_DIR/dh-convert/SKILL.md" ]; then
    echo "  ERROR: dh-convert skill not found"
    MISSING=1
fi

if [ ! -f "$CLAUDE_SKILLS_DIR/dh-adversary/SKILL.md" ]; then
    echo "  ERROR: dh-adversary skill not found"
    MISSING=1
fi

if [ ! -f "$CLAUDE_SKILLS_DIR/dh-environment/SKILL.md" ]; then
    echo "  ERROR: dh-environment skill not found"
    MISSING=1
fi

if [ ! -f "$CLAUDE_SKILLS_DIR/dh-npc/SKILL.md" ]; then
    echo "  ERROR: dh-npc skill not found"
    MISSING=1
fi

if [ ! -f "$CLAUDE_SKILLS_DIR/daggerheart-docs/daggerheart-reference.md" ]; then
    echo "  ERROR: Reference documentation not found"
    MISSING=1
fi

echo ""
if [ $MISSING -eq 0 ]; then
    echo "=========================================="
    echo "Installation complete!"
    echo "=========================================="
    echo ""
    echo "Installed skills:"
    echo "  /dh-convert     - Convert creatures from other systems"
    echo "  /dh-adversary   - Create custom adversaries"
    echo "  /dh-environment - Create battle environments"
    echo "  /dh-npc         - Create memorable NPCs"
    echo ""
    echo "To test, open Claude Code and type /dh-convert"
    echo ""
else
    echo "=========================================="
    echo "Installation completed with errors!"
    echo "=========================================="
    echo ""
    echo "Some files may not have been installed correctly."
    echo "Please check the error messages above."
    exit 1
fi
