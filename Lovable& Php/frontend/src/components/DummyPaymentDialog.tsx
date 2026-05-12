import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, CheckCircle2, Loader2 } from 'lucide-react';

interface DummyPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: 'starter' | 'professional';
}

const DummyPaymentDialog: React.FC<DummyPaymentDialogProps> = ({
  open,
  onClose,
  onSuccess,
  plan,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const planDetails = {
    starter: {
      name: "Starter's Plan",
      price: '₹589',
      originalPrice: '₹2,359',
    },
    professional: {
      name: "Professional's Plan",
      price: '₹2,359',
      originalPrice: '₹8,258',
    },
  };

  const details = planDetails[plan];

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setPaymentSuccess(true);

    // Wait a moment to show success message
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onSuccess();
  };

  const handleSkipPayment = () => {
    // For free trial - skip payment
    onSuccess();
  };

  if (paymentSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-accent/20 p-4">
              <CheckCircle2 className="h-12 w-12 text-accent" />
            </div>
            <DialogTitle className="text-xl">Payment Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your subscription has been activated. Redirecting to profile setup...
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Secure payment for your {details.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{details.name}</span>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                1st Year
              </Badge>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Amount</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{details.price}</span>
                <span className="text-sm text-muted-foreground line-through ml-2">
                  {details.originalPrice}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Inclusive of GST</p>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  maxLength={3}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>This is a demo payment. No real charges will be made.</span>
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${details.price}`
                )}
              </Button>

              {plan === 'starter' && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSkipPayment}
                >
                  Start Free Trial Instead
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DummyPaymentDialog;
