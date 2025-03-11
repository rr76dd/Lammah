-- Enable Row Level Security on all tables
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_processing ENABLE ROW LEVEL SECURITY;

-- Create policies for uploaded_files table
CREATE POLICY "Users can view their own files"
  ON uploaded_files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON uploaded_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
  ON uploaded_files
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON uploaded_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for quizzes table
CREATE POLICY "Users can view their own quizzes"
  ON quizzes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quizzes"
  ON quizzes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quizzes"
  ON quizzes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes"
  ON quizzes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for quiz_questions table
CREATE POLICY "Users can view quiz questions for their quizzes"
  ON quiz_questions
  FOR SELECT
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quiz questions for their quizzes"
  ON quiz_questions
  FOR INSERT
  WITH CHECK (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quiz questions for their quizzes"
  ON quiz_questions
  FOR UPDATE
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quiz questions for their quizzes"
  ON quiz_questions
  FOR DELETE
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

-- Create policies for flashcards table
CREATE POLICY "Users can view their own flashcards"
  ON flashcards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards"
  ON flashcards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards"
  ON flashcards
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards"
  ON flashcards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for summaries table
CREATE POLICY "Users can view their own summaries"
  ON summaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries"
  ON summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries"
  ON summaries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries"
  ON summaries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for folders table
CREATE POLICY "Users can view their own folders"
  ON folders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders"
  ON folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON folders
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON folders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for file_processing table
CREATE POLICY "Users can view their own file processing records"
  ON file_processing
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file processing records"
  ON file_processing
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file processing records"
  ON file_processing
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file processing records"
  ON file_processing
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a special policy for service role access (if needed)
-- This allows your server-side code with service role key to bypass RLS
CREATE POLICY "Service role has full access to all tables"
  ON uploaded_files FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to all tables"
  ON quizzes FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to all tables"
  ON quiz_questions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to all tables"
  ON flashcards FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to all tables"
  ON summaries FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to all tables"
  ON folders FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to all tables"
  ON file_processing FOR ALL USING (auth.jwt() ->> 'role' = 'service_role'); 