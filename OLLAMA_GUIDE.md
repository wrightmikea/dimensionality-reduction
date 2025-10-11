# Ollama Embedding Visualization Guide

Visualize embeddings from **local Ollama models** using classic literature from Project Gutenberg.

## 🚀 Quick Start

1. **Ensure Ollama is running**:
```bash
ollama serve
```

2. **Open the app**:
```bash
npm run dev
# Navigate to http://localhost:4444/index_ollama.html
```

3. **Select a book** (e.g., "The Mysterious Affair at Styles" by Agatha Christie)
4. **Click "Load & Chunk Text"**
5. **Select model** (nomic-embed-text recommended)
6. **Click "Generate Embeddings & Visualize"**

## 📚 Available Ollama Models

Your system has three embedding models:

### 1. **granite-embedding:latest** (62 MB)
- **Size**: Smallest, fastest
- **Dimensions**: 384
- **Best for**: Quick experiments, testing
- **Speed**: ~0.1s per chunk
- **Use when**: You want fast results

### 2. **nomic-embed-text:latest** (274 MB) ⭐ **Recommended**
- **Size**: Medium
- **Dimensions**: 768
- **Best for**: General-purpose semantic understanding
- **Speed**: ~0.2s per chunk
- **Use when**: You want good quality without waiting
- **Notes**: Excellent for narrative text, good semantic clustering

### 3. **embeddinggemma:latest** (621 MB)
- **Size**: Largest, highest quality
- **Dimensions**: 768
- **Best for**: Maximum quality embeddings
- **Speed**: ~0.3s per chunk
- **Use when**: Quality matters more than speed
- **Notes**: Best for nuanced semantic distinctions

## 📖 Recommended Project Gutenberg Books

All books are public domain and freely available:

### Mystery & Detective Fiction

#### ⭐ **The Mysterious Affair at Styles** (Agatha Christie, 1920)
- **Gutenberg ID**: 863
- **Why it's great**:
  - First Hercule Poirot novel
  - Multiple suspects with distinct personalities
  - Clear chapter structure
  - Mix of dialogue, investigation, and revelation scenes
- **Expected clusters**:
  - Character introductions
  - Investigation scenes
  - Red herrings
  - Final reveal
- **Chunks**: ~40-60 (depending on settings)

#### **The Secret Adversary** (Agatha Christie, 1922)
- **Gutenberg ID**: 1155
- **Why it's great**:
  - Tommy and Tuppence first adventure
  - International intrigue plot
  - Fast-paced narrative
  - Multiple locations
- **Expected clusters**:
  - Adventure scenes
  - Mystery elements
  - Character interactions
  - Plot twists

#### **The Hound of the Baskervilles** (Arthur Conan Doyle, 1902)
- **Gutenberg ID**: 2852
- **Why it's great**:
  - Classic Sherlock Holmes
  - Gothic atmosphere
  - Moor setting descriptions
  - Deductive reasoning passages
- **Expected clusters**:
  - London scenes vs. Dartmoor scenes
  - Mystery setup vs. investigation
  - Character descriptions vs. action
  - Atmosphere vs. logic

### Fantasy & Adventure

#### **Alice's Adventures in Wonderland** (Lewis Carroll, 1865)
- **Gutenberg ID**: 11
- **Why it's great**:
  - Very distinct chapters (Mad Tea Party, Croquet Game, etc.)
  - Surreal conversations
  - Poem interludes
  - Character-specific scenes
- **Expected clusters**:
  - Each character encounter (Cheshire Cat, Mad Hatter, Queen)
  - Poetry vs. prose
  - Alice's thoughts vs. dialogue
  - Absurdist humor vs. logic puzzles

### Romance & Social Commentary

#### **Pride and Prejudice** (Jane Austen, 1813)
- **Gutenberg ID**: 1342
- **Why it's great**:
  - Multiple character perspectives
  - Social commentary
  - Letter sequences
  - Relationship development
- **Expected clusters**:
  - Elizabeth's scenes vs. other characters
  - Social events vs. private conversations
  - Early prejudice vs. later understanding
  - Different locations (Longbourn, Pemberley, etc.)

