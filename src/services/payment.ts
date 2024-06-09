import stripe from "../config/stripe";
import AppError from "../utils/AppError";
import { ObjectId } from "mongoose";
import Stripe from "stripe";
import StripeDetails from "../models/stripeDetails";

class PaymentServices {
    async onPayment(sig: string | string[], body: any) {
        let event;

        console.log("body: ", body);
        console.log("sig: ", sig);
        // console.log("web secert: ", process.env.STRIPE_WEB_SECRET);
        try {
            event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEB_SECRET as string);
        } catch (err: any) {
            console.log(err.message);
            throw new AppError(500, "Error occured during payment") 
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = await stripe.checkout.sessions.retrieve(
                    event.data.object.id,
                    {
                        expand: ['line_items']
                    }
                );
                const customerId = session?.customer;

                if(customerId === null || !session?.metadata?.userId) {
                    throw new AppError(500, "Error customer not found");
                }

                const validDate = new Date(Date.now() + 30)
                console.log(validDate);
                
                const plan = session?.metadata.plan
                console.log(plan);

                const stripeDetails = await StripeDetails.create({
                    userId: session?.metadata?.userId,
                    validUntil: validDate,
                    plan: plan,
                    customerId: session?.customer
                });

                await stripeDetails.save();

                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }

    async createCheckout(plan: string, userId: ObjectId, customerId: string | undefined): Promise<string | null> {
        const priceId = plan === "pro" ? process.env.STRIPR_PRODUCT_ID_PRO : process.env.STRIPR_PRODUCT_ID_PRO_PLUS;

        let sessionOptions: Stripe.Checkout.SessionCreateParams = {
            mode: "subscription",
            line_items: [
              {
                price: priceId,
                quantity: 1,
              },
            ],
            success_url: `${process.env.CLIENT_URL}/payment/success`,
            cancel_url: `${process.env.CLIENT_URL}/payment/failed`,
            metadata: {
                userId: userId.toString(),
                plan: plan
            }
        }

        if(customerId) {
            sessionOptions.customer = customerId;
        }
        
        try {
            const session = await stripe.checkout.sessions.create(sessionOptions);
            console.log(session);
            return session.url;
        } catch (e: any) {
            console.log(e.message);
            throw new AppError(500, "Error while creating checkout session");
        }
    }
}

export default new PaymentServices();