# Admin Dashboard Hierarchy Implementation

## Tasks
- [x] Update database schema to add soft delete columns
- [x] Modify routes/books.js for soft delete, restore, permanent delete
- [x] Modify routes/users.js for soft delete, restore, permanent delete
- [ ] Restructure sidebar HTML with hierarchical navigation
- [ ] Add content sections for recently removed books and users
- [ ] Add user profile modal
- [ ] Update CSS for sub-menu styling
- [ ] Update dashboard.js for new navigation and functionality
- [ ] Ensure quick actions only in dashboard section
- [ ] Test functionality

## Progress
- Database schema updated with is_deleted and deleted_at columns for books and users tables
- Routes updated for soft delete (default), permanent delete (?permanent=true), and restore functionality
- Started implementation
