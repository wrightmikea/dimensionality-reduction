#!/bin/bash
# Download Project Gutenberg texts for local use

# Create texts directory if it doesn't exist
mkdir -p texts

echo "Downloading Project Gutenberg texts..."

# Array of book IDs from RECOMMENDED_BOOKS in text-processor.js
declare -a books=(
  "863:The Mysterious Affair at Styles (Agatha Christie)"
  "1155:The Secret Adversary (Agatha Christie)"
  "2852:The Hound of the Baskervilles (Arthur Conan Doyle)"
  "11:Alice's Adventures in Wonderland (Lewis Carroll)"
  "1342:Pride and Prejudice (Jane Austen)"
  "345:Dracula (Bram Stoker)"
  "84:Frankenstein (Mary Shelley)"
  "43:Dr Jekyll and Mr Hyde (Robert Louis Stevenson)"
)

# Download each book
for book in "${books[@]}"
do
  IFS=':' read -r id title <<< "$book"

  if [ -f "texts/${id}.txt" ]; then
    echo "✓ ${id}.txt already exists (${title})"
  else
    echo "Downloading ${id}.txt (${title})..."

    # Try UTF-8 version first (-0.txt), then fall back to -8.txt, then -h.txt
    if curl -s -f "https://www.gutenberg.org/files/${id}/${id}-0.txt" -o "texts/${id}.txt"; then
      echo "✓ Downloaded ${id}-0.txt"
    elif curl -s -f "https://www.gutenberg.org/files/${id}/${id}-8.txt" -o "texts/${id}.txt"; then
      echo "✓ Downloaded ${id}-8.txt"
    elif curl -s -f "https://www.gutenberg.org/files/${id}/${id}.txt" -o "texts/${id}.txt"; then
      echo "✓ Downloaded ${id}.txt"
    else
      echo "✗ Failed to download ${id}.txt"
      rm -f "texts/${id}.txt"  # Remove empty file
    fi

    # Small delay to be respectful to Project Gutenberg servers
    sleep 1
  fi
done

echo ""
echo "Download complete! Files saved in ./texts/"
ls -lh texts/
