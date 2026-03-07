

## Competition Voting App — Implementation Plan

### Overview
A mobile-responsive competition voting web app with admin and user roles, using local/in-memory data storage (demo/prototype mode — no backend needed).

### Authentication (Simple Email Gate)
- Login page with email input field
- Hardcoded allowed emails checked on submit:
  - **Admin**: `admin@cey.lk` → redirects to Admin Dashboard
  - **Users**: `me@test.lk`, `we@won.lk`, `nisal@test.lk`, `frog@vb.lk` → redirects to User Dashboard
- Invalid email shows "Access Denied" error
- Session stored in localStorage so user stays logged in on refresh

### Admin Dashboard
- **Rounds Management**: Add, edit, delete rounds with name and status (Active/Closed)
- **Competitors Management**: Add, edit, delete competitors assigned to specific rounds
- **Results View**: Each round shows vote counts per competitor and 1st place winner highlighted
- Logout button

### User Dashboard
- **Rounds List**: Shows all rounds with name and status badges (Active/Closed)
- **Click a Round** → opens competitor list as cards
- **Vote Button** on each competitor card (disabled if round is Closed or user already voted)
- **Confirmation Dialog**: "Are you sure?" popup with Confirm/Cancel
- After voting: buttons disabled, success toast shown
- **Results visible** after voting: vote counts + leaderboard with 1st place highlighted
- Logout button

### Vote Protection
- One vote per user per round enforced in-memory state (persisted to localStorage)
- Once voted, all vote buttons for that round are permanently disabled for that user

### Data Storage (Demo Mode)
- All data (rounds, competitors, votes) stored in React state with localStorage persistence
- Pre-seeded with a couple of sample rounds and competitors for easy demo

### UI & Design
- Fully mobile-responsive using Tailwind CSS
- Clean card-based layout for competitors
- Status badges (green for Active, red for Closed)
- Leaderboard with ranking numbers and trophy icon for 1st place
- Pages: Login, Admin Dashboard, User Dashboard, Round Detail/Voting

