import Stripe from 'stripe';
import dotenv from 'dotenv'
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

export default stripe;