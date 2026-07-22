-- REFERENCE: skill_aliases table structure
-- NOTE: This table already exists in your database with data!
-- This file is just for reference - DO NOT RUN if table already exists

-- Expected table structure:
/*
CREATE TABLE skill_aliases (
    id SERIAL PRIMARY KEY,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    alias VARCHAR(100) NOT NULL UNIQUE
);

CREATE INDEX idx_skill_aliases_skill_id ON skill_aliases(skill_id);
CREATE INDEX idx_skill_aliases_alias ON skill_aliases(alias);
*/

-- Example queries to view your existing data:

-- View all aliases
-- SELECT sa.id, sa.alias, s.name as skill_name
-- FROM skill_aliases sa
-- JOIN skills s ON sa.skill_id = s.id
-- ORDER BY s.name, sa.alias;

-- Count aliases per skill
-- SELECT s.name, COUNT(sa.id) as alias_count
-- FROM skills s
-- LEFT JOIN skill_aliases sa ON s.id = sa.skill_id
-- GROUP BY s.name
-- HAVING COUNT(sa.id) > 0
-- ORDER BY alias_count DESC;

-- Find aliases for a specific skill
-- SELECT alias FROM skill_aliases
-- WHERE skill_id = (SELECT id FROM skills WHERE name = 'JavaScript');

-- Add a new alias (example)
-- INSERT INTO skill_aliases (skill_id, alias) 
-- SELECT id, 'new_alias' FROM skills WHERE name = 'SkillName'
-- ON CONFLICT (alias) DO NOTHING;
