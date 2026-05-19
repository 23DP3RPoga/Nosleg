-- Vitalo: drop Laravel infrastructure tables this app does not use.
-- Run in phpMyAdmin / MySQL client on your Vitalo database.
--
-- KEEP `migrations` — Laravel uses it when you run: php artisan migrate
-- KEEP all app tables: users, password_reset_tokens, personal_access_tokens,
--   measurements, health_documents, document_shares, share_comments,
--   medication_reminders, doctor_appointments, doctors, user_doctors

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `cache_locks`;
DROP TABLE IF EXISTS `cache`;
DROP TABLE IF EXISTS `job_batches`;
DROP TABLE IF EXISTS `failed_jobs`;
DROP TABLE IF EXISTS `jobs`;

SET FOREIGN_KEY_CHECKS = 1;
