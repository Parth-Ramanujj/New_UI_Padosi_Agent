import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, TrendingUp, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { blogPosts, blogCategories } from '@/data/blogPosts';

const POSTS_PER_PAGE = 12;

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [currentPage, setCurrentPage] = React.useState(1);

  const featuredPost = blogPosts.find(post => post.featured);
  const filteredPosts = blogPosts.filter(post => selectedCategory === 'All' || post.category === selectedCategory);
  const nonFeaturedPosts = filteredPosts.filter(post => !post.featured);

  const totalPages = Math.ceil(nonFeaturedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = nonFeaturedPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  // Reset page on category change
  React.useEffect(() => { setCurrentPage(1); }, [selectedCategory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const scrollToGrid = () => {
    document.getElementById('blog-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section id="blog-header" className="relative bg-gradient-to-br from-primary/8 via-secondary/5 to-background pt-10 sm:pt-12 md:pt-16 pb-14 md:pb-18 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-48 h-48 bg-secondary/15 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <AnimatedSection animation="fade-up">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" />
              Insurance Blog
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
              Insurance <span className="text-secondary">Insights</span> & Tips
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {blogPosts.length}+ expert articles on insurance, financial planning, and tips to help you make informed decisions
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === 'All' && (
        <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-background -mt-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection animation="fade-up">
              <Card className="overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-56 md:h-auto overflow-hidden">
                    <img src={featuredPost.image} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                    <Badge className="absolute top-4 left-4 bg-secondary shadow-md">Featured</Badge>
                  </div>
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-3">{featuredPost.category}</Badge>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 hover:text-primary transition-colors">
                      <Link to={`/blog/${featuredPost.id}`}>{featuredPost.title}</Link>
                    </h2>
                    <p className="text-muted-foreground mb-5 text-sm sm:text-base">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-3 mb-5">
                      <img src={featuredPost.authorImage} alt={featuredPost.author} className="w-10 h-10 rounded-full border-2 border-secondary/20" loading="lazy" />
                      <div>
                        <p className="font-medium text-sm">{featuredPost.author}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(featuredPost.date)}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featuredPost.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-fit gap-2 font-semibold" asChild>
                      <Link to={`/blog/${featuredPost.id}`}>Read More <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Category Filter - Sticky */}
      <section className="sticky sticky-below-navbar py-4 px-4 sm:px-6 lg:px-8 bg-background border-y border-border/30 z-20 backdrop-blur-sm bg-background/95">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {blogCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 transition-all ${
                  selectedCategory === category ? 'shadow-sm' : 'hover:border-primary/40'
                }`}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section id="blog-grid" className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 flex-grow bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Latest Articles</h2>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>{nonFeaturedPosts.length} articles</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {paginatedPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                <AnimatedSection animation="fade-up" delay={index * 60}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border border-border/50 hover:-translate-y-1 h-full flex flex-col">
                    <div className="relative h-44 sm:h-48 overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <Badge className="absolute top-3 left-3 text-xs">{post.category}</Badge>
                    </div>
                    <CardContent className="p-4 sm:p-5 flex flex-col flex-grow">
                      <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={post.authorImage} alt={post.author} className="w-7 h-7 rounded-full border border-border" loading="lazy" />
                          <span className="text-xs font-medium text-foreground">{post.author}</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{post.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {/* CTA after every 6th post */}
                {(index + 1) % 6 === 0 && index !== paginatedPosts.length - 1 && (
                  <Card className="overflow-hidden bg-gradient-to-br from-primary/8 to-secondary/8 sm:col-span-2 lg:col-span-3 border border-primary/15">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Need Insurance Guidance?</h3>
                      <p className="text-muted-foreground mb-5 max-w-2xl mx-auto text-sm sm:text-base">
                        Connect with expert insurance agents who can help you choose the right policy or assist with claims
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <Button size="lg" asChild className="font-semibold gap-2">
                          <Link to="/agents">Find Agents Now <ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="font-semibold">
                          <Link to="/claim-assistance">Get Claim Help</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(p => p - 1); scrollToGrid(); }}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                  .reduce<(number | string)[]>((acc, page, i, arr) => {
                    if (i > 0 && page - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    typeof item === 'string' ? (
                      <span key={`dots-${i}`} className="px-2 text-muted-foreground">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={currentPage === item ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setCurrentPage(item); scrollToGrid(); }}
                        className="w-9 h-9"
                      >
                        {item}
                      </Button>
                    )
                  )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(p => p + 1); scrollToGrid(); }}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
