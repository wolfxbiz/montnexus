import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePages({ slug, id } = {}) {
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) setError(error.message);
    else setPages(data || []);
    setLoading(false);
  }, []);

  const fetchPageBySlug = useCallback(async (pageSlug) => {
    setLoading(true);
    setError(null);
    const { data: pageData, error: pageErr } = await supabase
      .from('site_pages')
      .select('*')
      .eq('slug', pageSlug)
      .single();
    if (pageErr || !pageData) {
      setPage(null);
      setSections([]);
      setError(pageErr?.message || 'Page not found');
      setLoading(false);
      return null;
    }
    const { data: sectionData } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_id', pageData.id)
      .order('display_order', { ascending: true });
    setPage(pageData);
    setSections(sectionData || []);
    setLoading(false);
    return { page: pageData, sections: sectionData || [] };
  }, []);

  const fetchPageById = useCallback(async (pageId) => {
    setLoading(true);
    setError(null);
    const { data: pageData, error: pageErr } = await supabase
      .from('site_pages')
      .select('*')
      .eq('id', pageId)
      .single();
    if (pageErr || !pageData) {
      setError(pageErr?.message || 'Page not found');
      setLoading(false);
      return null;
    }
    const { data: sectionData } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_id', pageData.id)
      .order('display_order', { ascending: true });
    setPage(pageData);
    setSections(sectionData || []);
    setLoading(false);
    return { page: pageData, sections: sectionData || [] };
  }, []);

  useEffect(() => {
    if (slug) fetchPageBySlug(slug);
    else if (id) fetchPageById(id);
    else fetchPages();
  }, [slug, id, fetchPages, fetchPageBySlug, fetchPageById]);

  // ── CRUD: Pages ──────────────────────────────────────────

  const createPage = async (data) => {
    const { data: newPage, error } = await supabase
      .from('site_pages')
      .insert([data])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setPages(prev => [newPage, ...prev]);
    return newPage;
  };

  const updatePage = async (pageId, data) => {
    const { data: updated, error } = await supabase
      .from('site_pages')
      .update(data)
      .eq('id', pageId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setPage(updated);
    setPages(prev => prev.map(p => p.id === pageId ? updated : p));
    return updated;
  };

  const deletePage = async (pageId) => {
    const { error } = await supabase.from('site_pages').delete().eq('id', pageId);
    if (error) throw new Error(error.message);
    setPages(prev => prev.filter(p => p.id !== pageId));
  };

  // ── CRUD: Sections ────────────────────────────────────────

  const addSection = async (pageId, sectionType, content = {}, order = 0) => {
    const { data, error } = await supabase
      .from('page_sections')
      .insert([{ page_id: pageId, section_type: sectionType, content, display_order: order }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setSections(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order));
    return data;
  };

  const updateSection = async (sectionId, content) => {
    const { data, error } = await supabase
      .from('page_sections')
      .update({ content })
      .eq('id', sectionId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setSections(prev => prev.map(s => s.id === sectionId ? data : s));
    return data;
  };

  const deleteSection = async (sectionId) => {
    const { error } = await supabase.from('page_sections').delete().eq('id', sectionId);
    if (error) throw new Error(error.message);
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const reorderSections = async (pageId, orderedIds) => {
    const updates = orderedIds.map((secId, index) =>
      supabase.from('page_sections').update({ display_order: index }).eq('id', secId)
    );
    await Promise.all(updates);
    setSections(prev => {
      const map = Object.fromEntries(prev.map(s => [s.id, s]));
      return orderedIds.map((secId, index) => ({ ...map[secId], display_order: index }));
    });
  };

  return {
    pages, page, sections,
    loading, error,
    fetchPages, fetchPageBySlug, fetchPageById,
    createPage, updatePage, deletePage,
    addSection, updateSection, deleteSection, reorderSections,
  };
}
