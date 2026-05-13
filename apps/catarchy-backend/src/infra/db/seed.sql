-- ── Consensus (world-wide game parameters) ────────────────────────────────────
INSERT OR IGNORE INTO consensus (key, value, value_type, name, purpose) VALUES
  ('CAT.COOLDOWN_HOUR_BETWEEN_CARE',  '1',  'NUMBER', 'Care cooldown',     'Minimum cooldown time (in hours) between caring for your cat'),
  ('CAT.GROWTH_PER_CARE',     '1',  'NUMBER', 'Growth stat gained per care', 'Growth stat gained when caring for your cat'),
  ('CAT.EMOTION_PER_CARE',    '5',  'NUMBER', 'Emotion stat gained per care', 'Emotion stat gained when caring for your cat'),
  ('CAT.EMOTION_DECREASE',    '10', 'NUMBER', 'Emotion decrease per cycle', 'Emotion stat lost per cycle when you do not care for your cat'),
  ('CAT.EMOTION_DECREASE_FREQUENCY_HOUR', '12', 'NUMBER', 'Emotion decrease frequency (hours)', 'How often (in hours) emotion decreases if cat was not cared for'),
  ('CAT.MAX_GROWTH',          '100', 'NUMBER', 'Maximum growth stat', 'Maximum growth stat your cat can have')
;
