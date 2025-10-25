# TODO: Add View Button and Update Book List

## Tasks
- [x] Update table headers in `public/dashboard.html`: Change "ISBN" to "Issue Year"
- [x] Modify `loadBooks()` in `public/scripts/dashboard.js`: Update row HTML to show publication_year instead of genre, add view button with eye icon
- [x] Add new modal HTML in `public/dashboard.html`: Create "view-book-modal" with fields for all book details (title, author, cover image, genre, ISBN, issue date/publication_year, description, book link, status, quantity, created/updated dates)
- [x] Update event listeners in `public/scripts/dashboard.js`: Add handler for view button to fetch book data, populate modal, and open it
- [x] Ensure modal closes properly and handles missing data (e.g., placeholder for cover image)
- [x] Test the view modal functionality
- [x] Verify table displays correctly with new columns
