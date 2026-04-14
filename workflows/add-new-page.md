# Workflow: Add a New Page

## Objective
Add a new route and page to DA SHOP without breaking existing pages or routing.

## Inputs Required
- Page name (e.g. "Cart", "About")
- Route path (e.g. /cart, /about)
- Whether the page needs a backend endpoint

## Steps

### 1. Backend (if needed)
- Create route file in `backend/routers/[feature].py`
- Create model in `backend/models/[feature].py`
- Create schema in `backend/schemas/[feature].py`
- Register router in `backend/main.py`
- Test endpoint with curl or browser before touching frontend

### 2. Frontend
- Create page file at `frontend/src/pages/[PageName].jsx`
- Add route to `frontend/src/App.jsx` inside the Router
- Add nav link to `frontend/src/components/Navbar.jsx` if needed
- Follow existing design system:
  - Dark sections: bg-midnight, text-white, gold accents
  - Light sections: bg-sand, text-midnight
  - Buttons: btn-gold or btn-outline-gold classes
  - Cards: rounded-none (flat edge) or rounded-lg, shadow-md

### 3. Verify
- Run dev server and test the new route manually
- Check mobile layout (resize browser to 375px width)
- Confirm Navbar and Footer render correctly on the page

## Constraints
- Never build frontend for an endpoint that doesn't exist yet
- Match existing code style — no new patterns without discussion
- Mobile responsive is non-negotiable
