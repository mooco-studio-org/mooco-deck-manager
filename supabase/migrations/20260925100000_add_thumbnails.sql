-- The path of the entry's thumbnail inside the `thumbnails` bucket, not a URL: the URL is
-- rebuilt from it, the same way Google Slides URLs are rebuilt from their ids.
alter table public.entries add column thumbnail_path text;

-- Public so cards can load thumbnails with a plain URL. Object names are random UUIDs, so
-- a thumbnail cannot be listed or guessed, only opened by whoever has its URL. Uploads go
-- through the server with the secret key; there are no write policies for other roles.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('thumbnails', 'thumbnails', true, 1048576, array['image/webp']);
