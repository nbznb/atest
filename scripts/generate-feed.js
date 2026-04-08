#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(SCRIPT_DIR, '..', 'state-feed.json');
const SOURCES_PATH = join(SCRIPT_DIR, '..', 'config', 'default-sources.json');
const DEFAULT_LOOKBACK_HOURS = 168;

async function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { seenItems: {} };
  }
  try {
    const state = JSON.parse(await readFile(STATE_PATH, 'utf-8'));
    return { seenItems: state.seenItems || {} };
  } catch {
    return { seenItems: {} };
  }
}

async function saveState(state) {
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  for (const [id, ts] of Object.entries(state.seenItems)) {
    if (ts < cutoff) delete state.seenItems[id];
  }
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2));
}

async function loadSources() {
  return JSON.parse(await readFile(SOURCES_PATH, 'utf-8'));
}

function decodeHtml(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function parseRssFeed(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch;
  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const block = itemMatch[1];
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
    const guidMatch = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const descMatch = block.match(/<description>([\s\S]*?)<\/description>/i);
    const title = titleMatch ? decodeHtml(titleMatch[1]) : 'Untitled';
    const url = linkMatch ? decodeHtml(linkMatch[1]) : null;
    const guid = guidMatch ? decodeHtml(guidMatch[1]) : url || title;
    const publishedAt = pubDateMatch ? new Date(decodeHtml(pubDateMatch[1])).toISOString() : null;
    const summary = descMatch ? decodeHtml(descMatch[1]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    if (url || guid) {
      items.push({ title, url, guid, publishedAt, summary });
    }
  }
  return items;
}

function parseAtomFeed(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let entryMatch;
  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const block = entryMatch[1];
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const idMatch = block.match(/<id>([\s\S]*?)<\/id>/i);
    const updatedMatch = block.match(/<updated>([\s\S]*?)<\/updated>/i);
    const summaryMatch = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || block.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
    const linkMatch = block.match(/<link[^>]*href="([^"]+)"[^>]*\/?/i);
    const title = titleMatch ? decodeHtml(titleMatch[1]) : 'Untitled';
    const url = linkMatch ? decodeHtml(linkMatch[1]) : null;
    const guid = idMatch ? decodeHtml(idMatch[1]) : url || title;
    const publishedAt = updatedMatch ? new Date(decodeHtml(updatedMatch[1])).toISOString() : null;
    const summary = summaryMatch ? decodeHtml(summaryMatch[1]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    if (url || guid) {
      entries.push({ title, url, guid, publishedAt, summary });
    }
  }
  return entries;
}

function withinLookback(item, hours) {
  if (!item.publishedAt) return true;
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return new Date(item.publishedAt).getTime() >= cutoff;
}

