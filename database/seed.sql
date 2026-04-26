INSERT INTO skills (name, category, description)
VALUES
  ('Python', 'programming', 'General purpose programming for backend and ML.'),
  ('SQL', 'data', 'Relational querying and data modeling.'),
  ('PostgreSQL', 'data', 'Advanced relational database design and operations.'),
  ('Node.js', 'programming', 'JavaScript runtime for backend services.'),
  ('Express', 'programming', 'Web framework for Node.js APIs.'),
  ('React', 'frontend', 'UI development using component architecture.'),
  ('TypeScript', 'programming', 'Typed JavaScript for safer large codebases.'),
  ('Docker', 'devops', 'Containerization and deployment packaging.'),
  ('FastAPI', 'programming', 'Python API framework for ML workloads.'),
  ('Machine Learning', 'ai', 'Applied ML model development and deployment.'),
  ('Data Structures', 'computer-science', 'Core algorithm and data structure knowledge.'),
  ('System Design', 'architecture', 'Designing scalable distributed systems.'),
  ('REST APIs', 'backend', 'Design and implementation of HTTP APIs.'),
  ('Firebase Auth', 'backend', 'Identity and authentication integration.'),
  ('CI/CD', 'devops', 'Continuous integration and delivery pipelines.')
ON CONFLICT (name) DO UPDATE
SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO career_paths (slug, title, description, required_skills, salary_band, growth_outlook)
VALUES
  (
    'backend-engineer',
    'Backend Engineer',
    'Build and scale resilient APIs and data platforms.',
    '["Node.js", "Express", "PostgreSQL", "REST APIs", "System Design"]'::jsonb,
    '{"currency": "USD", "range": "90000-160000", "display": "$90K-$160K"}'::jsonb,
    'High'
  ),
  (
    'full-stack-engineer',
    'Full Stack Engineer',
    'Deliver end-to-end product features across frontend and backend.',
    '["React", "Node.js", "PostgreSQL", "TypeScript", "REST APIs"]'::jsonb,
    '{"currency": "USD", "range": "100000-175000", "display": "$100K-$175K"}'::jsonb,
    'High'
  ),
  (
    'ml-engineer',
    'ML Engineer',
    'Build ML pipelines and production inference services.',
    '["Python", "Machine Learning", "SQL", "FastAPI", "Docker"]'::jsonb,
    '{"currency": "USD", "range": "110000-190000", "display": "$110K-$190K"}'::jsonb,
    'Very High'
  ),
  (
    'data-engineer',
    'Data Engineer',
    'Design reliable data infrastructure and ETL workflows.',
    '["Python", "SQL", "PostgreSQL", "Docker", "System Design"]'::jsonb,
    '{"currency": "USD", "range": "105000-180000", "display": "$105K-$180K"}'::jsonb,
    'High'
  ),
  (
    'ai-product-engineer',
    'AI Product Engineer',
    'Integrate LLM and ML features into production-grade products.',
    '["Python", "Machine Learning", "Node.js", "REST APIs", "System Design"]'::jsonb,
    '{"currency": "USD", "range": "120000-210000", "display": "$120K-$210K"}'::jsonb,
    'Very High'
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  required_skills = EXCLUDED.required_skills,
  salary_band = EXCLUDED.salary_band,
  growth_outlook = EXCLUDED.growth_outlook,
  updated_at = NOW();
