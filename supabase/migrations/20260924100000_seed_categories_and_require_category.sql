-- The categories of the reference index (reference/vanilla-deck-manager), in its order.
insert into public.categories (name, group_name, position) values
  ('Capabilities', 'Portfolio', 1),
  ('Craft', 'Portfolio', 2),
  ('Special Decks', 'Portfolio', 3),
  ('Brand''s Works', 'Portfolio', 4),
  ('Propuestas Comerciales', 'Propuestas para Clientes', 5),
  ('Propuestas Creativas', 'Propuestas para Clientes', 6),
  ('Reels', null, 7);

-- Every entry belongs to exactly one category, as in the reference. This fails if any
-- entry has no category yet; assign one before applying.
alter table public.entries alter column category_id set not null;
