/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
const jsdom = require('jsdom');
const RSSParser = require('rss-parser');
const moment = require('moment');
const DOMUtil = require('./DOM_munging.js');

const rss = new RSSParser();

const { JSDOM } = jsdom;
const dom = new JSDOM();

function formatPostAsHTML(post) {
  const {
    creator,
    title,
    link,
  } = post;
  let { pubDate } = post;

  const pubMoment = moment(pubDate);
  pubDate = `${pubMoment.format('MMM Do')} ${(moment().year() !== pubMoment.year() ? pubMoment.year() : '')}`;

  const temp = dom.window.document.createElement('div');
  temp.innerHTML = post['content:encoded'];
  // brief googling yields a rough math of 265 words per minute read time
  const allWords = DOMUtil.getAllWords(temp);
  const readingLength = Math.ceil(allWords.length / 265);
  const paragraphs = temp.getElementsByTagName('p');
  const firstParagraphContent = paragraphs[0].textContent;
  const secondParagraphContent = (paragraphs[1] ? paragraphs[1].textContent : '');

  let caption = `${firstParagraphContent} ${secondParagraphContent}`;
  if (caption.length > 340) {
    caption = caption.substring(0, 340);
    caption = caption.replace(/\w+$/, 'ohmygod');
  }
  temp.innerHTML = caption;
  DOMUtil.spectrumify(temp);
  caption = temp.innerHTML;

  return {
    pubDate,
    creator,
    title,
    caption,
    readingLength,
    link,
  };
}

async function getPostsAsHTML(logger, url, length = 3) {
  // pull recent blog posts from medium
  logger.info(`Loading ${length} articles from ${url}`);
  let feed = [];
  try {
    feed = await rss.parseURL(url);
  } catch (e) {
    logger.error(`Error attempting to parse Adobe rss feed at: ${url} => ${e.stack || e}`);
    return [];
  }
  return feed.items.slice(0, length).map(formatPostAsHTML);
}

const MediumUtil = {
  getPostsAsHTML,
};
module.exports = MediumUtil;
