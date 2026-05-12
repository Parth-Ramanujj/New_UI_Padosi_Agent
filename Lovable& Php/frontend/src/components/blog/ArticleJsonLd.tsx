import React from 'react';
import { BlogPost } from '@/data/blogPosts';
import { getArticleContent } from '@/data/blogArticleContent';
import { generateArticleContent } from '@/data/blogArticleGenerator';

interface ArticleJsonLdProps {
  post: BlogPost;
}

const SITE_URL = 'https://padosi-connect-hub.lovable.app';

const ArticleJsonLd: React.FC<ArticleJsonLdProps> = ({ post }) => {
  const article = getArticleContent(post.id) || generateArticleContent(post);
  const readMinutes = parseInt(post.readTime) || 6;

  const schemas = [
    // BlogPosting schema
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: [post.image],
      author: {
        '@type': 'Person',
        name: post.author,
        image: post.authorImage,
      },
      publisher: {
        '@type': 'Organization',
        name: 'PadosiAgent',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/favicon.ico`,
          width: 512,
          height: 512,
        },
      },
      datePublished: post.date,
      dateModified: post.date,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${post.id}`,
      },
      articleSection: post.category,
      wordCount: readMinutes * 200,
      timeRequired: `PT${readMinutes}M`,
      inLanguage: 'en-IN',
      keywords: `${post.category}, insurance, India, ${post.title.split(' ').slice(0, 4).join(', ')}`,
      about: {
        '@type': 'Thing',
        name: post.category,
      },
    },
    // BreadcrumbList schema
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.category, item: `${SITE_URL}/blog?category=${encodeURIComponent(post.category)}` },
        { '@type': 'ListItem', position: 4, name: post.title, item: `${SITE_URL}/blog/${post.id}` },
      ],
    },
    // FAQPage schema from key takeaways
    ...(article.keyTakeaways.length > 0
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.keyTakeaways.slice(0, 5).map((takeaway) => ({
            '@type': 'Question',
            name: takeaway.endsWith('?') ? takeaway : `What about: ${takeaway}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: takeaway,
            },
          })),
        }]
      : []),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};

export default ArticleJsonLd;
