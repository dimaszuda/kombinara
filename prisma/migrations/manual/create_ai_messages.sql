-- Create ai_messages table untuk menyimpan percakapan siswa dengan AI di Panel Chatbot
CREATE TABLE IF NOT EXISTS ai_messages (
    message_id      SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk lookup by student
CREATE INDEX IF NOT EXISTS idx_ai_messages_student ON ai_messages(student_id);

-- Index untuk lookup by conversation (mengelompokkan sesi percakapan)
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);

-- Composite index untuk query umum: ambil semua pesan dalam satu percakapan siswa
CREATE INDEX IF NOT EXISTS idx_ai_messages_student_conversation ON ai_messages(student_id, conversation_id);
