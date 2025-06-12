'use client'

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { toast } from "@/app/hooks/use-toast";
import { Loader2, CreditCard, X } from 'lucide-react';

// Load Stripe (make sure to use your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentMethodUpdateProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CardForm: React.FC<{ onSuccess: () => void; onClose: () => void }> = ({ onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create setup intent when component mounts
    const createSetupIntent = async () => {
      try {
        const response = await fetch('/api/stripe/setup-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        if (data.success) {
          setClientSecret(data.clientSecret);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error || "Failed to initialize payment method setup"
          });
        }
      } catch (error) {
        console.error('Error creating setup intent:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize payment method setup"
        });
      }
    };

    createSetupIntent();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsLoading(false);
      return;
    }

    try {
      // Confirm the setup intent
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      } else if (setupIntent.payment_method) {
        // Update the default payment method
        const response = await fetch('/api/stripe/update-payment-method', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethodId: setupIntent.payment_method as string })
        });

        const data = await response.json();
        if (data.success) {
          toast({
            variant: "default",
            title: "Success",
            description: "Payment method updated successfully"
          });
          onSuccess();
          onClose();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error || "Failed to update payment method"
          });
        }
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment method"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#888888',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ff6b6b',
        iconColor: '#ff6b6b'
      }
    },
    hidePostalCode: false
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#FFFFFF05] border border-[#FFFFFF14] rounded-md p-4">
        <label className="block text-sm font-medium text-[#E2E2E2] mb-2">
          Card Information
        </label>
        <div className="bg-[#FFFFFF08] border border-[#FFFFFF20] rounded-md p-3">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          sx={{
            color: '#AEB0B9',
            border: '1px solid #FFFFFF26',
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#FFFFFF14',
              border: '1px solid #FFFFFF40'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          sx={{
            background: 'linear-gradient(to bottom, #FAFAFA, #DFDFDF)',
            color: '#000000',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              opacity: 0.9
            },
            '&:disabled': {
              opacity: 0.5
            }
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Updating...
            </>
          ) : (
            'Update Payment Method'
          )}
        </Button>
      </div>
    </form>
  );
};

const PaymentMethodUpdate: React.FC<PaymentMethodUpdateProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#ffffff',
        colorBackground: '#020202',
        colorText: '#ffffff',
        colorDanger: '#ff6b6b',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px'
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#020202',
          border: '1px solid #FFFFFF1F',
          borderRadius: '20px',
          color: 'white',
          minWidth: '500px'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        fontSize: '18px',
        fontWeight: 600,
        pb: 2
      }}>
        <div className="flex items-center gap-2">
          <CreditCard className="text-white" size={24} />
          Update Payment Method
        </div>
        <button
          onClick={onClose}
          className="text-[#AEB0B9] hover:text-white transition-colors p-2"
        >
          <X size={15} />
        </button>
      </DialogTitle>
      
      <DialogContent sx={{ color: '#AEB0B9', paddingBottom: 3 }}>
        <div className="mb-4 text-sm">
          Add a new payment method for your subscription. Your current payment method will be replaced.
        </div>
        
        <Elements stripe={stripePromise} options={elementsOptions}>
          <CardForm onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodUpdate; 