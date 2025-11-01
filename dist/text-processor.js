// Text Processing Utilities for Long Documents
class TextProcessor {
  /**
   * Chunk text by sentences with overlap
   */
  static chunkBySentences(text, sentencesPerChunk = 5, overlap = 1) {
    // Split into sentences
    const sentences = text.replace(/\n+/g, ' ').split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    const chunks = [];
    for (let i = 0; i < sentences.length; i += sentencesPerChunk - overlap) {
      const chunk = sentences.slice(i, i + sentencesPerChunk).join('. ') + '.';
      if (chunk.length > 20) {
        chunks.push(chunk);
      }
    }
    return chunks;
  }

  /**
   * Chunk text by paragraphs
   */
  static chunkByParagraphs(text, maxChunks = 100) {
    const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 50);

    // If too many paragraphs, combine them
    if (paragraphs.length > maxChunks) {
      const chunksPerGroup = Math.ceil(paragraphs.length / maxChunks);
      const chunks = [];
      for (let i = 0; i < paragraphs.length; i += chunksPerGroup) {
        const chunk = paragraphs.slice(i, i + chunksPerGroup).join('\n\n');
        chunks.push(chunk);
      }
      return chunks;
    }
    return paragraphs;
  }

  /**
   * Chunk text by character count with word boundaries
   */
  static chunkByChars(text, charsPerChunk = 500, overlap = 50) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + charsPerChunk, text.length);

      // Find word boundary
      if (end < text.length) {
        const nextSpace = text.indexOf(' ', end);
        if (nextSpace !== -1 && nextSpace - end < 50) {
          end = nextSpace;
        }
      }
      const chunk = text.slice(start, end).trim();
      if (chunk.length > 20) {
        chunks.push(chunk);
      }
      start = end - overlap;
    }
    return chunks;
  }

  /**
   * Smart chunking that preserves chapter/section boundaries
   */
  static smartChunk(text, targetChunks = 50) {
    // Try to detect chapters
    const chapterPattern = /CHAPTER\s+[IVXLCDM0-9]+|Chapter\s+\d+/gi;
    const chapters = text.split(chapterPattern).filter(c => c.trim().length > 100);
    if (chapters.length >= 3 && chapters.length <= targetChunks * 2) {
      // Good chapter structure, use chapters
      return chapters.map(c => c.trim());
    }

    // Fall back to paragraph chunking
    return this.chunkByParagraphs(text, targetChunks);
  }

  /**
   * Extract metadata from Gutenberg text
   */
  static parseGutenbergText(text) {
    const titleMatch = text.match(/Title:\s*(.+)/i);
    const authorMatch = text.match(/Author:\s*(.+)/i);
    const releaseMatch = text.match(/Release Date:\s*(.+)/i);

    // Find start and end markers
    const startMarker = /\*\*\* START OF (THE|THIS) PROJECT GUTENBERG EBOOK .+ \*\*\*/i;
    const endMarker = /\*\*\* END OF (THE|THIS) PROJECT GUTENBERG EBOOK .+ \*\*\*/i;
    const startMatch = text.match(startMarker);
    const endMatch = text.match(endMarker);
    let content = text;
    if (startMatch) {
      content = text.slice(text.indexOf(startMatch[0]) + startMatch[0].length);
    }
    if (endMatch) {
      content = content.slice(0, content.indexOf(endMatch[0]));
    }
    return {
      title: titleMatch ? titleMatch[1].trim() : 'Unknown',
      author: authorMatch ? authorMatch[1].trim() : 'Unknown',
      releaseDate: releaseMatch ? releaseMatch[1].trim() : 'Unknown',
      content: content.trim()
    };
  }

  /**
   * Download and process Project Gutenberg text from local files
   */
  static async fetchGutenbergBook(bookId) {
    // Load from local texts directory
    const url = `/texts/${bookId}.txt`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      return this.parseGutenbergText(text);
    } catch (error) {
      throw new Error(`Failed to load book ${bookId}. Please run './download-texts.sh' to download texts. Error: ${error.message}`);
    }
  }

  /**
   * Clean text for embedding
   */
  static cleanText(text) {
    return text.replace(/\s+/g, ' ').replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
    .trim();
  }

  /**
   * Get text statistics
   */
  static getStats(text) {
    const words = text.split(/\s+/).length;
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).length;
    const paragraphs = text.split(/\n\n+/).length;
    return {
      words,
      chars,
      sentences,
      paragraphs,
      avgWordsPerSentence: Math.round(words / sentences),
      avgCharsPerWord: Math.round(chars / words)
    };
  }
}

// Recommended Project Gutenberg Books
const RECOMMENDED_BOOKS = {
  'agatha-christie-styles': {
    id: 863,
    title: 'The Mysterious Affair at Styles',
    author: 'Agatha Christie',
    year: 1920,
    description: 'First Hercule Poirot novel, classic mystery with multiple suspects',
    recommended: true
  },
  'agatha-christie-adversary': {
    id: 1155,
    title: 'The Secret Adversary',
    author: 'Agatha Christie',
    year: 1922,
    description: 'Tommy and Tuppence detective duo, international intrigue'
  },
  'sherlock-hound': {
    id: 2852,
    title: 'The Hound of the Baskervilles',
    author: 'Arthur Conan Doyle',
    year: 1902,
    description: 'Famous Sherlock Holmes mystery, Gothic atmosphere'
  },
  'alice-wonderland': {
    id: 11,
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    year: 1865,
    description: 'Fantastical journey with distinct chapters and characters'
  },
  'pride-prejudice': {
    id: 1342,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    description: 'Classic romance, multiple character perspectives'
  },
  'dracula': {
    id: 345,
    title: 'Dracula',
    author: 'Bram Stoker',
    year: 1897,
    description: 'Gothic horror told through letters and diary entries'
  },
  'frankenstein': {
    id: 84,
    title: 'Frankenstein',
    author: 'Mary Shelley',
    year: 1818,
    description: 'Science fiction classic with philosophical themes'
  },
  'jekyll-hyde': {
    id: 43,
    title: 'Strange Case of Dr Jekyll and Mr Hyde',
    author: 'Robert Louis Stevenson',
    year: 1886,
    description: 'Psychological thriller, duality theme'
  }
};