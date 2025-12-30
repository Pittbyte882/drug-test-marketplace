# Drug Testing Marketplace

A comprehensive marketplace platform for drug testing companies to list their services and allow users to search, select, and purchase tests online.

## Features

- **Location-Based Search**: Users can search for testing locations by city, state, or ZIP code
- **Test Catalog**: Browse drug tests, DNA tests, background checks, and occupational health services
- **Shopping Cart**: Add multiple tests to cart and checkout with Stripe
- **Admin Dashboard**: Manage testing locations, test types, and pricing
- **Email Notifications**: Automated order confirmations with testing location details
- **Mobile Responsive**: Fully responsive design matching the HealthStreet aesthetic

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)
- Stripe account (for payments)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Database
   DATABASE_URL=your_supabase_connection_string
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # Optional: Email service
   RESEND_API_KEY=your_resend_api_key
   ```

4. Set up the database:
   - Connect Supabase from the v0 integrations panel
   - Run the SQL scripts in the `scripts` folder in order:
     - `001-create-tables.sql`
     - `002-seed-test-types.sql`

5. Run the development server:
   ```bash
   npm run dev
   ```

## Database Schema

### Companies
Stores testing location information including:
- Name, address, city, state, ZIP code
- Phone number
- Walk-in acceptance and appointment requirements

### Test Types
Categorized test offerings:
- Drug tests (urine, hair, panel tests)
- DNA tests (paternity, sibling, etc.)
- Background checks
- Occupational health services

### Company Tests
Junction table linking companies with available tests and pricing

### Orders & Order Items
Track customer purchases and order history

## Admin Dashboard

Access the admin dashboard at `/admin` to:
- Add and manage testing locations
- Add custom test types
- Set pricing for tests at each location

## Payment Flow

1. User searches for locations
2. Selects tests and adds to cart
3. Proceeds to checkout
4. Enters customer information
5. Completes payment via Stripe
6. Receives email confirmation with testing location details

## Email Notifications

After successful payment, customers receive:
- Order confirmation with order ID
- Testing location details (address, phone)
- Walk-in vs appointment information
- Next steps for scheduling

## Future Enhancements

- Interactive map view with markers
- Real-time appointment scheduling
- User accounts and order history
- SMS notifications
- Multi-language support

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Email**: Resend (or SendGrid/SES)

## License

Proprietary - All rights reserved
