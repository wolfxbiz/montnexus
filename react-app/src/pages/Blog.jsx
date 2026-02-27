import { useState, useMemo } from 'react';
import SEO from '../seo/SEO';
import BlogCard from '../components/blog/BlogCard';
import { usePosts } from '../hooks/usePosts';
import './Blog.css';

export default function Blog() {
  const { posts, loading, error } = usePosts({ status: 'published' });
  const [activeTag, setActiveTag] = useState(null);

  // Collect all unique tags from posts
  const allTags = useMemo(() => {
    const tags = new Set();
    posts.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [posts]);

  const filteredPosts = activeTag
    ? posts.filter(p => p.tags?.includes(activeTag))
    : posts;

  return (
    <>
      <SEO
        title="Blog — Montnexus"
        description="Insights on retail automation, AI systems, and business technology from the Montnexus team."
      />

      {/* Dark Hero Banner */}
      <section className="blog-hero">
        <div className="blog-hero__inner">
          <span className="section-tag">Montnexus Blog</span>
          <h1 className="blog-hero__title">Insights &amp; Updates</h1>
          <p className="blog-hero__sub">
            Expert perspectives on retail automation, AI integration,
            and building systems that scale.
          </p>
        </div>
      </section>

      {/* Light Card Grid Section */}
      <section className="blog-grid-section">
        <div className="blog-grid-section__inner">

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="blog-tags-filter">
              <button
                className={`blog-tag-btn${activeTag === null ? ' active' : ''}`}
                onClick={() => setActiveTag(null)}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`blog-tag-btn${activeTag === tag ? ' active' : ''}`}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="blog-state">
              <div className="blog-state__spinner" />
              <p>Loading posts…</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="blog-state blog-state--error">
              <p>Could not load posts. Please try again later.</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPosts.length === 0 && (
            <div className="blog-state blog-state--empty">
              <h3>No posts yet</h3>
              <p>We're working on fresh content. Check back soon.</p>
            </div>
          )}

          {/* Post Grid */}
          {!loading && filteredPosts.length > 0 && (
            <div className="blog-grid">
              {filteredPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
