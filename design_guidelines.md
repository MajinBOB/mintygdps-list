# Design Guidelines: Geometry Dash Demonlist Management System

## Design Approach
**Hybrid Approach**: Combine Discord's energetic gaming aesthetic with Linear's clean admin efficiency, infused with Geometry Dash's signature neon geometric style.

**Core Philosophy**: High-energy public interface with streamlined, efficient admin tools. Balance visual excitement (public demonlist) with functional clarity (admin panel).

---

## Typography

**Primary Font**: "Inter" (Google Fonts) - Clean, modern, excellent readability
**Accent Font**: "Space Grotesk" (Google Fonts) - Geometric, edgy for headings and CTAs

**Hierarchy**:
- Hero/Page Titles: 3xl to 5xl, bold (700), Space Grotesk
- Section Headers: 2xl to 3xl, semibold (600), Space Grotesk  
- Card Titles/Demon Names: lg to xl, semibold (600), Inter
- Body Text: base, regular (400), Inter
- Metadata/Stats: sm, medium (500), Inter
- Labels/Tags: xs to sm, medium (500), uppercase tracking-wide, Inter

---

## Layout System

**Spacing Scale**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm

**Container Strategy**:
- Full-width sections: w-full with inner max-w-7xl mx-auto px-6
- Admin panels: max-w-6xl with generous padding
- Content grids: gap-6 to gap-8
- Card padding: p-6 to p-8

---

## Component Library

### Navigation
**Public Nav**: Sticky header with logo left, main links center (Home, Demonlist, Leaderboard, Submit), login/profile right. Dark background with subtle geometric pattern overlay.

**Admin Nav**: Sidebar layout - collapsed by default on mobile, expanded on desktop. Sections: Dashboard, Demons, Submissions, Users, Settings. Active state with left border accent.

### Hero Section (Public Homepage)
Large hero with dynamic geometric background image suggesting Geometry Dash's visual style. Centered content with:
- Bold headline: "The Ultimate Geometry Dash Demonlist"
- Subheadline explaining the community ranking system
- Dual CTAs: "View Demonlist" (primary) and "Submit Record" (secondary with blurred background)
- Live stats ticker below: Total Demons, Verified Records, Active Players

### Demonlist Display
**List View**: Table-like cards with:
- Rank badge (prominent, geometric shape)
- Demon thumbnail/icon placeholder
- Demon name (bold, large)
- Creator name (subtle)
- Difficulty tier (color-coded badge)
- Points value
- Completion count
- Quick actions (admin only)

**Grid Option**: 3-column grid (lg:grid-cols-3 md:grid-cols-2) for visual browsing

### Record Submission Cards (Admin Panel)
Compact cards in grid showing:
- Player name and avatar placeholder
- Demon attempted
- Video link preview
- Submission date
- Status badge (Pending/Approved/Rejected)
- Quick action buttons: Approve/Reject/View Details

### Leaderboard
**Player Rankings**: Clean table with alternating subtle row backgrounds:
- Position number (bold, larger for top 3)
- Player avatar and name
- Total points (prominent)
- Demons completed
- Recent activity indicator
- Profile link

**Top 3 Podium**: Featured section above table with larger cards for positions 1-3, trophy icons, celebratory treatment

### Admin Dashboard
**Stats Grid**: 4-column layout (lg:grid-cols-4 md:grid-cols-2) with metric cards showing:
- Total demons
- Pending submissions
- Active users
- Records this week
Each card: Large number, label, trend indicator, icon

**Recent Activity Feed**: Timeline-style list of recent verifications, submissions, updates

### Forms
**Submission Form**: Single-column, generous spacing
- Input fields with labels above
- Required indicators
- Helpful placeholder text
- Character counters where relevant
- Large submit button at bottom

**Admin Edit Forms**: Two-column layout for efficiency (form left, preview right)

### Buttons
**Primary**: Solid background, medium roundedness (rounded-lg), semibold text, generous padding (px-6 py-3)
**Secondary**: Outlined with border, same sizing
**Danger**: For delete/reject actions
**Icon Buttons**: Square or circular for compact actions

### Cards
**Standard**: Rounded corners (rounded-xl), subtle shadow, padding p-6
**Hover State**: Subtle lift and shadow increase
**Interactive Cards**: Clickable entire card with cursor pointer

---

## Images

### Hero Image
Large background image featuring geometric patterns, angular shapes, and dynamic lines reminiscent of Geometry Dash levels. Abstract, high-energy composition with depth. Image should span full viewport width, positioned behind content with overlay gradient for text readability.

### Demon Thumbnails
Placeholder slots for demon level screenshots/icons throughout lists and cards. Use 16:9 aspect ratio containers with object-fit cover.

### Player Avatars
Circular placeholders (40px-64px) for user profiles in leaderboards and submissions.

---

## Page-Specific Layouts

### Public Demonlist Page
- Hero with filters (difficulty, completed status)
- Demonlist grid/table (primary content, fills viewport naturally)
- Pagination at bottom
- Section padding: py-16 desktop, py-8 mobile

### Admin Dashboard
- Header with breadcrumb and user menu
- Stats grid immediately below
- Two-column layout: Recent activity (2/3 width) + Quick actions sidebar (1/3 width)
- Consistent section spacing: py-12

### Leaderboard Page
- Compact hero with podium for top 3
- Full leaderboard table below
- Filter/search bar sticky below header
- Natural content flow, no forced viewport heights

---

**Animation Note**: Minimal, purposeful animations only - subtle hover states on cards, smooth transitions for navigation. Avoid distracting motion that detracts from information density.