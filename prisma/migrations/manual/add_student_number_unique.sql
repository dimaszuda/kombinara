-- Add unique constraint on student_number if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_student_number_key'
  ) THEN
    ALTER TABLE students ADD CONSTRAINT students_student_number_key UNIQUE (student_number);
  END IF;
END $$;
