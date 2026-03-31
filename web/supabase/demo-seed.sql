BEGIN;

-- Reset the shared demo dataset in dependency order so the script is rerunnable.
DELETE FROM votes;
DELETE FROM telegram_polls;
DELETE FROM poll_options;
DELETE FROM polls;
DELETE FROM telegram_messages;
DELETE FROM broadcasts;
DELETE FROM houses;
DELETE FROM categories;

INSERT INTO categories (id, name, color, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Announcements', '#f59e0b', timezone('utc', now()) - interval '14 days'),
  ('00000000-0000-0000-0000-000000000102', 'Events', '#0ea5e9', timezone('utc', now()) - interval '14 days'),
  ('00000000-0000-0000-0000-000000000103', 'Welfare', '#22c55e', timezone('utc', now()) - interval '14 days'),
  ('00000000-0000-0000-0000-000000000104', 'Elections', '#3b82f6', timezone('utc', now()) - interval '14 days'),
  ('00000000-0000-0000-0000-000000000105', 'Urgent', '#ef4444', timezone('utc', now()) - interval '14 days'),
  ('00000000-0000-0000-0000-000000000106', 'Community', '#a855f7', timezone('utc', now()) - interval '14 days');

INSERT INTO houses (chat_id, title, status, created_at)
VALUES
  (-1009100000001, 'Beacon House Alpha', 'active', timezone('utc', now()) - interval '12 days'),
  (-1009100000002, 'Beacon House Birch', 'active', timezone('utc', now()) - interval '12 days'),
  (-1009100000003, 'Beacon House Cedar', 'active', timezone('utc', now()) - interval '12 days'),
  (-1009100000004, 'Beacon House Dune', 'active', timezone('utc', now()) - interval '11 days'),
  (-1009100000005, 'Beacon House Ember', 'active', timezone('utc', now()) - interval '11 days'),
  (-1009100000006, 'Beacon House Fern', 'active', timezone('utc', now()) - interval '11 days');

INSERT INTO broadcasts (id, category_id, content, media_url, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101',
    'Monthly committee digest: venue bookings, welfare support windows, and the next townhall agenda are now live in one place for house reps.',
    NULL,
    timezone('utc', now()) - interval '13 days'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000103',
    'Welfare Pack collection opens tomorrow from 10:00 AM to 4:00 PM at the MPH foyer. Bring your matric card and collect for your block if you registered on the form.',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000106',
    'Orientation volunteer sign-ups are open. We are looking for station leads, welfare runners, emcees, and logistics support across the welcome weekend.',
    NULL,
    timezone('utc', now()) - interval '10 days'
  ),
  (
    '00000000-0000-0000-0000-000000000204',
    '00000000-0000-0000-0000-000000000105',
    'Heavy rain protocol is active for tonight''s house-run route. Switch to the indoor foyer handover point and use the updated collection windows shared in the tracker.',
    NULL,
    timezone('utc', now()) - interval '8 days'
  ),
  (
    '00000000-0000-0000-0000-000000000205',
    '00000000-0000-0000-0000-000000000104',
    'House committee nominations close this Friday at 6:00 PM. Please encourage interested residents to submit a short pitch and preferred portfolio before the deadline.',
    NULL,
    timezone('utc', now()) - interval '7 days'
  ),
  (
    '00000000-0000-0000-0000-000000000206',
    '00000000-0000-0000-0000-000000000103',
    'The Quiet Study Lounge and supper station will run from Sunday to Thursday during revision week, with coffee, fruit, and charging points available until 11:30 PM.',
    NULL,
    timezone('utc', now()) - interval '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000207',
    '00000000-0000-0000-0000-000000000102',
    'Interest Check: Which evening slot works best for the Inter-House Networking Session next Friday?',
    NULL,
    timezone('utc', now()) - interval '4 days'
  ),
  (
    '00000000-0000-0000-0000-000000000208',
    '00000000-0000-0000-0000-000000000106',
    'Townhall planning: what format would help your house participate most actively this month?',
    NULL,
    timezone('utc', now()) - interval '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000000209',
    '00000000-0000-0000-0000-000000000104',
    'Election season: which timing works best for the candidate Q&A stream next week?',
    NULL,
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000210',
    '00000000-0000-0000-0000-000000000103',
    'Exam support check-in: which welfare booster should we prioritize for the coming week?',
    NULL,
    timezone('utc', now()) - interval '1 day'
  );

INSERT INTO telegram_messages (broadcast_id, chat_id, message_id)
SELECT
  broadcast_id,
  chat_id,
  1000 + row_number() OVER (ORDER BY broadcast_id, chat_id) AS message_id
FROM (
  SELECT id AS broadcast_id
  FROM broadcasts
  WHERE id IN (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000204',
    '00000000-0000-0000-0000-000000000205',
    '00000000-0000-0000-0000-000000000206'
  )
) announcements
CROSS JOIN (
  SELECT chat_id FROM houses
) house_list;

INSERT INTO polls (id, broadcast_id, question, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000207',
    'Interest Check: Which evening slot works best for the Inter-House Networking Session next Friday?',
    timezone('utc', now()) - interval '4 days' + interval '10 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000208',
    'Townhall planning: what format would help your house participate most actively this month?',
    timezone('utc', now()) - interval '3 days' + interval '10 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    '00000000-0000-0000-0000-000000000209',
    'Election season: which timing works best for the candidate Q&A stream next week?',
    timezone('utc', now()) - interval '2 days' + interval '10 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000304',
    '00000000-0000-0000-0000-000000000210',
    'Exam support check-in: which welfare booster should we prioritize for the coming week?',
    timezone('utc', now()) - interval '1 day' + interval '10 minutes'
  );

INSERT INTO poll_options (poll_id, option_index, text)
VALUES
  ('00000000-0000-0000-0000-000000000301', 0, '6:00 PM - 7:15 PM'),
  ('00000000-0000-0000-0000-000000000301', 1, '7:30 PM - 8:45 PM'),
  ('00000000-0000-0000-0000-000000000301', 2, 'Saturday afternoon'),
  ('00000000-0000-0000-0000-000000000302', 0, 'In-person townhall with open mic'),
  ('00000000-0000-0000-0000-000000000302', 1, 'Hybrid townhall with live Q&A'),
  ('00000000-0000-0000-0000-000000000302', 2, 'Telegram-first async update with follow-up booths'),
  ('00000000-0000-0000-0000-000000000303', 0, 'Tuesday 7:00 PM'),
  ('00000000-0000-0000-0000-000000000303', 1, 'Wednesday 8:00 PM'),
  ('00000000-0000-0000-0000-000000000303', 2, 'Thursday 6:30 PM'),
  ('00000000-0000-0000-0000-000000000304', 0, 'Late-night snack drop'),
  ('00000000-0000-0000-0000-000000000304', 1, 'Portable charger loaners'),
  ('00000000-0000-0000-0000-000000000304', 2, 'Peer study sprint tables');

INSERT INTO telegram_polls (telegram_poll_id, master_poll_id, chat_id, message_id)
SELECT
  'demo-' || right(master_poll_id::text, 4) || '-house-' || row_number() OVER (PARTITION BY master_poll_id ORDER BY chat_id),
  master_poll_id,
  chat_id,
  2000 + row_number() OVER (ORDER BY master_poll_id, chat_id)
FROM (
  SELECT id AS master_poll_id FROM polls
) poll_list
CROSS JOIN (
  SELECT chat_id FROM houses
) house_list;

WITH networking_votes AS (
  SELECT
    (910000 + voter_index)::bigint AS user_id,
    ((voter_index - 1) % 6) + 1 AS house_slot,
    CASE
      WHEN voter_index <= 14 THEN 0
      WHEN voter_index <= 32 THEN 1
      ELSE 2
    END AS option_index,
    timezone('utc', now()) - interval '4 days' + make_interval(mins => voter_index) AS created_at
  FROM generate_series(1, 44) AS voter_index
)
INSERT INTO votes (telegram_poll_id, user_id, option_index, created_at)
SELECT tp.telegram_poll_id, nv.user_id, nv.option_index, nv.created_at
FROM networking_votes nv
JOIN (
  SELECT
    telegram_poll_id,
    row_number() OVER (ORDER BY chat_id) AS house_slot
  FROM telegram_polls
  WHERE master_poll_id = '00000000-0000-0000-0000-000000000301'
) tp ON tp.house_slot = nv.house_slot;

WITH townhall_votes AS (
  SELECT
    (910000 + voter_index)::bigint AS user_id,
    ((voter_index - 45) % 6) + 1 AS house_slot,
    CASE
      WHEN voter_index <= 54 THEN 0
      WHEN voter_index <= 65 THEN 1
      ELSE 2
    END AS option_index,
    timezone('utc', now()) - interval '3 days' + make_interval(mins => voter_index) AS created_at
  FROM generate_series(45, 80) AS voter_index
)
INSERT INTO votes (telegram_poll_id, user_id, option_index, created_at)
SELECT tp.telegram_poll_id, tv.user_id, tv.option_index, tv.created_at
FROM townhall_votes tv
JOIN (
  SELECT
    telegram_poll_id,
    row_number() OVER (ORDER BY chat_id) AS house_slot
  FROM telegram_polls
  WHERE master_poll_id = '00000000-0000-0000-0000-000000000302'
) tp ON tp.house_slot = tv.house_slot;

WITH qa_vote_pool AS (
  SELECT
    user_id,
    row_number() OVER (ORDER BY user_id) AS seq
  FROM (
    SELECT (910000 + voter_index)::bigint AS user_id FROM generate_series(81, 96) AS voter_index
    UNION ALL
    SELECT (910000 + voter_index)::bigint AS user_id FROM generate_series(1, 16) AS voter_index
  ) source
),
qa_votes AS (
  SELECT
    user_id,
    ((seq - 1) % 6) + 1 AS house_slot,
    CASE
      WHEN seq <= 9 THEN 0
      WHEN seq <= 23 THEN 1
      ELSE 2
    END AS option_index,
    timezone('utc', now()) - interval '2 days' + make_interval(mins => seq) AS created_at
  FROM qa_vote_pool
)
INSERT INTO votes (telegram_poll_id, user_id, option_index, created_at)
SELECT tp.telegram_poll_id, qv.user_id, qv.option_index, qv.created_at
FROM qa_votes qv
JOIN (
  SELECT
    telegram_poll_id,
    row_number() OVER (ORDER BY chat_id) AS house_slot
  FROM telegram_polls
  WHERE master_poll_id = '00000000-0000-0000-0000-000000000303'
) tp ON tp.house_slot = qv.house_slot;

WITH welfare_booster_votes AS (
  SELECT
    (910000 + voter_index)::bigint AS user_id,
    ((voter_index - 17) % 6) + 1 AS house_slot,
    CASE
      WHEN voter_index <= 29 THEN 0
      WHEN voter_index <= 37 THEN 1
      ELSE 2
    END AS option_index,
    timezone('utc', now()) - interval '1 day' + make_interval(mins => voter_index) AS created_at
  FROM generate_series(17, 44) AS voter_index
)
INSERT INTO votes (telegram_poll_id, user_id, option_index, created_at)
SELECT tp.telegram_poll_id, wbv.user_id, wbv.option_index, wbv.created_at
FROM welfare_booster_votes wbv
JOIN (
  SELECT
    telegram_poll_id,
    row_number() OVER (ORDER BY chat_id) AS house_slot
  FROM telegram_polls
  WHERE master_poll_id = '00000000-0000-0000-0000-000000000304'
) tp ON tp.house_slot = wbv.house_slot;

COMMIT;
