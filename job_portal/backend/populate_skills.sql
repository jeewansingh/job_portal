-- SQL Script to Populate Skills Table
-- Run this script if your skills table is empty

-- First, check if skills exist
SELECT COUNT(*) as skill_count FROM skills;

-- Insert common skills if they don't exist
INSERT INTO skills (name, category) VALUES
    ('Python', 'Programming Languages'),
    ('JavaScript', 'Programming Languages'),
    ('TypeScript', 'Programming Languages'),
    ('Java', 'Programming Languages'),
    ('C++', 'Programming Languages'),
    ('C#', 'Programming Languages'),
    ('Go', 'Programming Languages'),
    ('PHP', 'Programming Languages'),
    ('React', 'Frontend'),
    ('Vue', 'Frontend'),
    ('Angular', 'Frontend'),
    ('HTML', 'Frontend'),
    ('CSS', 'Frontend'),
    ('Tailwind CSS', 'Frontend'),
    ('Bootstrap', 'Frontend'),
    ('FastAPI', 'Backend'),
    ('Django', 'Backend'),
    ('Flask', 'Backend'),
    ('Node.js', 'Backend'),
    ('Express.js', 'Backend'),
    ('Spring Boot', 'Backend'),
    ('PostgreSQL', 'Database'),
    ('MySQL', 'Database'),
    ('MongoDB', 'Database'),
    ('Redis', 'Database'),
    ('Docker', 'DevOps'),
    ('Kubernetes', 'DevOps'),
    ('Git', 'DevOps'),
    ('AWS', 'Cloud'),
    ('Azure', 'Cloud'),
    ('Google Cloud', 'Cloud'),
    ('Machine Learning', 'AI'),
    ('TensorFlow', 'AI'),
    ('PyTorch', 'AI')
ON CONFLICT (name) DO NOTHING;

-- Verify skills were inserted
SELECT id, name, category FROM skills ORDER BY name;

-- Check user_skills table structure
\d user_skills;

-- Show recent user registrations
SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;

-- Check if any user_skills exist
SELECT us.id, us.user_id, us.skill_id, u.full_name, s.name as skill_name
FROM user_skills us
JOIN users u ON us.user_id = u.id
JOIN skills s ON us.skill_id = s.id
ORDER BY us.id DESC
LIMIT 10;
