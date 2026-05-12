import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/data/blogPosts';

interface RelatedBacklinksProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
}

const RelatedBacklinks: React.FC<RelatedBacklinksProps> = ({ currentPost, allPosts }) => {
  // Get posts from different categories for cross-linking
  const crossCategoryPosts = allPosts
    .filter(p => p.category !== currentPost.category && p.id !== currentPost.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  // Get same-category posts for internal backlinks
  const sameCategoryPosts = allPosts
    .filter(p => p.category === currentPost.category && p.id !== currentPost.id)
    .slice(0, 5);

  return (
    <div className="space-y-8 my-10">
      {/* Same Category Backlinks */}
      {sameCategoryPosts.length > 0 && (
        <Card className="border-primary/10 bg-primary/3">
          <CardContent className="p-5 sm:p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              More on {currentPost.category}
            </h3>
            <ul className="space-y-2.5">
              {sameCategoryPosts.map(post => (
                <li key={post.id}>
                  <Link
                    to={`/blog/${post.id}`}
                    className="text-sm text-primary hover:underline flex items-start gap-2 group"
                  >
                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span>{post.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Cross-Category Backlinks */}
      {crossCategoryPosts.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-5 sm:p-6">
            <h3 className="font-bold text-foreground mb-4">You May Also Like</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {crossCategoryPosts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-16 h-12 rounded object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <Badge variant="outline" className="text-[10px] mb-1">{post.category}</Badge>
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Site-wide Internal Links */}
      <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
        <span>Explore:</span>
        <Link to="/agents" className="text-primary hover:underline">Find Insurance Agents</Link>
        <span>•</span>
        <Link to="/claim-assistance" className="text-primary hover:underline">Claim Assistance</Link>
        <span>•</span>
        <Link to="/calculators" className="text-primary hover:underline">Insurance Calculators</Link>
        <span>•</span>
        <Link to="/blog" className="text-primary hover:underline">All Articles</Link>
        <span>•</span>
        <Link to="/faq" className="text-primary hover:underline">FAQs</Link>
        <span>•</span>
        <Link to="/about" className="text-primary hover:underline">About Us</Link>
      </div>
    </div>
  );
};

export default RelatedBacklinks;
