import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './BlogCard.css';

export default function BlogCard({ post }) {
  const { title, slug, excerpt, cover_image_url, tags = [], created_at } = post;

  const formattedDate = created_at
    ? format(new Date(created_at), 'MMM d, yyyy')
    : '';

  return (
    <Link to={`/blog/${slug}`} className="blog-card">
      <div className="blog-card__image-wrap">
        {cover_image_url ? (
          <img src={cover_image_url} alt={title} className="blog-card__image" />
        ) : (
          <div className="blog-card__image-placeholder">
            <span>MNX</span>
          </div>
        )}
      </div>

      <div className="blog-card__body">
        {tags.length > 0 && (
          <div className="blog-card__tags">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="pill">
                <span />
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="blog-card__title">{title}</h3>

        {excerpt && (
          <p className="blog-card__excerpt">{excerpt}</p>
        )}

        <div className="blog-card__footer">
          {formattedDate && <span className="blog-card__date">{formattedDate}</span>}
          <span className="blog-card__read-more">Read more →</span>
        </div>
      </div>
    </Link>
  );
}
