# End-to-end community chat

## What will change
- Turn the existing donor, NGO, and orphanage chat into a reliable shared conversation experience while keeping its four role-based rooms and request/donate/help message types.
- Deliver each message only to accounts eligible for its selected room, with notifications sent from the same saved message rows.
- Make the newest history visible, show participant names and roles, render the sender's message immediately, and refresh both sides reliably.
- Improve the conversation screen with clear room selection, connection/empty states, and a dependable message composer on desktop and mobile.

## Technical details
- Keep the current authenticated `send_chat_message` RPC and persisted `messages` table; update its function through a Lovable Cloud migration, without adding tables or weakening role checks.
- Update chat history loading, profile-name lookup, realtime/poll refresh, and the existing chat UI; add focused tests for room access and fan-out eligibility.
- Verify by checking tests and preview diagnostics, then exercise the signed-in chat view and message send flow where available.
