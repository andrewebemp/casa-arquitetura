#!/usr/bin/env node
/**
 * Entity Registry Generator
 *
 * Scans the AIOS project structure and generates a YAML entity registry
 * cataloging all agents, tasks, workflows, and squad entities.
 *
 * Usage: node scripts/generate-entity-registry.js
 * Output: .aios-core/data/entity-registry.yaml
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(PROJECT_ROOT, '.aios-core', 'data', 'entity-registry.yaml');

/**
 * Scan a directory for files matching a pattern
 * @param {string} dir - Directory to scan
 * @param {string} ext - File extension to match (e.g., '.md', '.yaml')
 * @returns {string[]} Array of file paths
 */
function scanDir(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith(ext))
      .map(f => path.join(dir, f));
  } catch {
    return [];
  }
}

/**
 * Extract entity ID from filename
 * @param {string} filePath - Full file path
 * @returns {string} Entity ID (filename without extension)
 */
function entityId(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Scan all entity sources and build registry
 * @returns {object} Registry object
 */
function buildRegistry() {
  const registry = {
    schema: 'aios-entity-registry-v1',
    generated: new Date().toISOString(),
    entities: [],
  };

  // 1. Core agents (.aios-core/development/agents/*.md)
  const coreAgentsDir = path.join(PROJECT_ROOT, '.aios-core', 'development', 'agents');
  for (const f of scanDir(coreAgentsDir, '.md')) {
    registry.entities.push({
      id: entityId(f),
      type: 'agent',
      source: 'core',
      path: path.relative(PROJECT_ROOT, f).replace(/\\/g, '/'),
    });
  }

  // 2. Core tasks (.aios-core/development/tasks/*.md)
  const coreTasksDir = path.join(PROJECT_ROOT, '.aios-core', 'development', 'tasks');
  for (const f of scanDir(coreTasksDir, '.md')) {
    registry.entities.push({
      id: entityId(f),
      type: 'task',
      source: 'core',
      path: path.relative(PROJECT_ROOT, f).replace(/\\/g, '/'),
    });
  }

  // 3. Core workflows (.aios-core/development/workflows/*.yaml)
  const coreWorkflowsDir = path.join(PROJECT_ROOT, '.aios-core', 'development', 'workflows');
  for (const f of scanDir(coreWorkflowsDir, '.yaml')) {
    registry.entities.push({
      id: entityId(f),
      type: 'workflow',
      source: 'core',
      path: path.relative(PROJECT_ROOT, f).replace(/\\/g, '/'),
    });
  }

  // 4. Squad entities (squads/*/agents/*.md, tasks/*.md, workflows/*.yaml)
  const squadsDir = path.join(PROJECT_ROOT, 'squads');
  if (fs.existsSync(squadsDir)) {
    const squads = fs.readdirSync(squadsDir).filter(s => {
      const stat = fs.statSync(path.join(squadsDir, s));
      return stat.isDirectory();
    });

    for (const squad of squads) {
      const squadPath = path.join(squadsDir, squad);

      // Squad agents
      for (const f of scanDir(path.join(squadPath, 'agents'), '.md')) {
        registry.entities.push({
          id: entityId(f),
          type: 'squad-agent',
          source: `squad:${squad}`,
          path: path.relative(PROJECT_ROOT, f).replace(/\\/g, '/'),
        });
      }

      // Squad tasks
      for (const f of scanDir(path.join(squadPath, 'tasks'), '.md')) {
        registry.entities.push({
          id: entityId(f),
          type: 'squad-task',
          source: `squad:${squad}`,
          path: path.relative(PROJECT_ROOT, f).replace(/\\/g, '/'),
        });
      }

      // Squad workflows
      for (const f of scanDir(path.join(squadPath, 'workflows'), '.yaml')) {
        registry.entities.push({
          id: entityId(f),
          type: 'squad-workflow',
          source: `squad:${squad}`,
          path: path.relative(PROJECT_ROOT, f).replace(/\\/g, '/'),
        });
      }
    }
  }

  return registry;
}

/**
 * Convert registry to YAML format
 * @param {object} registry - Registry object
 * @returns {string} YAML string
 */
function toYaml(registry) {
  let yaml = `# AIOS Entity Registry\n`;
  yaml += `# Generated: ${registry.generated}\n`;
  yaml += `# Total entities: ${registry.entities.length}\n`;
  yaml += `schema: ${registry.schema}\n`;
  yaml += `generated: "${registry.generated}"\n`;
  yaml += `entities:\n`;

  for (const entity of registry.entities) {
    yaml += `  - id: "${entity.id}"\n`;
    yaml += `    type: ${entity.type}\n`;
    yaml += `    source: "${entity.source}"\n`;
    yaml += `    path: "${entity.path}"\n`;
  }

  return yaml;
}

// Main
const registry = buildRegistry();
const yaml = toYaml(registry);

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_PATH, yaml, 'utf8');
console.log(`Entity registry generated: ${OUTPUT_PATH}`);
console.log(`Total entities: ${registry.entities.length}`);

// Print summary by type
const typeCounts = {};
for (const e of registry.entities) {
  typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
}
for (const [type, count] of Object.entries(typeCounts)) {
  console.log(`  ${type}: ${count}`);
}
