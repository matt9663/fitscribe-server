BEGIN;

TRUNCATE
  fitscribe_exercises,
  fitscribe_weeks,
  fitscribe_workouts,
  fitscribe_users
  RESTART IDENTITY CASCADE;

INSERT INTO fitscribe_users (user_name, password, email_address)
VALUES
  ('test-user1','$2a$12$FSu6aNuL4G0e/e/GbDb5VOVJ1cTWpPAmEZfkwTHm4MRpybM390NXu','matt9663@gmail.com'),
  ('test-user2', '$2a$12$EebLwEhZboX1D91mGFRVuuWAFSyuVhiMxD9ypqh3dIZEZFFL0xJmq', 'fake-email@gmail.com');

INSERT INTO fitscribe_workouts (title, author_id, exercises)
VALUES
  ('Basic Chest Workout', 1, '[{ "liftName": "Barbell bench press", "weight": 155, "reps": 8, "sets": 4, "order": 1 },
      { "liftName": "Cable chest flys", "weight": 20, "reps": 15, "sets": 4, "order": 2 },
      { "liftName": "Incline dumbell bench press", "weight": 55, "reps": 10, "sets": 3, "order": 3 },
      { "liftName": "Push-ups", "weight": "Bodyweight", "reps": 20, "sets": 3, "order": 4 },
      { "liftName": "Tricep cable pushdown", "weight": 75, "reps": 10, "sets": 4, "order": 5 }]'),
  ('Leg Day', 1, '[{ "liftName": "Barbell back squat", "weight": 225, "reps": 5, "sets": 5, "order": 1 },
      { "liftName": "Deadlift", "weight": 235, "reps": 5, "sets": 4, "order": 2 },
      { "liftName": "Leg Press Machine", "weight": 360, "reps": 10, "sets": 3, "order": 3 },
      { "liftName": "Leg Extensions", "weight": 180, "reps": 10, "sets": 3, "order": 4 },
      { "liftName": "Leg Curls", "weight": 75, "reps": 10, "sets": 4, "order": 5 }]'),
  ('Lat-focused Back workout', 2, '[{ "liftName": "Pull-ups", "weight": "Bodyweight", "reps": 12, "sets": 3, "order": 1 },
      { "liftName": "Lat pulldowns", "weight": 130, "reps": 10, "sets": 4, "order": 2 },
      { "liftName": "Bent-over Row", "weight": 115, "reps": 12, "sets": 3, "order": 3 },
      { "liftName": "One-arm dumbell row", "weight": 50, "reps": 10, "sets": 3, "order": 4 },
      { "liftName": "Dumbell Bicep Curls", "weight": 25, "reps": 12, "sets": 4, "order": 5 }]');

  INSERT INTO fitscribe_exercises (liftName, muscle_group)
  VALUES
      ('Barbell bench press', 'Chest'),
      ('Cable chest flys', 'Chest'),
      ('Pull-ups', 'Back'),
      ('Incline dumbell bench press', 'Chest'),
      ('Push-ups', 'Chest'),
      ('Tricep cable pushdown', 'Arms'),
      ('Barbell back squat', 'Quads'),
      ('Deadlift', 'Hamstrings'),
      ('Leg Press Machine', 'Quads'),
      ('Leg Extensions', 'Quads'),
      ('Leg Curls', 'Hamstrings'),
      ('Leg Raises', 'Abs'),
      ('Standing Calf Raises', 'Calves'),
      ('Standing Overhead Press', 'Shoulders'),
      ('Lateral Dumbell Raises', 'Shoulders'),
      ('Bent-over Barbell Row', 'Back'),
      ('Lat Pulldowns', 'Back'),
      ('Hammer Curls', 'Arms'),
      ('Crunches', 'Abs');

COMMIT;