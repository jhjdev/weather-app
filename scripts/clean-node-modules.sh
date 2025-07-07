#!/bin/bash
# Clean up node_modules script
# This script removes unwanted files and attributes from node_modules

echo "🧹 Cleaning up node_modules..."

# Remove .DS_Store files
echo "Removing .DS_Store files..."
find node_modules -name ".DS_Store" -delete 2>/dev/null || true

# Remove .github directories
echo "Removing .github directories..."
find node_modules -name ".github" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove extended attributes from files and directories (safely)
echo "Removing extended attributes..."
find node_modules -type f -name "*.json" -o -name "*.md" -o -name "*.txt" | xargs xattr -c 2>/dev/null || true
find node_modules -type d -exec xattr -c {} \; 2>/dev/null || true

# Remove any git repositories
echo "Removing git repositories..."
find node_modules -name ".git" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove common unnecessary files
echo "Removing unnecessary files..."
find node_modules -name "*.log" -o -name "*.tmp" -o -name "*.temp" -delete 2>/dev/null || true

echo "✅ node_modules cleanup complete!"
