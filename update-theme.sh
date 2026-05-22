#!/bin/bash

# Script to update all remaining files with CSS variable-based theming

# Define the files to update
FILES=(
  "src/pages/auth/Register.tsx"
  "src/pages/dashboard/UserProfile.tsx"
  "src/pages/dashboard/UserDashboard.tsx"
  "src/pages/dashboard/AdminDashboard.tsx"
  "src/pages/dashboard/ServicesManagement.tsx"
  "src/pages/dashboard/UsersManagement.tsx"
  "src/pages/dashboard/QuotesTable.tsx"
  "src/pages/dashboard/ContactsTable.tsx"
  "src/pages/dashboard/FaqManagement.tsx"
  "src/pages/dashboard/UserQuotes.tsx"
  "src/pages/dashboard/GalleryManagement.tsx"
  "src/pages/Quote.tsx"
)

cd /Users/macbook/Downloads/keypro-service-center

for file in "${FILES[@]}"; do
  echo "Processing $file..."

  # Create backup
  cp "$file" "$file.bak"

  # Replace text-white with style={{ color: 'var(--color-text-primary)' }}
  # But skip text-white inside className when it's on buttons with brand-red background
  # This is a complex replacement, so we'll use perl for better regex support

  perl -i -pe '
    # Replace standalone text-white that is NOT followed by / (to avoid text-white/60 etc)
    s/className="([^"]*)\btext-white\b(?!\/|\-)([^"]*)"/className="$1$2" style={{ color: '\''var(--color-text-primary)'\'' }}/g unless /bg-brand-red|bg-gradient|from-brand|to-brand|from-\[var\(--color-brand-orange|to-\[var\(--color-brand-orange/;

    # Replace text-white/60, text-white/70, text-white/80
    s/\btext-white\/(?:60|70|80)\b/style={{ color: '\''var(--color-text-secondary)'\'' }}/g;

    # Replace text-white/40, text-white/50
    s/\btext-white\/(?:40|50)\b/style={{ color: '\''var(--color-text-tertiary)'\'' }}/g;

    # Replace text-white/20, text-white/30
    s/\btext-white\/(?:20|30)\b/style={{ color: '\''var(--color-text-tertiary)'\'' }}/g;

    # Replace text-white/10
    s/\btext-white\/10\b/style={{ color: '\''var(--color-text-tertiary)'\'' }}/g;

    # Replace bg-white/5, bg-white/10
    s/\bbg-white\/(?:5|10)\b/style={{ backgroundColor: '\''var(--color-bg-secondary)'\'' }}/g;

    # Replace border-white/10, border-white/20
    s/\bborder-white\/(?:10|20)\b/style={{ border: '\''1px solid var(--color-border-primary)'\'' }}/g;

    # Replace border-white/5
    s/\bborder-white\/5\b/style={{ border: '\''1px solid var(--color-border-secondary)'\'' }}/g;

  ' "$file"

  echo "Completed $file"
done

echo "All files processed. Backups saved with .bak extension"
