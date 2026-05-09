type NeonRow = Record<string, unknown>;

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error("Neon is not configured. Add DATABASE_URL to .env.");
  }

  return value.replace(/^psql\s+['"]?/, "").replace(/['"]$/, "");
}

function getSqlEndpoint(databaseUrl: string) {
  const url = new URL(databaseUrl);
  return `https://${url.hostname}/sql`;
}

export async function neonQuery<T extends NeonRow = NeonRow>(
  query: string,
  params: unknown[] = [],
) {
  const databaseUrl = getDatabaseUrl();
  const response = await fetch(getSqlEndpoint(databaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Neon-Connection-String": databaseUrl,
      "Neon-Raw-Text-Output": "true",
      "Neon-Array-Mode": "true",
    },
    body: JSON.stringify({ query, params }),
  });

  if (!response.ok) {
    throw new Error(`Neon query failed: ${await response.text()}`);
  }

  const result = await response.json();
  const fields = Array.isArray(result.fields) ? result.fields : [];
  const rows = Array.isArray(result.rows) ? result.rows : [];
  const names = fields.map((field: { name: string }) => field.name);

  return rows.map((row: unknown[]) =>
    Object.fromEntries(row.map((value, index) => [names[index], value])),
  ) as T[];
}

export async function ensureAuthSchema() {
  await neonQuery(`
    CREATE TABLE IF NOT EXISTS vs_users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function upsertUser(email: string, name: string) {
  await ensureAuthSchema();
  const [user] = await neonQuery<{ email: string; name: string }>(
    `
      INSERT INTO vs_users (email, name, last_seen_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name, last_seen_at = NOW()
      RETURNING email, name
    `,
    [email, name],
  );
  return user;
}

export async function findUserByEmail(email: string) {
  await ensureAuthSchema();
  const [user] = await neonQuery<{ email: string; name: string }>(
    "SELECT email, name FROM vs_users WHERE email = $1 LIMIT 1",
    [email],
  );

  if (!user) {
    return null;
  }

  await neonQuery("UPDATE vs_users SET last_seen_at = NOW() WHERE email = $1", [
    email,
  ]);

  return user;
}
