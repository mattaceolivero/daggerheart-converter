/**
 * Formatters Module
 *
 * Provides various output formatters for Daggerheart adversary data.
 * Currently supports Markdown output with plans for JSON, HTML, and
 * other formats in future iterations.
 *
 * @module formatters
 * @version 1.0.0
 */

// Markdown Formatter
export {
  formatAsMarkdown,
  formatMultipleAsMarkdown,
  formatCompact,
  MarkdownFormatOptions,
} from './markdownFormatter';

// Re-export default
export { default } from './markdownFormatter';
