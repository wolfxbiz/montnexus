import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import SEO from '../seo/SEO';
import { usePosts } from '../hooks/usePosts';
import { supabase } from '../lib/supabase';
import './BlogPost.css';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { post, loading, error } = usePosts({ slug });

  // Increment view count on load
  useEffect(() => {
    if (post?.id) {
      supabase
        .from('blog_posts')
        .update({ views: (post.views || 0) + 1 })
        .eq('id', post.id)
        .then(() => {});
    }
  }, [post?.id]);

  if (loading) {
    return (
      <div className="blogpost-loading">
        <div className="blogpost-spinner" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blogpost-not-found">
        <h2>Post not found</h2>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/blog" className="btn-primary">← Back to Blog</Link>
      </div>
    );
  }

  const {
    title,
    content,
    cover_image_url,
    tags = [],
    created_at,
    meta_title,
    meta_description,
    og_image_url,
    views,
  } = post;

  const formattedDate = created_at ? format(new Date(created_at), 'MMMM d, yyyy') : '';

  return (
    <>
      <SEO
        title={meta_title || `${title} — Montnexus Blog`}
        description={meta_description || ''}
        image={og_image_url || cover_image_url || ''}
      />

      {/* Dark Hero */}
      <section className="blogpost-hero">
        {cover_image_url && (
          <div className="blogpost-hero__bg">
            <img src={cover_image_url} alt={title} />
          </div>
        )}
        <div className="blogpost-hero__overlay" />
        <div className="blogpost-hero__inner">
          <Link to="/blog" className="blogpost-back">← Back to Blog</Link>

          {tags.length > 0 && (
            <div className="blogpost-hero__tags">
              {tags.map(tag => (
                <span key={tag} className="pill pill-dark">
                  <span />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="blogpost-hero__title">{title}</h1>

          <div className="blogpost-hero__meta">
            {formattedDate && <span>{formattedDate}</span>}
            {views > 0 && <span>{views} views</span>}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="blogpost-content-section">
        <div className="blogpost-content-inner">
          <article className="blogpost-article">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </article>

          {/* Footer */}
          <div className="blogpost-footer">
            <Link to="/blog" className="btn-outline">← All Posts</Link>
          </div>
        </div>
      </section>
    </>
  );
}
