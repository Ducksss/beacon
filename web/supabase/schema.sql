-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Houses (Telegram Groups)
CREATE TABLE houses (
  chat_id BIGINT PRIMARY KEY,            -- Telegram Chat ID
  title TEXT NOT NULL,                   -- Group Title
  status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'inactive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Broadcasts
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT,                          -- Text content
  media_url TEXT,                        -- Optional image URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Master Polls (Created by CSC)
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcast_id UUID REFERENCES broadcasts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Poll Options
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  option_index INTEGER NOT NULL          -- Corresponds to array index in Telegram
);

-- 5. Telegram Poll Instances (Maps Telegram's specific poll IDs to our Master Poll)
CREATE TABLE telegram_polls (
  telegram_poll_id TEXT PRIMARY KEY,
  master_poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  chat_id BIGINT REFERENCES houses(chat_id) ON DELETE CASCADE,
  message_id BIGINT NOT NULL             -- Message ID in the group
);

-- 6. Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_poll_id TEXT REFERENCES telegram_polls(telegram_poll_id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,               -- Telegram User ID
  option_index INTEGER NOT NULL,         -- Which option they voted for
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(telegram_poll_id, user_id)      -- Prevent double voting logs
);