async function fetchFeedItems(source, state) {
  const res = await fetch(source.feedUrl, {
    headers: { 'User-Agent': 'FollowUSTC/1.0 (digest aggregator)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const items = source.type === 'atom' ? parseAtomFeed(xml) : parseRssFeed(xml);
  const lookbackHours = source.lookbackHours || DEFAULT_LOOKBACK_HOURS;
  const maxItems = source.maxItems || 5;

  const selected = [];
  for (const item of items) {
    const uniqueId = item.guid || item.url || item.title;
    if (!uniqueId || state.seenItems[uniqueId]) continue;
    if (!withinLookback(item, lookbackHours)) continue;
    selected.push({
      source: source.category,
      sourceName: source.name,
      title: item.title,
      url: item.url,
      publishedAt: item.publishedAt,
      summary: item.summary
    });
    state.seenItems[uniqueId] = Date.now();
    if (selected.length >= maxItems) break;
  }
  return selected;
}

function absolutizeUrl(baseUrl, maybeRelative) {
  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return maybeRelative;
  }
}

function parseTeachHomeLinks(html, source) {
  const items = [];
  const regex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const seen = new Set();
  while ((match = regex.exec(html)) !== null) {
    const url = absolutizeUrl(source.siteUrl || source.indexUrl, decodeHtml(match[1]));
    const title = decodeHtml(match[2]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!title || title.length < 8) continue;
    if (!/通知|公告|教务|选课|考试|培养|课程|报名|学籍|教学/.test(title)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    items.push({ title, url, guid: url, publishedAt: null, summary: '' });
    if (items.length >= (source.maxItems || 8) * 2) break;
  }
  return items;
}

function extractGenericArticle(html) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeHtml(titleMatch[1]) : 'Untitled';
  const publishedAtMatch = html.match(/(20\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2})/);
  const publishedAt = publishedAtMatch ? publishedAtMatch[1] : null;
  let content = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (content.length > 4000) content = content.slice(0, 4000);
  return { title, publishedAt, content };
}

async function fetchScrapeItems(source, state) {
  const res = await fetch(source.indexUrl, {
    headers: { 'User-Agent': 'FollowUSTC/1.0 (digest aggregator)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  let candidates = [];
  if (source.listParser === 'teach_home_links') {
    candidates = parseTeachHomeLinks(html, source);
  }

  const results = [];
  for (const item of candidates) {
    const uniqueId = item.guid || item.url || item.title;
    if (!uniqueId || state.seenItems[uniqueId]) continue;

    let summary = item.summary || '';
    let publishedAt = item.publishedAt || null;
    let title = item.title;

    if (source.contentMode === 'article' && item.url) {
      try {
        const articleRes = await fetch(item.url, {
          headers: { 'User-Agent': 'FollowUSTC/1.0 (digest aggregator)' }
        });
        if (articleRes.ok) {
          const articleHtml = await articleRes.text();
          const article = extractGenericArticle(articleHtml);
          title = article.title || title;
          publishedAt = publishedAt || article.publishedAt || null;
          summary = article.content || summary;
        }
      } catch {
      }
    }

    results.push({
      source: source.category,
      sourceName: source.name,
      title,
      url: item.url,
      publishedAt,
      summary
    });
    state.seenItems[uniqueId] = Date.now();
    if (results.length >= (source.maxItems || 5)) break;
  }

  return results;
}

async function fetchCategoryContent(sources, state, errors) {
  const results = [];
  for (const source of sources) {
    try {
      let items = [];
      if (source.type === 'rss' || source.type === 'atom') {
        items = await fetchFeedItems(source, state);
      } else if (source.type === 'scrape') {
        items = await fetchScrapeItems(source, state);
      }
      results.push(...items);
    } catch (err) {
      errors.push(`${source.category}: ${source.name}: ${err.message}`);
    }
  }
  return results.sort((a, b) => {
    if (a.publishedAt && b.publishedAt) return new Date(b.publishedAt) - new Date(a.publishedAt);
    if (a.publishedAt) return -1;
    if (b.publishedAt) return 1;
    return 0;
  });
}

async function main() {
  const sources = await loadSources();
  const state = await loadState();
  const errors = [];

  const official = await fetchCategoryContent(sources.official || [], state, errors);
  const tech = await fetchCategoryContent(sources.tech || [], state, errors);
  const papers = await fetchCategoryContent(sources.papers || [], state, errors);

  await writeFile(join(SCRIPT_DIR, '..', 'feed-official.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    official,
    stats: { officialItems: official.length },
    errors: errors.filter(e => e.startsWith('official:')).length ? errors.filter(e => e.startsWith('official:')) : undefined
  }, null, 2));

  await writeFile(join(SCRIPT_DIR, '..', 'feed-tech.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    tech,
    stats: { techItems: tech.length },
    errors: errors.filter(e => e.startsWith('tech:')).length ? errors.filter(e => e.startsWith('tech:')) : undefined
  }, null, 2));

  await writeFile(join(SCRIPT_DIR, '..', 'feed-papers.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    papers,
    stats: { paperItems: papers.length },
    errors: errors.filter(e => e.startsWith('papers:')).length ? errors.filter(e => e.startsWith('papers:')) : undefined
  }, null, 2));

  await saveState(state);
}

main().catch(err => {
  console.error('Feed generation failed:', err.message);
  process.exit(1);
});
