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

  // context.dispatch.headers = action.headers;

  if (!context.request.url) {
    context.request.url = '/index.html';
  }

  console.log('request url', context.request.url);
  console.log('request path', context.request.path);
  console.log('action path', action.request.params.path);
  console.log('action rootPath', action.request.params.rootPath);
  console.log(context.request.headers['x-strain']);

  if (!action.request.params.rootPath && context.request.path.match('index.html')) {
    console.log('no root path');
    // home page
    context.dispatch.url = context.request.url.replace(/\.html/, '.default.html');
  } else if (action.request.params.rootPath.match('/docs')) {
    context.dispatch.url = context.request.path.replace(/\.html/, '.docs.html');
    console.log(context.dispatch.url);
  } else if (!action.request.params.rootPath && context.request.path.match('open.html')) {
    console.log('open dispatch');
    context.dispatch.url = context.request.path.replace(/\.html/, '.open.html');
    console.log(context.dispatch.url);
  } else {
    // TODO: Create new template for marketing pages
    // use homepage for now
    context.dispatch.url = context.request.url.replace(/\.html/, '.default.html');
  }
}

module.exports.pre = pre;
