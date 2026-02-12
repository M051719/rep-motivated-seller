import React from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface PayPalCheckoutProps {
  amount: number;
  description: string;
  currency?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  description,
  currency = "USD",
  onSuccess,
  onError,
  onCancel,
}) => {
  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency,
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                },
                description,
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            if (!actions.order) {
              throw new Error("PayPal order actions unavailable.");
            }

            const order = await actions.order.capture();
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              await supabase.from("paypal_transactions").insert({
                user_id: user.id,
                order_id: order.id,
                payer_id: order.payer?.payer_id,
                amount,
                status: order.status,
                details: order,
              });
            }

            toast.success("Payment successful!");
            onSuccess?.(order);
          } catch (error) {
            console.error("PayPal payment error:", error);
            toast.error("Payment processing failed");
            onError?.(error);
          }
        }}
        onCancel={() => {
          toast("Payment cancelled");
          onCancel?.();
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
          toast.error("PayPal error occurred");
          onError?.(err);
        }}
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalCheckout;
