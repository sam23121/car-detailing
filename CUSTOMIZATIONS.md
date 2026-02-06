# Customizations & change log

This file documents one-off changes so you can redo or revert them later.

---

## 1. Reviews section commented out

**What was done:** The customer reviews block on the home page is currently **commented out**, so it does not show or load any data.

**Files to edit:**

- **`frontend/src/pages/Home.jsx`**
  - Uncomment the `Reviews` import at the top:
    - Change:  
      `// import Reviews from '../components/Reviews';  // Commented out – see CUSTOMIZATIONS.md`  
    - To:  
      `import Reviews from '../components/Reviews';`
  - Add back state and effect for reviews, and the loading check. Replace the current `Home` content with:

```jsx
import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ServicesOverview from '../components/ServicesOverview';
import Process from '../components/Process';
import ServiceCategories from '../components/ServiceCategories';
import DetailedServices from '../components/DetailedServices';
import About from '../components/About';
import Reviews from '../components/Reviews';
import Blog from '../components/Blog';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Home() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/api/reviews/verified?limit=10`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <main>
      <Hero />
      <ServicesOverview />
      <Process />
      <ServiceCategories />
      <DetailedServices />
      <About />
      <Reviews reviews={reviews} id="reviews" />
      <Blog id="blog" />
      <FAQ id="faq" />
      <Contact id="contact" />
    </main>
  );
}
```

  - In the same file, **remove** the comment block that wraps `<Reviews ... />` (the `{/* Reviews section commented out ... */}` and the commented `<Reviews />` line).

- **`frontend/src/components/Navbar.jsx`**
  - Uncomment the Reviews nav link so the Reviews anchor works again:
    - Change:  
      `{/* <li><a href="/#reviews">Reviews</a></li> */}`  
    - To:  
      `<li><a href="/#reviews">Reviews</a></li>`

**To leave reviews commented out:** Do nothing; the current code already has reviews disabled.

---

## 2. Booking system – how it works and how to fix issues

**What the booking flow does:**

1. User opens **Booking** (e.g. `/booking` or “Book Now”).
2. Frontend loads **packages** from the API:  
   `GET /api/services/` then, for each service, `GET /api/services/{id}/packages`.
3. User fills name, email, optional phone, **package**, **date/time**, optional notes.
4. On submit:
   - Frontend creates or reuses a **customer**: `POST /api/customers/` (body: name, email, phone).
   - Frontend creates a **booking**: `POST /api/bookings/` (body: `customer_id`, `package_id`, `scheduled_date`, `notes`).

**So the booking system “works” when:**

- Backend is running and reachable (e.g. `http://localhost:8000` or your `VITE_API_URL`).
- Database has **services** and at least one **package** per service you want to offer (otherwise the package dropdown is empty).

**If the package dropdown is empty:**

- Seed the database so each service has a package:
  - From the project root:  
    `cd backend`  
    `uv run python -m app.seed`
  - This seeds services and one package per service. Re-run is safe (it skips existing data).

**If you see “Failed to create booking” or validation errors:**

- Backend may return `detail` as a string or a list of error objects. The frontend in **`frontend/src/pages/BookingPage.jsx`** now turns that into a single error message. If you still see a raw object or array, check the browser Network tab for the API response and compare to the `setError(...)` logic in the `catch` block of `handleSubmit`.

**Useful checks:**

- Backend: `GET http://localhost:8000/api/services/` and `GET http://localhost:8000/api/services/1/packages` (use a real service `id`) return 200 and data.
- After submitting a booking, you can list bookings with `GET http://localhost:8000/api/bookings/` (or use the FastAPI docs at `http://localhost:8000/docs`).

---

## 2b. Where booking data goes and how the owner confirms

**Where the data goes:** When a customer submits a booking, the data is stored in your **PostgreSQL database** in two tables:

- **`customers`** – name, email, phone (one row per customer; repeat bookings reuse the same row by email).
- **`bookings`** – customer_id, package_id, scheduled_date, status (`pending` by default), notes.

So every accepted booking exists as rows in those tables. You can inspect them with any PostgreSQL client (e.g. `psql`, pgAdmin, or your IDE’s DB tool) by connecting to the same database as in `backend/.env` (`DATABASE_URL`).

**How the owner can confirm bookings:** An **owner bookings page** was added so you can view and confirm requests in the browser:

- **URL:** Open **`/admin/bookings`** (e.g. `http://localhost:3000/admin/bookings` when the frontend is running).
- **Link:** The footer has an **“Owner”** section with a link **“View & confirm bookings”** that goes to this page.

On that page you can:

- See all bookings (newest first) with customer name, email, phone, package, scheduled date/time, and status.
- **Confirm** a pending booking (sets status to `confirmed`) or **Cancel** it (sets status to `cancelled`).

**Files involved:**

- **Frontend:** `frontend/src/pages/AdminBookingsPage.jsx` – owner view and Confirm/Cancel actions.
- **Frontend:** `frontend/src/App.jsx` – route `/admin/bookings` added.
- **Frontend:** `frontend/src/components/Footer.jsx` – “Owner” / “View & confirm bookings” link added.
- **Backend:** `GET /api/bookings/with-details` returns bookings with customer and package info; `PUT /api/bookings/{id}` is used to update status when you confirm or cancel.

**To hide the owner link from the public:** Remove or comment out the “Owner” block in **`frontend/src/components/Footer.jsx`** (the `<div className="footer-section">` with “View & confirm bookings”). You can still open `/admin/bookings` by typing the URL; for real protection you’d add authentication later.

---

## 3. Seed script now includes packages

**What was done:** **`backend/app/seed.py`** was updated to create one **package** per service (name, description, price, duration) so the booking form has options in the “Package” dropdown.

**What you need to do:** After creating the DB and running the app at least once (so tables exist), run the seed from the backend directory:

```bash
cd backend
uv run python -m app.seed
```

If you already ran the old seed (services only), run it again; it will add packages for any service that doesn’t have one yet.

---

## 4. Booking page error message handling

**What was done:** In **`frontend/src/pages/BookingPage.jsx`**, the `catch` block of the submit handler was updated so that when the API returns validation errors (e.g. `detail` as an array of `{ msg, ... }`), the user sees a readable string instead of `[object Object]`.

**File:** `frontend/src/pages/BookingPage.jsx` — no action needed unless you want to change how errors are displayed.

---

*Last updated: see git history or file modification dates.*
