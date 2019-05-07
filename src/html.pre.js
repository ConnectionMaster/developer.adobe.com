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

/* eslint-disable no-param-reassign */

/**
* The 'pre' function that is executed before the HTML is rendered
 * @param context The current context of processing pipeline
 * @param context.content The content
 */
function pre(context, action) {
  context.dispatch = {};
  const { logger } = action;

  // context.dispatch.headers = action.headers;

  if (!context.request.url) {
    context.request.url = '/index.html';
  }

  logger.info(`request url: ${context.request.url}`);
  logger.info(`request path: ${context.request.path}`);
  logger.info(`action path: ${action.request.params.path}`);
  logger.info(`action rootPath: ${action.request.params.rootPath}`);
  logger.info(`strain header: ${context.request.headers['x-strain']}`);

  if (context.request.path.match(/^\/open(\.html)?(\/index.html)?$/i)) {
    // open page
    context.dispatch.url = 'index.open.html';
  } else if (action.request.params.rootPath.match('/docs')) {
    context.dispatch.url = context.request.path.replace(/\.html/, '.docs.html');
  } else if (!action.request.params.rootPath && context.request.path.match('index.html')) {
    // home page
    context.dispatch.url = 'index.default.html';
  } else {
    logger.warn('Using dispatcher catch-all!');
    // TODO: Create new template for marketing pages
    // use homepage for now
    context.dispatch.url = context.request.url.replace(/\.html/, '.default.html');
  }
  logger.info(`dispatch url: ${context.dispatch.url}`);
}

module.exports.pre = pre;
