# DA SHOP — Launch Checklist

## Environment Variables

### Backend (Railway / .env)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Prod | PostgreSQL URL (Railway auto-injects). SQLite used in dev. |
| `SECRET_KEY` | ✅ | JWT signing secret — generate with `openssl rand -hex 32` |
| `FRONTEND_ORIGIN` | ✅ | Full frontend URL e.g. `https://dashopf-production.up.railway.app` |
| `STRIPE_SECRET_KEY` | ✅ Prod | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ Prod | Stripe webhook signing secret (`whsec_...`) — see Stripe setup below |
| `RESEND_API_KEY` | ✅ Prod | Resend API key for transactional email |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio account SID for SMS notifications |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth token |
| `TWILIO_FROM_NUMBER` | Optional | Twilio phone number e.g. `+64...` |
| `ANTHROPIC_API_KEY` | Optional | Claude API key for AI chat assistant |
| `FROM_EMAIL` | Optional | Sender email e.g. `DA SHOP <hello@dashop.co.nz>` |
| `SHOP_URL` | Optional | Frontend URL used in email links (defaults to `https://dashop.co.nz`) |

### Frontend (Railway / .env)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend URL e.g. `https://dashopb-production.up.railway.app` |
| `VITE_STRIPE_PK` | ✅ Prod | Stripe publishable key (`pk_live_...` or `pk_test_...`) |

---

## Stripe Setup

1. Go to Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://dashopb-production.up.railway.app/payments/webhook`
3. Events to listen for:
   - `payment_intent.succeeded`
   - `charge.refunded`
4. Copy the signing secret (`whsec_...`) → set as `STRIPE_WEBHOOK_SECRET`
5. Test the webhook using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:8000/payments/webhook
   stripe trigger payment_intent.succeeded
   ```

---

## DNS Setup

| Record | Type | Value |
|---|---|---|
| `dashop.co.nz` | CNAME | Railway frontend domain |
| `api.dashop.co.nz` | CNAME | Railway backend domain |
| `www.dashop.co.nz` | CNAME | Railway frontend domain |

After DNS is live, update:
- `FRONTEND_ORIGIN=https://dashop.co.nz`
- `VITE_API_URL=https://api.dashop.co.nz`
- `SHOP_URL=https://dashop.co.nz`
- Stripe webhook endpoint URL

---

## Pre-Launch QA Checklist

### Backend
- [ ] `GET /health` returns `{"status": "ok"}`
- [ ] `GET /brands` returns active brands
- [ ] `GET /products` returns active products
- [ ] Admin account created (`POST /auth/register` with `is_admin=true` or direct DB insert)
- [ ] All DB migrations ran (check `orders.payment_intent_id`, `notification_logs`, `chat_logs` tables exist)

### Stripe
- [ ] Test checkout with Stripe test card `4242 4242 4242 4242`
- [ ] Confirm order status becomes `confirmed` after payment
- [ ] Confirm order confirmation email sends
- [ ] Confirm webhook receives `payment_intent.succeeded` and updates order
- [ ] Test declined card `4000 0000 0000 9995` — confirm 402 error shown to user

### Email / SMS
- [ ] Order confirmation email arrives after test order
- [ ] Check `notification_logs` table: rows with `status="sent"` and `provider_id` populated
- [ ] Test with `RESEND_API_KEY` unset — confirm order still completes (graceful skip)

### Frontend Pages
- [ ] `/` — homepage loads, featured brand spotlight shows
- [ ] `/brands` — all brands visible
- [ ] `/brand/1` — hero, logo, collections tabs work
- [ ] `/product/:id` — size validation shake, add to cart works
- [ ] `/cart` — cart loads, quantities update
- [ ] `/checkout` — step 1 (shipping) → step 2 (Stripe payment) → order confirmation
- [ ] `/order-confirmation/:id` — order details visible
- [ ] `/profile` — order history visible
- [ ] `/terms`, `/privacy`, `/returns`, `/shipping` — all load
- [ ] `/become-a-vendor` — form submits successfully
- [ ] AI chat widget opens and responds

### Admin
- [ ] `/admin` — dashboard loads with orders and vendor inquiries
- [ ] Login with admin account confirms `is_admin` gating works

### SEO / Performance
- [ ] Check page titles are set (browser tab)
- [ ] Images have `alt` attributes
- [ ] No console errors on homepage, product page, checkout

---

## Post-Launch

- [ ] Set Stripe keys to `sk_live_...` / `pk_live_...`
- [ ] Monitor `notification_logs` for any `status="failed"` rows
- [ ] Monitor `chat_logs` for `hallucination_flag` rows
- [ ] Run `python3 diagnostic.py` against production
- [ ] Set up Railway health check alerting on `/health`
