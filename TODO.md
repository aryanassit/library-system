# Notification Modal Changes

## 1. Bulk Import Notification ✅
- Modify `routes/books.js` in the `/import` endpoint to insert only one notification for bulk import instead of per book.

## 2. Limit Notifications to 50 ✅
- Update `routes/submissions.js` in the `/notifications` GET endpoint to LIMIT 50 instead of 10.

## 3. Add Notifications for New Activities ✅
- Modify `routes/books.js` POST / to ensure notification is inserted (already there).
- Modify `routes/users.js` POST / to insert notification for new user.
- Modify `routes/activities.js` POST / to insert notification for any activity.
- Modify `routes/submissions.js` POST /rating and /contact to insert notifications.

## 4. Red Dot on Notification Icon ✅
- Ensure `dashboard.js` calls `loadNotifications()` after adding activities, and `updateNotificationDot()` is called to show red dot when there are unread notifications.
