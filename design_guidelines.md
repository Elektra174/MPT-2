# Design Guidelines: МПТ Therapy Scripts Application

## Design Approach
**System-Based with Custom Refinements**: This is a professional therapy tool requiring clarity, consistency, and efficient information architecture. The design prioritizes readability, easy navigation, and quick access to therapeutic content.

## Core Design Principles
- **Clinical Professionalism**: Clean, focused interface that doesn't distract from therapeutic content
- **Information Density**: Support extensive script content while maintaining readability
- **Quick Access**: Minimal clicks to reach any script or resource
- **Trust & Reliability**: Stable, predictable UI patterns for professional use

## Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif (system fonts for reliability)
- **Headings**: Bold weight, high contrast for hierarchy
- **Body Text**: line-height: 1.6 for optimal readability of therapeutic scripts
- **Emoji Icons**: Used throughout navigation for visual identification (🎯, 💭, 🔄, etc.)

## Color Palette
- **Background**: #f5f7fa (light neutral workspace)
- **Sidebar**: #2c3e50 (dark professional blue-gray)
- **Content Cards**: White with subtle shadows
- **Accent Colors**:
  - Primary Actions: #3498db (blue)
  - Success/Positive: #27ae60 (green)
  - Warning/Attention: #e67e22 (orange)
  - Caution/Expert: #e74c3c (red)

## Layout System
**Desktop (>1024px)**:
- Fixed sidebar: 320px width
- Main content: Remaining width (flex-grow)
- No viewport-forced heights - natural content flow

**Tablet (768px-1024px)**:
- Collapsible sidebar with hamburger trigger
- Full-width content when sidebar hidden

**Mobile (<768px)**:
- Full-screen overlay menu navigation
- Single-column content stacking

**Spacing Units**: Use Tailwind's default scale - primarily p-4, p-6, p-8, m-4, gap-4, gap-6

## Component Library

### Sidebar Navigation
- Dark background (#2c3e50) with white/light text
- Collapsible category groups with chevron indicators
- Active section highlighting (lighter background or accent border)
- Emoji icons preceding each menu item
- Smooth expand/collapse transitions

### Script Content Cards
- White background with box-shadow for depth
- Generous padding (p-6 to p-8)
- Breadcrumb navigation at top
- Difficulty badges with color coding (🟢 Green/🟡 Yellow/🔴 Red)

### Special Content Blocks
Four distinct block types with visual differentiation:
- **Question Blocks**: Styled for therapist questions (subtle background, perhaps light blue tint)
- **Instruction Blocks**: Client instructions (distinct border or background color)
- **Note Blocks**: Important annotations (warning/info styling with icon)
- **Script Step Blocks**: Numbered or bulleted progression markers

### Navigation Buttons
- Primary buttons: Blue (#3498db) for main actions
- Secondary buttons: Outlined or ghost style
- Navigation between scripts: Prev/Next arrows
- Quick access: "Return to Diagnostics", "Go to Practices", "Complete Session"

### Session Tools
- **Timer Widget**: Visible, non-intrusive session duration tracker
- **History Stack**: Recent viewed scripts (dropdown or sidebar section)
- **Print Button**: Clear icon button for script printing
- **Copy Button**: Extract questions to clipboard

## Implementation Practices Section
Separate dedicated area with:
- Grid layout for practice cards (2-3 columns on desktop)
- Each practice: title, description, icon/emoji
- "Quick Switcher", "Analytical Switcher", "Power Dance", "Action Verification"

## Session Completion Section
Checklist-style progressive layout:
1. Summary block
2. Homework assignments
3. Ecological verification
4. Next session scheduling
5. Gratitude/closing ritual

Each step clearly numbered with completion indicators

## Responsive Behavior
- **Desktop**: Two-column layout (sidebar + content), fixed sidebar navigation
- **Tablet**: Hamburger menu, full-width content, overlay sidebar
- **Mobile**: Stack all content vertically, bottom navigation alternatives

## No Hero Images
This is a professional therapeutic tool - no marketing hero sections. Interface opens directly to last viewed content or default dashboard/category overview.

## Visual Hierarchy
- Clear section separations with whitespace
- Consistent card-based content presentation
- Bold category headers in sidebar
- Subdued but readable body text
- Color-coded difficulty and category badges

## Interaction Patterns
- Hover states on sidebar items (subtle background lightening)
- Click feedback with brief transition animations
- Smooth content loading (fade-in for dynamic content)
- LocalStorage preservation of state (no jarring resets on reload)

**Result**: A professional, focused therapeutic reference tool that therapists can rely on during sessions - clean, efficient, and comprehensive.