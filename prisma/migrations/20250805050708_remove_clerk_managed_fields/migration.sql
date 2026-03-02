/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- Only run if the table exists (this migration may be ordered before init on shadow DB)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
    DROP INDEX IF EXISTS "public"."User_email_key";
    DROP INDEX IF EXISTS "public"."User_id_key";
    ALTER TABLE "public"."User" DROP COLUMN IF EXISTS "email";
    ALTER TABLE "public"."User" DROP COLUMN IF EXISTS "name";
  END IF;
END $$;
