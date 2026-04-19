import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ReviewDialogProps {
  targetUserId: string;
  orderId?: string;
  productId?: string;
  roleContext: string;
  triggerText?: string;
  onSuccess?: () => void;
}

export function ReviewDialog({
  targetUserId,
  orderId,
  productId,
  roleContext,
  triggerText = "Leave a Review",
  onSuccess,
}: ReviewDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return toast.error("You must be logged in to review.");
    if (rating === 0) return toast.error("Please select a rating.");

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        reviewer_id: user.id,
        target_user_id: targetUserId,
        order_id: orderId || null,
        product_id: productId || null,
        role_context: roleContext,
        rating,
        comment,
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      setOpen(false);
      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to submit review. If table missing, see instructions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-sm font-medium">Rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    (hoverRating || rating) >= star
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Comments (Optional)</span>
            <Textarea
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