### Gothic Horror

#### **Dracula** (Bram Stoker, 1897)
- **Gutenberg ID**: 345
- **Why it's great**:
  - Multiple narrative voices (journal entries, letters)
  - Distinct tonal shifts
  - Location changes (Transylvania → London)
  - Building dread vs. action sequences
- **Expected clusters**:
  - Each character's journal entries
  - Dracula's appearances vs. absence
  - Travel vs. London
  - Horror vs. investigation

#### **Frankenstein** (Mary Shelley, 1818)
- **Gutenberg ID**: 84
- **Why it's great**:
  - Nested narratives (frame story, Victor's story, creature's story)
  - Philosophical passages
  - Scientific vs. emotional content
  - Arctic frame vs. main narrative
- **Expected clusters**:
  - Different narrators
  - Creation scene vs. consequences
  - Isolation vs. society
  - Nature descriptions vs. urban scenes

#### **Dr Jekyll and Mr Hyde** (Robert Louis Stevenson, 1886)
- **Gutenberg ID**: 43
- **Why it's great**:
  - Short (easy to process quickly)
  - Strong duality theme
  - Mystery structure
  - Different character perspectives
- **Expected clusters**:
  - Jekyll scenes vs. Hyde scenes
  - Scientific explanations vs. horror
  - Different witnesses' accounts
  - Setup vs. revelation

## 🎯 Chunking Strategies

### Smart Chunking (Recommended for novels)
- **How it works**: Auto-detects chapters, falls back to paragraphs
- **Best for**: Well-structured books with clear chapters
- **Result**: Natural narrative units
- **Example**: Agatha Christie mysteries work perfectly

### By Sentences (5 per chunk)
- **How it works**: Groups 5 sentences with 1 sentence overlap
- **Best for**: Dense philosophical or scientific texts
- **Result**: Smaller, more granular chunks
- **Example**: Frankenstein's philosophical passages

### By Paragraphs
- **How it works**: Each chunk is 1-3 paragraphs
- **Best for**: Books with short paragraphs
- **Result**: Medium-sized semantic units
- **Example**: Dialogue-heavy books

### By Characters (500 chars)
- **How it works**: Fixed character count with word boundaries
- **Best for**: Uniformly sized chunks
- **Result**: Consistent chunk sizes for comparison
- **Example**: When comparing different books

## 📊 What to Expect

### Visualization Patterns

#### Mystery Novels (e.g., Agatha Christie)
```
Typical clusters:
🔵 Character introductions (beginning)
🟢 Investigation scenes (middle chapters)
🟡 Red herrings and suspects (scattered)
🔴 Final revelation (end)
⚪ Setting descriptions (throughout)
```

#### Gothic Horror (e.g., Dracula)
```
Typical clusters:
🔵 Atmospheric descriptions
🟢 Horror/danger scenes
🟡 Investigation/pursuit
🔴 Character letters/journals
⚪ Travel sequences
```

#### Romance (e.g., Pride and Prejudice)
```
Typical clusters:
🔵 Social events
🟢 Elizabeth's perspective
🟡 Darcy's scenes
🔴 Letter sequences
⚪ Family interactions
```

### Timing Expectations

For a typical novel (~50-100 chunks):

| Model | Total Time | Per Chunk |
|-------|-----------|-----------|
| granite-embedding | ~5 seconds | 0.1s |
| nomic-embed-text | ~10 seconds | 0.2s |
| embeddinggemma | ~15 seconds | 0.3s |

Add 1-3 seconds for dimensionality reduction.

## 🔬 Interesting Experiments

### 1. **Compare First vs. Last Chapters**
Look for narrative arc patterns:
- Are endings more action-packed?
- Do early chapters focus more on setting?
- How does character development show up spatially?

### 2. **Track Character Appearances**
Search chunk text for character names:
- Do characters cluster by their scenes?
- How separate are different characters' storylines?

### 3. **Compare Different Models**
Generate visualizations with all three models:
- Do they agree on chapter groupings?
- Which model best separates different narrative elements?
- Does the largest model (embeddinggemma) show more nuance?

