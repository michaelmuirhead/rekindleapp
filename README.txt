REKINDLE STUDENTS DASHBOARD
Version 1.0 - Compressed Single-File React App

FILE: rekindle-dashboard.jsx
SIZE: 36,335 characters (under 55k limit)

FEATURES INCLUDED:
✓ Home - Dashboard overview with stats & upcoming events
✓ Calendar - 30-day event calendar view (by week)
✓ Students - Student list with search, engagement scores, timeline modal
✓ Events - Event management with inline attendance tracking
✓ Lessons - Lesson planning with series grouping and resources
✓ Follow-Up - Follow-up management with welcome sequence automation
✓ Prayer - Prayer request tracking (active/answered)
✓ Budget - Income/expense tracking with running totals
✓ Reports - Attendance stats and student growth metrics
✓ Messages - Simple inbox with unread tracking
✓ Data - Export/Import JSON, reset to defaults

DATA MODEL:
- In-memory state (useState) - no localStorage
- Complete DEF object with 5 sample students + 4 default events
- All required fields per specification

UI COMPONENTS (Reusable):
- M (Modal)      - Dialog for forms/details
- Fl (Field Label) - Form field wrapper
- Ip (Input)     - Text input field
- Ta (TextArea)  - Multi-line text input
- Sl (Select)    - Dropdown selector
- Bt (Button)    - Styled button (primary/danger/secondary)
- Bg (Badge)     - Status badge
- Sc (StatCard)  - Metric display card

UTILITY FUNCTIONS:
- gi() - Generate unique ID
- fd() - Format full date (Mar 21, 2026)
- fs() - Format short date (Mar 21)
- td() - Today's date ISO
- ad() - Add N days to date
- es() - Engagement score calculation

STYLING:
- Tailwind CSS (core utilities only)
- Orange-500 accent color
- Gray-900 sidebar with white cards
- Responsive grid layouts

NAVIGATION:
- Left sidebar with flame logo
- Grouped nav (Main, People, Admin)
- Badge counts on Messages & Follow-Up
- Current page header with date

COMPRESSION TECHNIQUES APPLIED:
✓ Removed all whitespace/comments
✓ Single-letter variable names in functions
✓ Used React.createElement for JSX rendering
✓ Simplified pages (removed volunteer, slips, packing, prep, serving)
✓ Minimal Tailwind classes (essentials only)
✓ Inline styles for dynamic values
✓ Aggressive code density

USAGE:
1. Save as rekindle-dashboard.jsx
2. Import React & lucide-react in your build
3. Use Tailwind CSS for styling
4. Render: <App />

All features work with in-memory state management.
JSON export/import for data backup.
