# Workflow: Vendor Inquiry Form

## Objective
Handle a vendor submitting the "Become a Vendor" inquiry form on DA SHOP.
Store the submission in the database. Show the vendor a confirmation message.

## Inputs Required
- business_name (string, required)
- contact_name (string, required)
- email (string, required)
- instagram_handle (string, optional)
- product_category (string, required — one of: Clothing, Jewelry, Food, Art, Accessories)

## Tools Used
- POST /vendor-inquiry (backend endpoint)
- vendor_inquiries table (SQLite via SQLAlchemy)

## Steps
1. User fills out form on /become-a-vendor page
2. Frontend validates: business_name, contact_name, email, product_category are all present
3. Frontend sends POST /vendor-inquiry with JSON payload
4. Backend validates with Pydantic schema (VendorInquiryCreate)
5. Backend writes row to vendor_inquiries table
6. Backend returns VendorInquiryResponse (201)
7. Frontend replaces form with confirmation message:
   "Thanks [contact_name]! We'll be in touch soon."

## Edge Cases
- If email is malformed: show inline field error before submitting
- If backend returns 500: show "Something went wrong — please try again" message
- Do not disable the form on submission — allow resubmit if needed

## Expected Output
- New row in vendor_inquiries with all fields + created_at timestamp
- User sees confirmation on screen
