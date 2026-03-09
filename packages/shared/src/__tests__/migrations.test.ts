import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(__dirname, '..', '..', '..', '..', 'supabase', 'migrations');

const readMigration = (filename: string): string =>
  readFileSync(join(MIGRATIONS_DIR, filename), 'utf-8');

const allMigrationsSql = (): string => {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  return files.map((f) => readMigration(f)).join('\n');
};

describe('Migration files', () => {
  let migrationFiles: string[];

  beforeAll(() => {
    migrationFiles = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();
  });

  it('has exactly 15 migration files', () => {
    expect(migrationFiles).toHaveLength(15);
  });

  it('files are ordered sequentially 001-015', () => {
    const expected = [
      '001_extensions.sql',
      '002_user_profiles.sql',
      '003_projects.sql',
      '004_project_versions.sql',
      '005_spatial_inputs.sql',
      '006_reference_items.sql',
      '007_chat_messages.sql',
      '008_subscriptions.sql',
      '009_diagnostics.sql',
      '010_render_jobs.sql',
      '011_share_links.sql',
      '012_triggers.sql',
      '013_handle_new_user.sql',
      '014_webhook_events.sql',
      '015_lgpd_compliance.sql',
    ];
    expect(migrationFiles).toEqual(expected);
  });
});

describe('001_extensions', () => {
  let sql: string;
  beforeAll(() => { sql = readMigration('001_extensions.sql'); });

  it('enables uuid-ossp extension', () => {
    expect(sql).toContain('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  });

  it('enables pgcrypto extension', () => {
    expect(sql).toContain('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  });
});

describe('Table creation — all 12 tables', () => {
  let allSql: string;
  beforeAll(() => { allSql = allMigrationsSql(); });

  const tables = [
    'user_profiles',
    'projects',
    'project_versions',
    'spatial_inputs',
    'reference_items',
    'chat_messages',
    'subscriptions',
    'diagnostics',
    'render_jobs',
    'share_links',
    'webhook_events',
    'user_data_exports',
  ];

  it.each(tables)('creates table %s', (table) => {
    expect(allSql).toContain(`CREATE TABLE ${table}`);
  });

  it('all 12 tables are created', () => {
    const createTableMatches = allSql.match(/CREATE TABLE \w+/g) || [];
    expect(createTableMatches.length).toBe(12);
  });
});

describe('RLS policies', () => {
  let allSql: string;
  beforeAll(() => { allSql = allMigrationsSql(); });

  const tables = [
    'user_profiles',
    'projects',
    'project_versions',
    'spatial_inputs',
    'reference_items',
    'chat_messages',
    'subscriptions',
    'diagnostics',
    'render_jobs',
    'share_links',
  ];

  it.each(tables)('enables RLS on %s', (table) => {
    expect(allSql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
  });

  it('user_profiles has SELECT, UPDATE, INSERT policies', () => {
    const sql = readMigration('002_user_profiles.sql');
    expect(sql).toContain('FOR SELECT USING (auth.uid() = id)');
    expect(sql).toContain('FOR UPDATE USING (auth.uid() = id)');
    expect(sql).toContain('FOR INSERT WITH CHECK (auth.uid() = id)');
  });

  it('projects has full CRUD policies', () => {
    const sql = readMigration('003_projects.sql');
    expect(sql).toContain('FOR SELECT USING');
    expect(sql).toContain('FOR INSERT WITH CHECK');
    expect(sql).toContain('FOR UPDATE USING');
    expect(sql).toContain('FOR DELETE USING');
  });

  it('diagnostics has public INSERT policy', () => {
    const sql = readMigration('009_diagnostics.sql');
    expect(sql).toContain('FOR INSERT WITH CHECK (true)');
  });

  it('diagnostics SELECT allows session_token access', () => {
    const sql = readMigration('009_diagnostics.sql');
    expect(sql).toContain('session_token IS NOT NULL');
  });

  it('share_links has public SELECT policy', () => {
    const sql = readMigration('011_share_links.sql');
    expect(sql).toContain('FOR SELECT USING (true)');
  });

  it('share_links INSERT requires project ownership', () => {
    const sql = readMigration('011_share_links.sql');
    expect(sql).toContain('FOR INSERT WITH CHECK');
    expect(sql).toContain('projects.user_id = auth.uid()');
  });
});

describe('Indexes — all 14 required', () => {
  let allSql: string;
  beforeAll(() => { allSql = allMigrationsSql(); });

  const requiredIndexes = [
    'idx_projects_user_id',
    'idx_projects_status',
    'idx_projects_created_at',
    'idx_versions_project_id',
    'idx_versions_created_at',
    'idx_chat_project_id',
    'idx_chat_created_at',
    'idx_reference_items_project',
    'idx_diagnostics_user_id',
    'idx_diagnostics_session',
    'idx_jobs_project_id',
    'idx_jobs_status',
    'idx_jobs_created_at',
    'idx_share_token',
  ];

  it.each(requiredIndexes)('creates index %s', (index) => {
    expect(allSql).toContain(`CREATE INDEX ${index}`);
  });

  it('has all 14 required indexes', () => {
    for (const idx of requiredIndexes) {
      expect(allSql).toContain(`CREATE INDEX ${idx}`);
    }
  });
});

describe('CHECK constraints', () => {
  it('projects.input_type has CHECK constraint', () => {
    const sql = readMigration('003_projects.sql');
    expect(sql).toContain('input_type IN (\'photo\', \'text\', \'combined\')');
  });

  it('projects.style has CHECK with 10 styles', () => {
    const sql = readMigration('003_projects.sql');
    const styles = ['moderno', 'industrial', 'minimalista', 'classico', 'escandinavo',
      'rustico', 'tropical', 'contemporaneo', 'boho', 'luxo'];
    for (const style of styles) {
      expect(sql).toContain(`'${style}'`);
    }
  });

  it('projects.status has CHECK constraint with all statuses', () => {
    const sql = readMigration('003_projects.sql');
    expect(sql).toContain('\'draft\'');
    expect(sql).toContain('\'analyzing\'');
    expect(sql).toContain('\'croqui_review\'');
    expect(sql).toContain('\'generating\'');
    expect(sql).toContain('\'ready\'');
    expect(sql).toContain('\'error\'');
  });

  it('subscriptions.tier has CHECK constraint', () => {
    const sql = readMigration('008_subscriptions.sql');
    expect(sql).toContain('tier IN (\'free\', \'pro\', \'business\')');
  });

  it('render_jobs.type has CHECK constraint', () => {
    const sql = readMigration('010_render_jobs.sql');
    expect(sql).toContain('\'initial\'');
    expect(sql).toContain('\'refinement\'');
    expect(sql).toContain('\'style_change\'');
    expect(sql).toContain('\'segmentation\'');
    expect(sql).toContain('\'diagnostic\'');
    expect(sql).toContain('\'upscale\'');
  });

  it('render_jobs.status has CHECK constraint', () => {
    const sql = readMigration('010_render_jobs.sql');
    expect(sql).toContain('\'queued\'');
    expect(sql).toContain('\'processing\'');
    expect(sql).toContain('\'completed\'');
    expect(sql).toContain('\'failed\'');
    expect(sql).toContain('\'canceled\'');
  });

  it('chat_messages.role has CHECK constraint', () => {
    const sql = readMigration('007_chat_messages.sql');
    expect(sql).toContain('role IN (\'user\', \'assistant\', \'system\')');
  });
});

describe('Triggers', () => {
  it('creates update_updated_at function', () => {
    const sql = readMigration('012_triggers.sql');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION update_updated_at()');
    expect(sql).toContain('NEW.updated_at = now()');
  });

  it('creates triggers for 4 tables with updated_at', () => {
    const sql = readMigration('012_triggers.sql');
    expect(sql).toContain('trg_user_profiles_updated');
    expect(sql).toContain('trg_projects_updated');
    expect(sql).toContain('trg_spatial_inputs_updated');
    expect(sql).toContain('trg_subscriptions_updated');
  });
});

describe('handle_new_user auto-provisioning', () => {
  let sql: string;
  beforeAll(() => { sql = readMigration('013_handle_new_user.sql'); });

  it('creates handle_new_user function', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION handle_new_user()');
  });

  it('uses SECURITY DEFINER', () => {
    expect(sql).toContain('SECURITY DEFINER');
  });

  it('inserts into user_profiles', () => {
    expect(sql).toContain('INSERT INTO user_profiles');
  });

  it('inserts into subscriptions with free tier and renders_limit=3', () => {
    expect(sql).toContain('INSERT INTO subscriptions');
    expect(sql).toContain('\'free\'');
    expect(sql).toContain(', 3)');
  });

  it('creates on_auth_user_created trigger on auth.users', () => {
    expect(sql).toContain('CREATE TRIGGER on_auth_user_created');
    expect(sql).toContain('AFTER INSERT ON auth.users');
  });

  it('extracts display_name from metadata or email', () => {
    expect(sql).toContain('raw_user_meta_data->>\'full_name\'');
    expect(sql).toContain('NEW.email');
  });

  it('extracts avatar_url from metadata', () => {
    expect(sql).toContain('raw_user_meta_data->>\'avatar_url\'');
  });
});

describe('Column-level schema validation', () => {
  it('user_profiles.preferred_style CHECK with 10 styles', () => {
    const sql = readMigration('002_user_profiles.sql');
    expect(sql).toContain('preferred_style TEXT CHECK');
  });

  it('user_profiles has lgpd_consent_at and training_opt_in', () => {
    const sql = readMigration('002_user_profiles.sql');
    expect(sql).toContain('lgpd_consent_at TIMESTAMPTZ');
    expect(sql).toContain('training_opt_in BOOLEAN NOT NULL DEFAULT false');
  });

  it('project_versions has UNIQUE(project_id, version_number)', () => {
    const sql = readMigration('004_project_versions.sql');
    expect(sql).toContain('UNIQUE(project_id, version_number)');
  });

  it('spatial_inputs has UNIQUE on project_id', () => {
    const sql = readMigration('005_spatial_inputs.sql');
    expect(sql).toContain('ON DELETE CASCADE UNIQUE');
  });

  it('reference_items has individual NUMERIC dimension columns', () => {
    const sql = readMigration('006_reference_items.sql');
    expect(sql).toContain('width_m NUMERIC(5,2)');
    expect(sql).toContain('depth_m NUMERIC(5,2)');
    expect(sql).toContain('height_m NUMERIC(5,2)');
  });

  it('subscriptions has UNIQUE on user_id', () => {
    const sql = readMigration('008_subscriptions.sql');
    expect(sql).toContain('ON DELETE CASCADE UNIQUE');
  });

  it('subscriptions has nullable payment_gateway', () => {
    const sql = readMigration('008_subscriptions.sql');
    expect(sql).toContain('payment_gateway TEXT CHECK');
    expect(sql).not.toMatch(/payment_gateway TEXT NOT NULL/);
  });

  it('share_links has share_token with gen_random_bytes default', () => {
    const sql = readMigration('011_share_links.sql');
    expect(sql).toContain('share_token TEXT NOT NULL UNIQUE');
    expect(sql).toContain('gen_random_bytes(16)');
  });

  it('share_links has include_watermark and view_count', () => {
    const sql = readMigration('011_share_links.sql');
    expect(sql).toContain('include_watermark BOOLEAN NOT NULL DEFAULT true');
    expect(sql).toContain('view_count INTEGER NOT NULL DEFAULT 0');
  });

  it('diagnostics.user_id allows NULL (anonymous access)', () => {
    const sql = readMigration('009_diagnostics.sql');
    expect(sql).toContain('user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL');
    expect(sql).not.toMatch(/user_id UUID NOT NULL/);
  });

  it('render_jobs has attempts, started_at, completed_at', () => {
    const sql = readMigration('010_render_jobs.sql');
    expect(sql).toContain('attempts INTEGER NOT NULL DEFAULT 0');
    expect(sql).toContain('started_at TIMESTAMPTZ');
    expect(sql).toContain('completed_at TIMESTAMPTZ');
  });
});
