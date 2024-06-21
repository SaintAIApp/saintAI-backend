import stripe from "../config/stripe";
import AppError from "../utils/AppError";
import { ObjectId } from "mongoose";
import Stripe from "stripe";
import StripeDetails from "../models/stripeDetails";
import PaymentDetails from "../models/paymentDetails";

class PaymentServices {
    async onPayment(sig: string | string[], body: any) {
        let event;
        // console.log("body: ", body);
        // console.log("sig: ", sig);
        // console.log("web secert: ", process.env.STRIPE_WEB_SECRET);
        try {
            event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEB_SECRET as string);
        } catch (err: any) {
            console.log(err.message);
            throw new AppError(500, "Error occured during payment") 
        }
        console.log(event)
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
                const numberOfDays = 30;

                const validDate = new Date(Date.now() + (numberOfDays * 24 * 60 * 60 * 1000))
                
                const plan = session?.metadata.plan;

                const paymentDetails = await PaymentDetails.create({
                    userId: session?.metadata?.userId,
                    plan: plan,
                    validUntil: validDate,
                    paymentMode: "STRIPE"
                });

                await paymentDetails.save();

                const stripeDetails = await StripeDetails.create({
                    userId: session?.metadata?.userId,
                    customerId: session?.customer,
                    subscriptionId: session?.subscription,
                });

                await stripeDetails.save();

                break;
            case "invoice.payment_succeeded": 
                const invoice = event.data.object as Stripe.Invoice;

                const subscriptionDetails = invoice.subscription_details;
                console.log(subscriptionDetails?.metadata);

                const newPaymentDetails = await PaymentDetails.findOne({userId: subscriptionDetails?.metadata?.userId}); 

                if(newPaymentDetails) {
                    
                    newPaymentDetails.validUntil = new Date(Date.now()+(30 * 24 * 60 * 60 * 1000) );
                    await newPaymentDetails.save();
                }
                break;
            case "invoice.payment_failed":
                const failedInvoice = event.data.object as Stripe.Invoice;
                const failedSubscriptionDetails = failedInvoice.subscription_details;
                console.log(failedSubscriptionDetails?.metadata);

                const failedPaymentDetails = await PaymentDetails.findOne({userId: failedSubscriptionDetails?.metadata?.userId}); 

                if(failedPaymentDetails) {
                    failedPaymentDetails.validUntil = new Date(Date.now());
                    await failedPaymentDetails.save();
                }
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

    async cancelSubscription(userId: ObjectId) {
        const paymentDetails = await PaymentDetails.findOne({userId: userId});
        console.log(userId)
        if(!paymentDetails) {
            throw new AppError(500, "User Payment Details does not exist");
        }

        if(paymentDetails.paymentMode === "STRIPE") {
            const stripeDetails = await StripeDetails.findOne({userId: userId});

            if(!stripeDetails) {
                throw new AppError(500, "Error user stripe details does not exist");
            }

            await stripe.subscriptions.cancel(stripeDetails.subscriptionId);
        }

        paymentDetails.validUntil = new Date(Date.now());
        await paymentDetails.save();
    }
}

export default new PaymentServices();