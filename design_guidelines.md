# ST Fashions E-Commerce Design Guidelines

## Design Approach
**Reference-Based**: Indian fashion e-commerce platform inspired by Myntra's elegant UI patterns, adapted for ST Fashions branding with vibrant color personality.

## Brand Identity
- **Business Name**: ST Fashions (Sannidhi & Tanisha Fashions)
- **Logo**: Stylized "ST" mark with tagline placement
- **Aesthetic**: Modern Indian fashion e-commerce with bold, feminine energy
- **Color Palette**:
  - Primary: Hot Pink/Magenta (#E91E63) - CTAs, active states, highlights
  - Secondary: Gold/Yellow (#FFC107) - accents, badges, special offers
  - Accent: Purple (#9C27B0) - hover states, secondary elements
  - Neutrals: White backgrounds, charcoal gray (#333) for text, light gray (#F5F5F5) for cards

## Typography System
- **Display/Headings**: Playfair Display (Google Fonts) - elegant serif for brand presence
  - H1: 48px/56px, semibold
  - H2: 36px/44px, semibold
  - H3: 28px/36px, medium
- **Body/UI**: Inter (Google Fonts) - clean sans-serif for readability
  - Body: 16px/24px, regular
  - Small: 14px/20px, regular
  - Button text: 16px, medium
  - Labels: 14px, medium

## Layout System
**Spacing Scale**: Use Tailwind units 2, 4, 6, 8, 12, 16, 20 (p-2, m-4, gap-6, etc.)
- Consistent padding: py-16 for sections, py-8 for cards
- Gap system: gap-6 for grids, gap-4 for form elements

## Customer Interface Components

### Homepage
**Hero Section** (80vh):
- Large hero image showcasing saree collection with overlaid content
- Centered content with logo, tagline "Sannidhi & Tanisha Fashions"
- Primary CTA button "Shop Collection" with blurred background
- Secondary text highlighting categories

**Category Grid** (4 columns desktop, 2 mobile):
- Card design with category image, overlay gradient
- Category name in Playfair Display
- Hover: subtle scale effect, magenta border glow

**Featured Products Section**:
- Product cards in 4-column grid (responsive to 2/1)
- Card: product image, product name, price in gold, quick "Add to Cart" icon button
- Hover: lift shadow effect, show size/color preview dots

**Brand Story Section**:
- Single column, max-w-4xl centered
- Highlight contact information, Instagram handle with icon
- Location details with map icon

### Navigation
**Header** (sticky):
- Logo left, category nav center, icons right (search, cart with badge, user)
- Search bar expands on click
- Cart badge shows item count in hot pink circle
- Categories: Sarees | Aari Work Blouses | Ready Made Blouses | Ladies Fancy | Stationery

**Footer**:
- 4-column layout: About ST Fashions, Quick Links, Contact Info (phone, email, Instagram), Address
- Social media icons in brand colors
- Newsletter signup with gold accent button

### Product Pages
**Product Grid**:
- 4-column responsive grid with filters sidebar (left)
- Filter options: Category, Price range, Size, Color with checkboxes
- Sort dropdown (top right): Price Low-High, New Arrivals, Popular

**Product Detail Page**:
- Left: Image gallery with main large image + thumbnail row below (4 thumbnails)
- Click for lightbox zoom with navigation arrows
- Right: Product info panel
  - Product name (H2, Playfair)
  - Price (large, gold color)
  - Size selector: pill-style buttons, active state in magenta
  - Color swatches: circular color dots with border on selection
  - Quantity: - [number] + buttons
  - "Add to Cart" button (full width, magenta, white text)
  - Product description in expandable accordion
  - Size chart link, delivery info

### Shopping Cart
**Cart Sidebar** (or dedicated page):
- Product list items with thumbnail, name, size/color tags, quantity controls, remove icon
- Subtotal calculation with itemized view
- "Proceed to Checkout" button (sticky bottom on mobile)
- Empty cart state with "Continue Shopping" CTA

### Checkout Page
**Two-column layout** (form left, order summary right):
- Form sections with clear labels
- Input styling: rounded borders, focus state with magenta outline
- Phone validation indicator (green checkmark for 10 digits)
- PIN code validation (6 digits)
- Date picker for DOB (DD/MM/YYYY format displayed)
- Address textarea with character counter
- "Place Order" button (large, magenta)

### Authentication
**Login/Signup Cards**:
- Centered card (max-w-md) on gradient background
- Logo at top
- Input fields with icons (phone, password)
- Toggle between login/signup views
- Error messages in red below fields
- Success state with purple checkmark

## Admin Interface Components

### Admin Login
- Minimal centered card with ST logo
- Username/password fields
- "Change Password" link after first login
- Different color scheme: professional blue-gray accents

### Admin Dashboard
**Stats Cards** (3-column grid):
- Total Products, Recent Orders, Revenue cards
- Icons with gradient backgrounds
- Large numbers with descriptive labels

**Recent Activity Feed**:
- Timeline view of recent orders with status badges
- Quick actions: View Order, Update Status

### Product Management
**Add/Edit Product Form**:
- Multi-step or single scrolling form
- Category dropdown with icons
- Rich text editor for description
- Image upload area: drag-drop zone with preview thumbnails
- Size checkboxes (XS to Free Size) in grid
- Color input with add/remove dynamic fields
- Stock quantity with number input
- Save button (magenta) + Preview button (outline)

**Products Table**:
- Data table with sortable columns: Image, Name, Category, Price, Stock, Actions
- Action icons: Edit (pencil), Delete (trash) with confirmation modal
- Bulk actions: Select multiple, update category/status

### Order Management
**Orders Table**:
- Columns: Order ID, Customer, Products, Total, Status, Date, Actions
- Status badge color-coded: Pending (yellow), Confirmed (blue), Packed (purple), Shipped (orange), Delivered (green)
- Status dropdown in-line editing
- Expandable row for full order details
- Filter by status, date range, search customer

## Images
- **Homepage Hero**: Vibrant image of saree collection display, traditional yet modern aesthetic
- **Category Cards**: Lifestyle shots of each product category (draped sarees, blouse close-ups, accessory arrangements)
- **Product Images**: Clean white background product photography with multiple angles
- **Admin Dashboard**: Icon illustrations for stats cards (product box, order clipboard, chart icons)

## Interactive Patterns
- **Product Image Zoom**: Click to open lightbox overlay with navigation, close button, zoom controls
- **Cart Badge Animation**: Bounce effect when items added
- **Form Validation**: Real-time validation with color-coded feedback (green checkmark, red error text)
- **Loading States**: Magenta spinner for async operations
- **Toast Notifications**: Top-right corner for success/error messages with auto-dismiss
- **Modals**: Confirmation dialogs for delete actions, image lightbox

## Responsive Behavior
- **Desktop**: Full multi-column layouts, sidebar filters visible
- **Tablet**: 2-column grids, collapsible filter drawer
- **Mobile**: Single column, bottom navigation bar, hamburger menu for categories, sticky "Add to Cart" button on product pages