import Stripe from "stripe";

// Test Stripe Connect workflow
async function testStripeConnect() {
  console.log("🧪 Testing Stripe Connect Workflow...\n");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY not found in environment");
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });

  try {
    // Test 1: Verify Stripe connection
    console.log("1️⃣ Verifying Stripe API connection...");
    const account = await stripe.accounts.retrieve();
    console.log("✅ Connected to Stripe account:", account.id);
    console.log("   Business name:", account.business_profile?.name || "Not set");
    console.log("   Country:", account.country);

    // Test 2: Check if we can create Express accounts
    console.log("\n2️⃣ Testing Express Connect account creation...");
    const testAccount = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: "test-professional@example.com",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      business_profile: {
        name: "Test Professional Services",
        product_description: "Construction and renovation services"
      }
    });
    console.log("✅ Test Express account created:", testAccount.id);

    // Test 3: Generate onboarding link
    console.log("\n3️⃣ Generating onboarding link...");
    const accountLink = await stripe.accountLinks.create({
      account: testAccount.id,
      refresh_url: "https://yourapp.replit.app/professional-portal",
      return_url: "https://yourapp.replit.app/professional-portal",
      type: "account_onboarding",
    });
    console.log("✅ Onboarding link generated:");
    console.log("   URL:", accountLink.url);

    // Test 4: Test payment intent with application fee
    console.log("\n4️⃣ Testing payment with platform fee...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000, // $100.00
      currency: "usd",
      application_fee_amount: 500, // $5.00 platform fee (5%)
      transfer_data: {
        destination: testAccount.id,
      },
      metadata: {
        project_id: "test-project",
        conversation_id: "test-conversation",
        professional_id: "test-professional",
      }
    });
    console.log("✅ Payment intent created:");
    console.log("   Amount: $", paymentIntent.amount / 100);
    console.log("   Platform fee: $", paymentIntent.application_fee_amount / 100);
    console.log("   Status:", paymentIntent.status);

    // Test 5: Verify we can retrieve the account
    console.log("\n5️⃣ Verifying account retrieval...");
    const retrievedAccount = await stripe.accounts.retrieve(testAccount.id);
    console.log("✅ Account retrieved successfully");
    console.log("   Charges enabled:", retrievedAccount.charges_enabled);
    console.log("   Payouts enabled:", retrievedAccount.payouts_enabled);
    console.log("   Details submitted:", retrievedAccount.details_submitted);

    // Clean up: Delete test account
    console.log("\n6️⃣ Cleaning up test account...");
    await stripe.accounts.del(testAccount.id);
    console.log("✅ Test account deleted");

    console.log("\n🎉 All Stripe Connect tests passed successfully!");
    console.log("\n📋 Summary:");
    console.log("   ✓ Stripe API connection working");
    console.log("   ✓ Express account creation working");
    console.log("   ✓ Onboarding link generation working");
    console.log("   ✓ Payment with platform fee working");
    console.log("   ✓ Account management working");

  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    if (error.type === 'StripePermissionError') {
      console.error("\n⚠️  Permission Error: Your Stripe account may not have Connect enabled.");
      console.error("   Visit https://dashboard.stripe.com/settings/applications to enable Connect.");
    } else if (error.type === 'StripeAuthenticationError') {
      console.error("\n⚠️  Authentication Error: Check your STRIPE_SECRET_KEY.");
    }
    process.exit(1);
  }

  process.exit(0);
}

// Run the test
testStripeConnect();