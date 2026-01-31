import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();
app.use(cors()); // 👈 this line enables CORS for every request
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe needs the raw body to validate signatures
app.use(bodyParser.raw({ type: "application/json" }));

app.post("/stripe-webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Validate that the webhook really came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️  Signature verification failed:", err.message);
    return res.sendStatus(400);
  }

  // Called every time a checkout is completed successfully
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details.email;
    console.log("✅ Payment confirmed for:", email);
    // Later we’ll store or flag the email as premium
  }

  res.sendStatus(200);
});

// Simple test route so the extension or you can check Premium status
app.get("/isPremium", (req, res) => {
  const email = req.query.email;
  // temporary example until a database or sheet is connected
  const premiumEmails = ["test@example.com"]; // later replace with real buyer emails
  const isPro = premiumEmails.includes(email);
  res.json({ email, premium: isPro });
});


app.listen(3000, () => console.log("Webhook running on port 3000"));

