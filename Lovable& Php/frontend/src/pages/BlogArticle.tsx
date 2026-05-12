import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import InlineCTA from '@/components/blog/InlineCTA';
import RelatedBacklinks from '@/components/blog/RelatedBacklinks';
import ArticleJsonLd from '@/components/blog/ArticleJsonLd';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { blogPosts } from '@/data/blogPosts';
import { getArticleContent } from '@/data/blogArticleContent';
import { generateArticleContent } from '@/data/blogArticleGenerator';

const ctaVariants: Array<'agent' | 'claim' | 'calculator' | 'contact'> = ['agent', 'claim', 'calculator', 'contact'];

const BlogArticle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postId = parseInt(id || '0');
  const post = blogPosts.find(p => p.id === postId);

  React.useEffect(() => { window.scrollTo(0, 0); }, [postId]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/blog')} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const article = getArticleContent(postId) || generateArticleContent(post);
  const relatedPosts = blogPosts.filter(p => p.category === post.category && p.id !== post.id).slice(0, 3);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const currentIndex = blogPosts.findIndex(p => p.id === postId);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Helmet>
        <title>{`${post.title} | PadosiAgent Blog`}</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={`${post.category}, insurance, India, PadosiAgent, ${post.title.split(' ').slice(0, 5).join(', ')}`} />
        <link rel="canonical" href={`https://padosi-connect-hub.lovable.app/blog/${post.id}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:url" content={`https://padosi-connect-hub.lovable.app/blog/${post.id}`} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:section" content={post.category} />
        <meta property="article:author" content={post.author} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.image} />
      </Helmet>
      <ArticleJsonLd post={post} />
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-primary transition-colors">{post.category}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Two-column layout: Article + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <article>
        <AnimatedSection animation="fade-up">
          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-foreground">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <img src={post.authorImage} alt={post.author} className="w-12 h-12 rounded-full border-2 border-primary/20" loading="lazy" />
              <div>
                <p className="font-semibold text-foreground">{post.author}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(post.date)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readTime}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare} className="ml-auto gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>

          <div className="relative rounded-xl overflow-hidden mb-10 aspect-video">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        </AnimatedSection>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <AnimatedSection animation="fade-up">
            <p className="text-lg leading-relaxed text-foreground/90 mb-8">{article.introduction}</p>
          </AnimatedSection>

          {/* Table of Contents */}
          <AnimatedSection animation="fade-up" delay={100}>
            <Card className="mb-10 border-primary/20 bg-primary/5">
              <CardContent className="p-5 sm:p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
                  <BookOpen className="h-5 w-5 text-primary" /> Table of Contents
                </h2>
                <ol className="space-y-2">
                  {article.sections.map((section, i) => (
                    <li key={i}>
                      <a href={`#section-${i}`} className="text-sm text-primary hover:underline flex items-center gap-2">
                        <span className="text-xs font-bold bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Sections with inline CTAs */}
          {article.sections.map((section, i) => (
            <React.Fragment key={i}>
              <AnimatedSection animation="fade-up" delay={150 + i * 50}>
                <div id={`section-${i}`} className="scroll-mt-24 mb-10">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">{section.heading}</h2>
                  {section.content.split('\n\n').map((paragraph, j) => (
                    <div key={j} className="mb-4 text-foreground/85 leading-relaxed">
                      {paragraph.split('\n').map((line, k) => {
                        // Helper to render inline **bold** within any text
                        const renderBold = (text: string) => {
                          if (!text.includes('**')) return text;
                          const parts = text.split('**');
                          return parts.map((part, m) =>
                            m % 2 === 1 ? <strong key={m} className="text-foreground">{part}</strong> : <span key={m}>{part}</span>
                          );
                        };

                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h3 key={k} className="text-lg font-bold mt-6 mb-2 text-foreground">{line.replace(/\*\*/g, '')}</h3>;
                        }
                        if (line.includes('**')) {
                          if (line.startsWith('- ') || line.startsWith('☐ ')) {
                            return <p key={k} className="ml-4 mb-1 flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>{renderBold(line.replace(/^[-☐]\s+/, ''))}</span></p>;
                          }
                          if (/^\d+\.\s/.test(line)) {
                            return <p key={k} className="ml-4 mb-1">{renderBold(line)}</p>;
                          }
                          return <p key={k} className="mb-2">{renderBold(line)}</p>;
                        }
                        if (line.startsWith('- ') || line.startsWith('☐ ')) {
                          return <p key={k} className="ml-4 mb-1 flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>{line.replace(/^[-☐]\s+/, '')}</span></p>;
                        }
                        if (/^\d+\.\s/.test(line)) {
                          return <p key={k} className="ml-4 mb-1">{line}</p>;
                        }
                        return line ? <p key={k}>{line}</p> : null;
                      })}
                    </div>
                  ))}
                </div>
                {i < article.sections.length - 1 && <Separator className="mb-10" />}
              </AnimatedSection>

              {/* Insert CTA after every 2nd section */}
              {i > 0 && i % 2 === 1 && (
                <InlineCTA variant={ctaVariants[(Math.floor(i / 2)) % ctaVariants.length]} />
              )}
            </React.Fragment>
          ))}

          {/* Key Takeaways */}
          <AnimatedSection animation="fade-up">
            <Card className="mb-10 border-secondary/20 bg-secondary/5">
              <CardContent className="p-5 sm:p-6">
                <h2 className="text-xl font-bold mb-4 text-foreground">📌 Key Takeaways</h2>
                <ul className="space-y-3">
                  {article.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground/85">
                      <span className="text-secondary font-bold text-lg mt-[-2px]">✓</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Conclusion */}
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Conclusion</h2>
            <p className="text-lg leading-relaxed text-foreground/85 mb-8">{article.conclusion}</p>
          </AnimatedSection>
        </div>

        {/* Bottom CTA */}
        <AnimatedSection animation="fade-up">
          <InlineCTA variant="agent" />
        </AnimatedSection>

        {/* Backlinks & Cross-links */}
        <RelatedBacklinks currentPost={post} allPosts={blogPosts} />

        {/* Prev / Next Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {prevPost ? (
            <Link to={`/blog/${prevPost.id}`} className="group">
              <Card className="h-full hover:shadow-md transition-shadow border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Previous Article</p>
                    <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{prevPost.title}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : <div />}
          {nextPost && (
            <Link to={`/blog/${nextPost.id}`} className="group">
              <Card className="h-full hover:shadow-md transition-shadow border-border/50">
                <CardContent className="p-4 flex items-center gap-3 justify-end text-right">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Next Article</p>
                    <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{nextPost.title}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        <Separator className="mb-10" />

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Related Articles</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {relatedPosts.map((related) => (
                <Link key={related.id} to={`/blog/${related.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col border-border/50">
                    <div className="h-36 overflow-hidden">
                      <img src={related.image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <Badge className="w-fit mb-2 text-xs">{related.category}</Badge>
                      <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors flex-grow">{related.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{related.readTime}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <BlogSidebar currentPostId={postId} currentCategory={post.category} />
        </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogArticle;
