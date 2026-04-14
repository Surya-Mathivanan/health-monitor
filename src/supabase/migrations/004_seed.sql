-- LifeCare Wellness - 004_seed.sql
-- Seed data for Wellness Programs

INSERT INTO public.wellness_programs (name, description, target_metrics) VALUES
  ('Weight Loss',
   'A structured program focused on healthy, sustainable fat loss through nutrition coaching and exercise guidance.',
   '{"target_bmi": 22, "target_body_fat": 20, "weekly_calls": 2}'),
  ('Muscle Gain',
   'Designed to build lean muscle mass through progressive resistance training protocols and protein-rich nutrition plans.',
   '{"target_muscle_mass": 35, "target_body_fat": 15, "weekly_calls": 2}'),
  ('Detox & Reset',
   'A 30-day cleanse program targeting visceral fat reduction, liver health, and gut microbiome restoration.',
   '{"target_visceral": 7, "target_bmi": 23, "weekly_calls": 3}'),
  ('Stress & Wellness',
   'Holistic mind-body program addressing chronic stress, sleep quality, and overall metabolic health markers.',
   '{"target_bmr": 1600, "target_body_age_delta": 0, "weekly_calls": 1}'),
  ('Diabetes Management',
   'Specialized monitoring and coaching for clients managing Type 2 diabetes through lifestyle modification.',
   '{"target_bmi": 24, "target_body_fat": 22, "weekly_calls": 2}'),
  ('Post-Natal Recovery',
   'Safe, guided recovery program for new mothers focusing on core rehabilitation and healthy weight management.',
   '{"target_muscle_mass": 28, "weekly_calls": 1}')
ON CONFLICT DO NOTHING;
