import React, { useState } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Tag, Mail, Clock, ArrowRight } from 'lucide-react';
import { blogPosts, BlogPost } from '@/data/blogPosts';
import { toast } from '@/hooks/use-toast';

const BlogSidebarCTA = () => {
  const { openWizard } = useWizard();
  return (
    <Button size="sm" className="w-full gap-1.5 font-semibold" onClick={() => openWizard()}>
      Find a PadosiAgent <ArrowRight className="h-3.5 w-3.5" />
    </Button>
  );
};

interface BlogSidebarProps {
  currentPostId: number;
  currentCategory: string;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({ currentPostId, currentCategory }) => {
  const [email, setEmail] = useState('');

  // Popular articles — featured first, then first from each category
  const popularArticles = React.useMemo(() => {
    const featured = blogPosts.filter(p => p.featured && p.id !== currentPostId);
    const categories = [...new Set(blogPosts.map(p => p.category))];
    const fromCategories = categories
      .map(cat => blogPosts.find(p => p.category === cat && p.id !== currentPostId && !featured.some(f => f.id === p.id)))
      .filter(Boolean) as BlogPost[];
    return [...featured, ...fromCategories].slice(0, 5);
  }, [currentPostId]);

  // Category cloud with counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    blogPosts.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers' as any)
        .insert([{ email: email.trim(), source: 'blog_sidebar' }] as any);
      if (error) {
        if (error.code === '23505') {
          toast({ title: '📧 Already subscribed!', description: 'This email is already on our list.' });
        } else {
          throw error;
        }
      } else {
        toast({ title: '✅ Subscribed!', description: 'You\'ll receive our latest insurance insights.' });
      }
      setEmail('');
    } catch {
      toast({ title: '❌ Error', description: 'Could not subscribe. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      {/* Newsletter Signup */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Insurance Insights</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Get expert insurance tips & guides delivered to your inbox weekly.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-sm"
            />
            <Button type="submit" size="sm" className="w-full gap-1.5 font-semibold" disabled={isSubmitting}>
              {isSubmitting ? 'Subscribing...' : 'Subscribe'} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Popular Articles */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Popular Articles</h3>
          </div>
          <ul className="space-y-3.5">
            {popularArticles.map((post, i) => (
              <li key={post.id}>
                <Link
                  to={`/blog/${post.id}`}
                  className="group flex items-start gap-3"
                >
                  <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{post.readTime}
                    </p>
                  </div>
                </Link>
                {i < popularArticles.length - 1 && <Separator className="mt-3" />}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Category Cloud */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryCounts.map(([category, count]) => (
              <Link key={category} to={`/blog?category=${encodeURIComponent(category)}`}>
                <Badge
                  variant={category === currentCategory ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                >
                  {category} ({count})
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/15">
        <CardContent className="p-5 text-center">
          <h3 className="font-bold text-foreground mb-2">Need Insurance Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect with a verified agent near you for free guidance.
          </p>
          <BlogSidebarCTA />
        </CardContent>
      </Card>
    </aside>
  );
};

export default BlogSidebar;
