-- Enquiries submitted through the site's forms (src/pages/api/lead.ts).
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  need TEXT,
  quantity TEXT,
  product TEXT,
  message TEXT,
  page TEXT,
  ip TEXT
);

CREATE INDEX IF NOT EXISTS leads_created_at ON leads (created_at);
