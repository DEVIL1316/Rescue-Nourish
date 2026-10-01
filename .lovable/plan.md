# Mobile OTP Login + Role Notifications

## What users will see
1. **Welcome page**: pick a role first (Donor, NGO, Orphanage Member, Admin), as today.
2. **Phone login**: enter mobile number (+91 prefilled) and tap "Send OTP". Enter the 6-digit code to sign in. Then pick a language, as today.
3. **Notifications** (bell + Notifications page update live):
   - A new chat message notifies the person or role group it was sent to.
   - A new food donation notifies every Orphanage Member, NGO and Admin. The notification has an "Accept" button that claims the donation for that person.
   - The donor gets a notification when someone accepts.
4. **Sign out** clears the real login.

## Requirement from you
Text messages must be sent through an SMS provider (e.g. Twilio). You add the provider details once in Cloud → Users → Auth Settings → Phone. Until you do, OTP codes cannot be sent.

## Technical details
- Turn on phone sign-in. Login.tsx step 2: `signInWithOtp({ phone, options: { data: { role_type } } })`, then `verifyOtp({ phone, token, type: 'sms' })`.
- `handle_new_user` trigger already reads `role_type` into `user_roles`. Use `user_roles` (from the database) as the source of truth for role. Keep localStorage only as a cache.
- RoleGuard checks the real session from `useAuth` plus the role. QR login and Sessions get a role preset that leads into OTP login.
- Migration: SECURITY DEFINER triggers
  - `notify_new_donation` (AFTER INSERT on donations): adds rows in `notifications` (type `donation`, related_id = donation id) for users with role ngo, orphanage_member or admin.
  - `notify_new_message` (AFTER INSERT on messages): adds a notification for receiver_id.
  - `notify_donation_accepted` (AFTER UPDATE of recipient_id): notifies the donor.
- New RPC `accept_donation(_id)`: sets recipient_id/recipient_name/status='claimed' only when the donation is still available, with role check.
- Enable realtime on `notifications`. A global listener in DonationLayout shows a toast and the unread badge.
- Notifications page: "Accept" button for `donation` type, which calls the RPC.