### 4. **Genre Differences**
Process multiple books:
- Does mystery fiction cluster differently than romance?
- Are horror descriptions semantically distinct?
- How does dialogue cluster vs. description?

### 5. **Author Style**
Compare multiple Agatha Christie books:
- Do her books show consistent patterns?
- Are investigation scenes always similar?
- How do different detectives (Poirot vs. Tommy & Tuppence) differ?

## 🎨 Color Coding

The visualization uses **Viridis colorscale** (sequential):
- 🟣 **Purple/Blue** (low values): Early chunks
- 🟢 **Green/Yellow** (middle values): Middle chunks
- 🟡 **Yellow** (high values): Later chunks

This helps you see if chapters cluster chronologically or thematically.

## 💡 Tips for Best Results

### 1. **Start with Recommended Books**
The listed books have been selected because they:
- Have clear structure
- Show distinct narrative patterns
- Are well-suited for embedding analysis
- Process quickly (reasonable length)

### 2. **Adjust Chunk Count**
- **20-30 chunks**: Fast processing, broad patterns
- **50 chunks** (default): Good balance
- **100+ chunks**: Fine-grained, slower processing

### 3. **Choose Right Technique**
- **PCA**: Faster, good for large chunk counts
- **Isomap**: Slower, better for preserving narrative flow

### 4. **Experiment with Chunking**
- Try different strategies on the same book
- See how chapter boundaries affect clustering
- Compare paragraph vs. sentence-based chunking

## 🐛 Troubleshooting

### "Ollama not running"
```bash
# Start Ollama
ollama serve

# In another terminal, verify it's running
curl http://localhost:11434/api/tags
```

### "No embedding models found"
```bash
# Pull the recommended model
ollama pull nomic-embed-text

# Or pull all three
ollama pull granite-embedding
ollama pull embeddinggemma
```

### "Failed to load book"
- Check internet connection (needs to download from Gutenberg)
- Try a different book ID
- Some older Gutenberg IDs may have moved

### "Disconnected graph" error (Isomap)
- Reduce chunk count
- Use PCA instead
- Increase number of neighbors (happens automatically)

### Slow processing
- Use granite-embedding (smallest/fastest)
- Reduce chunk count
- Use PCA instead of Isomap

## 🔗 Resources

- **Project Gutenberg**: https://www.gutenberg.org/
- **Ollama**: https://ollama.ai/
- **Embedding Models**:
  - [Nomic Embed](https://huggingface.co/nomic-ai/nomic-embed-text-v1)
  - [Granite Embedding](https://huggingface.co/ibm-granite/granite-embedding-30m-english)

## 📝 Example Workflow

```
1. Start Ollama: ollama serve
2. Open app: http://localhost:4444/index_ollama.html
3. Select "The Mysterious Affair at Styles" (Agatha Christie)
4. Chunking: Smart (auto-detect chapters)
5. Max chunks: 50
6. Click "Load & Chunk Text"
   → Result: 45 chunks created
7. Model: nomic-embed-text
8. Technique: PCA (fast)
9. Click "Generate Embeddings & Visualize"
   → Processing: 10 seconds
   → Visualization appears with clear clusters
10. Observe patterns:
    - Early chapters (purple) cluster together (setup)
    - Investigation scenes (green) form a group
    - Final revelation (yellow) stands apart
```

## 🎓 Learning Outcomes

After visualizing several books, you'll understand:

1. **How narrative structure affects embeddings**
   - Chapter boundaries create semantic shifts
   - Character-focused chapters cluster together
   - Atmosphere vs. action creates distinct regions

2. **How different models capture meaning**
   - Larger models show more nuanced clustering
   - Some models better at dialogue vs. description
   - Model choice affects cluster separation

3. **How dimensionality reduction preserves structure**
   - PCA emphasizes major themes
   - Isomap preserves narrative flow better
   - Both reveal hidden patterns in text

This is a powerful way to understand both **embeddings** and **literature** simultaneously!
