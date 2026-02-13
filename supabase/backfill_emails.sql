-- Backfill script to populate missing emails in the public.profiles table
-- This is necessary because 'signInWithPassword' uses the profiles table to resolve username -> email.
-- Existing users created before the trigger update likely have NULL emails.

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id 
  AND p.email IS NULL;

-- Optional: Verify the fix
-- SELECT username, email FROM public.profiles WHERE username = 'valley';
