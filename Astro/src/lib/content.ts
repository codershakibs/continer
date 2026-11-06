import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { marked } from 'marked';

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export const getServices = async () => (await getCollection('services')).sort(byOrder);
export const getCareers = async () => (await getCollection('careers')).sort(byOrder);
export const getCaseStudies = async () => (await getCollection('case-studies')).sort(byOrder);
export const getCategories = () => getCollection('blog-categories');

const getPosts = async (placement: CollectionEntry<'blog'>['data']['placement']) =>
  (await getCollection('blog', ({ data }) => data.placement === placement)).sort(byOrder);

export const getStandardPosts = () => getPosts('standard');
export const getInsightPosts = () => getPosts('insight');
export const getFeaturedPost = async () => (await getPosts('featured'))[0];

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/**
 * Detail templates place images and callouts between blocks of copy.
 * Authors mark those breaks with `<!-- split -->`; each part is returned as HTML.
 */
export const renderParts = (entry: CollectionEntry<CollectionKey>) =>
  (entry.body ?? '').split(/<!--\s*split\s*-->/).map((part) => marked.parse(part.trim(), { async: false }));
