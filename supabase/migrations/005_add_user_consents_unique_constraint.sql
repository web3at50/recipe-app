-- Add unique constraint to user_consents to enable proper upsert
-- This ensures each user can only have one consent record per consent_type
ALTER TABLE user_consents
ADD CONSTRAINT user_consents_user_consent_unique
UNIQUE (user_id, consent_type);
