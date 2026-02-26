#!/usr/bin/env node

/**
 * Story Parser - Autonomous Mode
 *
 * Parses AIOS markdown stories into structured JSON for the autonomous runner.
 * Extracts: ID, status, acceptance criteria, tasks, dependencies.
 *
 * Usage:
 *   node story-parser.js --dir docs/stories        # Parse all stories
 *   node story-parser.js --file docs/stories/1.1/story.md  # Parse single story
 *   node story-parser.js --pending                  # Only pending stories
 *
 * Output: JSON to stdout
 *
 * @module story-parser
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════
//                              PARSING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse a single story markdown file into structured data
 * @param {string} filePath - Path to story.md
 * @returns {Object} Parsed story object
 */
function parseStory(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const story = {
    id: extractStoryId(filePath, lines),
    path: filePath,
    title: '',
    status: 'Draft',
    description: '',
    acceptanceCriteria: [],
    tasks: [],
    dependencies: [],
    totalTasks: 0,
    completedTasks: 0,
    qaResults: null,
  };

  let currentSection = null;
  let sectionContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse title from H1
    if (line.startsWith('# ') && !story.title) {
      story.title = line.replace(/^#\s+/, '').trim();
      // Extract ID from title if format is "Story X.Y.Z - Title"
      const titleMatch = story.title.match(/Story\s+([\d.]+)\s*[-–—]\s*(.*)/i);
      if (titleMatch) {
        story.id = titleMatch[1];
        story.title = titleMatch[2].trim();
      }
      continue;
    }

    // Parse status
    const statusMatch = line.match(/^##\s*Status:\s*(.+)/i);
    if (statusMatch) {
      story.status = statusMatch[1].trim();
      continue;
    }

    // Also check for "## Status" followed by the status value
    if (line.match(/^##\s*Status\s*$/i) && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine && !nextLine.startsWith('#')) {
        story.status = nextLine;
        continue;
      }
    }

    // Track sections
    if (line.startsWith('## ')) {
      // Save previous section
      if (currentSection) {
        processSectionContent(story, currentSection, sectionContent);
      }
      currentSection = line.replace(/^##\s+/, '').trim().toLowerCase();
      sectionContent = [];
      continue;
    }

    if (currentSection) {
      sectionContent.push(line);
    }
  }

  // Process last section
  if (currentSection) {
    processSectionContent(story, currentSection, sectionContent);
  }

  // Count tasks
  story.totalTasks = story.tasks.length;
  story.completedTasks = story.tasks.filter((t) => t.completed).length;

  return story;
}

/**
 * Extract story ID from file path or content
 */
function extractStoryId(filePath, _lines) {
  // Try to get ID from directory name (e.g., docs/stories/1.1/story.md)
  const dirName = path.basename(path.dirname(filePath));
  if (/^[\d.]+$/.test(dirName)) {
    return dirName;
  }

  // Try to get ID from directory name with prefix (e.g., docs/stories/story-1.1/story.md)
  const dirMatch = dirName.match(/([\d.]+)/);
  if (dirMatch) {
    return dirMatch[1];
  }

  return dirName;
}

/**
 * Process content of a parsed section
 */
function processSectionContent(story, section, lines) {
  const content = lines.join('\n').trim();

  switch (section) {
    case 'story':
    case 'description':
      story.description = content;
      break;

    case 'acceptance criteria':
    case 'acceptance criteria (given/when/then)':
      story.acceptanceCriteria = parseAcceptanceCriteria(lines);
      break;

    case 'tasks':
    case 'subtasks':
    case 'tasks and subtasks':
      story.tasks = parseTasks(lines);
      break;

    case 'dependencies':
      story.dependencies = parseDependencies(lines);
      break;

    case 'qa results':
    case 'qa review':
      story.qaResults = content || null;
      break;
  }
}

/**
 * Parse acceptance criteria from lines
 */
function parseAcceptanceCriteria(lines) {
  const criteria = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match "- Given X, When Y, Then Z" or "- AC1: description"
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (current) criteria.push(current);
      current = trimmed.replace(/^[-*]\s+/, '');
    } else if (current) {
      current += ' ' + trimmed;
    }
  }

  if (current) criteria.push(current);
  return criteria;
}

