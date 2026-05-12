import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, ShieldCheck, User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

interface WriteReviewFormProps {
  agentId: string;
  onReviewSubmitted: () => void;
}

const MAX_COMMENT_LENGTH = 500;

const guestReviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().trim().min(10, 'Review must be at least 10 characters').max(500),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
});

const WriteReviewForm: React.FC<WriteReviewFormProps> = ({ agentId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showContactFields, setShowContactFields] = useState(false);
  const { toast } = useToast();

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENT_LENGTH) {
      setComment(value);
      setValidationError(null);
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setValidationError('Please select a star rating');
      toast({ title: 'Rating Required', description: 'Please select a star rating before submitting.', variant: 'destructive' });
      return;
    }

    if (comment.trim().length < 10) {
      setValidationError('Review must be at least 10 characters');
      toast({ title: 'Review Too Short', description: 'Please write at least 10 characters for your review.', variant: 'destructive' });
      return;
    }

    setValidationError(null);
    setShowContactFields(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validationResult = guestReviewSchema.safeParse({
      rating,
      comment: comment.trim(),
      name: name.trim(),
      mobile,
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input';
      setValidationError(errorMessage);
      toast({ title: 'Validation Error', description: errorMessage, variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/submit-guest-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          agent_id: agentId,
          rating: validationResult.data.rating,
          comment: validationResult.data.comment,
          reviewer_name: validationResult.data.name,
          reviewer_mobile: validationResult.data.mobile,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Review submission failed');
      }

      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback. Your review will be published after verification.',
      });
      
      setRating(0);
      setComment('');
      setName('');
      setMobile('');
      setValidationError(null);
      setShowContactFields(false);
      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 bg-muted/30 p-6 rounded-lg border-2 border-dashed border-primary/20">
      {!showContactFields ? (
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <Label className="text-base font-semibold mb-3 block">Write a Review</Label>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground mr-2">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-secondary text-secondary'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-secondary">
                  {rating} {rating === 1 ? 'Star' : 'Stars'}
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm mb-2 block">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this agent (minimum 10 characters)..."
              value={comment}
              onChange={handleCommentChange}
              rows={4}
              className={`resize-none ${validationError ? 'border-destructive' : ''}`}
              maxLength={MAX_COMMENT_LENGTH}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${validationError ? 'text-destructive' : 'text-muted-foreground'}`}>
                {validationError || `Minimum 10 characters required`}
              </span>
              <span className={`text-xs ${comment.length >= MAX_COMMENT_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            Submit Review
          </Button>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">We Believe in Authentic Reviews</h4>
              <p className="text-sm text-muted-foreground mt-1">
                To maintain trust and transparency, we verify all reviews. Please provide your contact details - we may reach out to confirm your experience.
              </p>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating ? 'fill-secondary text-secondary' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{rating} Stars</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{comment}</p>
          </div>

          <div>
            <Label htmlFor="name" className="text-sm mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className={validationError?.includes('Name') ? 'border-destructive' : ''}
            />
          </div>

          <div>
            <Label htmlFor="mobile" className="text-sm mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={handleMobileChange}
              className={validationError?.includes('mobile') ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your number is kept private and used only for verification
            </p>
          </div>

          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowContactFields(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Verify & Submit Review'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WriteReviewForm;
