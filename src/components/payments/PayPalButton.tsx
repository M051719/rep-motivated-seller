import React, { useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface PayPalButtonProps {
  amount: number;
  description: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  description,
  onSuccess,
  onError,
  onCancel,
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    script.async = true;

    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        window.paypal
          .Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount.toFixed(2),
                    },
                    description: description,
                  },
                ],
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const order = await actions.order.capture();

                // Save transaction to database
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (user) {
                  await supabase.from("paypal_transactions").insert({
                    user_id: user.id,
                    order_id: order.id,
                    payer_id: order.payer?.payer_id,
                    amount: amount,
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
            },
            onCancel: (data: any) => {
              toast("Payment cancelled");
              onCancel?.();
            },
            onError: (err: any) => {
              console.error("PayPal error:", err);
              toast.error("PayPal error occurred");
              onError?.(err);
            },
            style: {
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal",
            },
          })
          .render(paypalRef.current);
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [amount, description, onSuccess, onError, onCancel]);

  return <div ref={paypalRef} />;
};

export default PayPalButton;