/**
 * Parse tasks from lines (with checkbox support)
 */
function parseTasks(lines) {
  const tasks = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match "- [ ] Task" or "- [x] Task"
    const checkboxMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.*)/);
    if (checkboxMatch) {
      tasks.push({
        id: `task-${tasks.length + 1}`,
        description: checkboxMatch[2].trim(),
        completed: checkboxMatch[1].toLowerCase() === 'x',
      });
      continue;
    }

    // Match numbered tasks "1. Task"
    const numberedMatch = trimmed.match(/^\d+\.\s+(.*)/);
    if (numberedMatch) {
      tasks.push({
        id: `task-${tasks.length + 1}`,
        description: numberedMatch[1].trim(),
        completed: false,
      });
      continue;
    }

    // Match plain list items "- Task"
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      tasks.push({
        id: `task-${tasks.length + 1}`,
        description: trimmed.replace(/^[-*]\s+/, ''),
        completed: false,
      });
    }
  }

  return tasks;
}

/**
 * Parse dependencies from lines
 */
function parseDependencies(lines) {
  const deps = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      deps.push(trimmed.replace(/^[-*]\s+/, ''));
    }
  }

  return deps;
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              DISCOVERY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Discover all stories in a directory
 * @param {string} storiesDir - Path to stories directory
 * @returns {string[]} Array of story file paths
 */
function discoverStories(storiesDir) {
  const stories = [];

  if (!fs.existsSync(storiesDir)) {
    return stories;
  }

  const entries = fs.readdirSync(storiesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const storyFile = path.join(storiesDir, entry.name, 'story.md');
      if (fs.existsSync(storyFile)) {
        stories.push(storyFile);
      }
    } else if (entry.name.endsWith('.md')) {
      stories.push(path.join(storiesDir, entry.name));
    }
  }

  // Sort by story ID (numeric)
  stories.sort((a, b) => {
    const idA = extractStoryId(a, []);
    const idB = extractStoryId(b, []);
    return idA.localeCompare(idB, undefined, { numeric: true });
  });

  return stories;
}

/**
 * Parse all stories and return structured data
 * @param {string} storiesDir - Path to stories directory
 * @param {Object} options - Filter options
 * @returns {Object[]} Array of parsed stories
 */
function parseAllStories(storiesDir, options = {}) {
  const storyFiles = discoverStories(storiesDir);
  let stories = storyFiles.map((f) => parseStory(f));

  if (options.pendingOnly) {
    stories = stories.filter(
      (s) => s.status.toLowerCase() !== 'done' && s.status.toLowerCase() !== 'completed'
    );
  }

  if (options.status) {
    const targetStatus = options.status.toLowerCase();
    stories = stories.filter((s) => s.status.toLowerCase() === targetStatus);
  }

  return stories;
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              CLI
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  const args = process.argv.slice(2);
  const options = {};

  let mode = 'dir';
  let target = 'docs/stories';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dir':
        mode = 'dir';
        target = args[++i] || 'docs/stories';
        break;
      case '--file':
        mode = 'file';
        target = args[++i];
        break;
      case '--pending':
        options.pendingOnly = true;
        break;
      case '--status':
        options.status = args[++i];
        break;
      case '--help':
        console.log(`Usage:
  node story-parser.js --dir docs/stories        Parse all stories
  node story-parser.js --file path/to/story.md   Parse single story
  node story-parser.js --pending                  Only pending stories
  node story-parser.js --status Draft             Filter by status`);
        process.exit(0);
    }
  }

  try {
    let result;

    if (mode === 'file') {
      if (!target || !fs.existsSync(target)) {
        console.error(`Error: File not found: ${target}`);
        process.exit(1);
      }
      result = parseStory(target);
    } else {
      result = parseAllStories(target, options);
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
module.exports = {
  parseStory,
  parseAllStories,
  discoverStories,
};

// Run CLI if called directly
if (require.main === module) {
  main();
}
