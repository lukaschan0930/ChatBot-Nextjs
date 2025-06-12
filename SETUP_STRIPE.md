# Stripe Setup Instructions

To complete the custom payment method update feature, you need to add your Stripe publishable key to your environment variables.

## Step 1: Add to your `.env.local` file

Add this line to your `.env.local` file (create it if it doesn't exist):

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

## Step 2: Get your Stripe publishable key

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
3. Replace `pk_test_your_actual_publishable_key_here` with your actual key

## Step 3: Restart your development server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## Note

- The publishable key is safe to expose on the client-side
- It's used by Stripe Elements to securely collect payment information
- Make sure you're using the correct key for your environment (test vs production)

## Testing

Once configured, users will be able to:
1. Click "Change" next to their payment method
2. See a custom modal with Stripe Elements
3. Enter new card information securely
4. Update their payment method for future subscription charges 