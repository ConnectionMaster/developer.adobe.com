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
const assert = require('assert');
const request = require('request-promise');
const sinon = require('sinon');
const computeNav = require('../../src/docs_html.pre.js');

const apiRoot = 'https://api.github.com/';
const owner = 'abc';
const repo = 'xyz';
const ref = 'branch';
const isDev = false;
const logger = console;
const mountPoint = '/contributor/docs';

const response = {
  tree: [
    {
      path: 'contributing.md',
    },
    {
      path: 'help/TOC.md',
    },
  ],
};

describe('docs_html.pre.js', () => {
  beforeEach(() => {
    sinon.stub(request, 'get').returns(response);
  });
  afterEach(() => {
    request.get.restore();
  });
  it('should return /contributor/docs/help/TOC', async () => {
    const file = await computeNav.computeNavPath(
      apiRoot,
      owner,
      repo,
      ref,
      isDev,
      logger,
      mountPoint,
    );
    assert.equal(file, '/contributor/docs/TOC');
  });
});
