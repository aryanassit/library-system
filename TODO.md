# TODO: Implement Autofill for Contact Form Inputs on Click

## Tasks
- [x] Change event listener for name input from 'focus' to 'click' in app.js
- [x] Change event listener for email input from 'focus' to 'click' in app.js
- [x] Fix autofill logic to properly check login status using userEmail
- [ ] Test the autofill functionality to ensure it works when inputs are clicked and user is logged in
- [ ] Verify that inputs do not autofill if no user is logged in

## Notes
- Updated autofill to check for userEmail in localStorage as indicator of login status.
- Only fills if input is empty and user is logged in.
- Ensure the change matches the task requirement exactly.
