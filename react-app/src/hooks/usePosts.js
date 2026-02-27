import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function usePosts(options = {}) {
  const { status, slug, id, limit } = options;
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPostById(id);
    } else if (slug) {
      fetchPostBySlug(slug);
    } else {
      fetchPosts();
    }
  }, [id, slug, status]);

  async function fetchPosts() {
    setLoading(true);
    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image_url, tags, status, scheduled_at, views, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setPosts(data || []);
    setLoading(false);
  }

  async function fetchPostBySlug(slug) {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) setError(error.message);
    else setPost(data);
    setLoading(false);
  }

  async function fetchPostById(id) {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) setError(error.message);
    else setPost(data);
    setLoading(false);
  }

  async function createPost(postData) {
    const slug = postData.slug || slugify(postData.title);
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{ ...postData, slug }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async function updatePost(id, postData) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async function deletePost(id) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  async function incrementViews(slug) {
    await supabase.rpc('increment_views', { post_slug: slug });
  }

  return {
    posts,
    post,
    loading,
    error,
    refetch: id ? () => fetchPostById(id) : slug ? () => fetchPostBySlug(slug) : fetchPosts,
    createPost,
    updatePost,
    deletePost,
    incrementViews,
    slugify,
  };
}
