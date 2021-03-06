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
const supertest = require('supertest');
const yaml = require('js-yaml');
const fs = require('fs');
const assert = require('assert');

const DOMAIN = 'https://adobeioruntime.net';
const BASEPATH = '/api/v1/web/';
const STRAIN = 'default';
const HOME_QUERY = `?owner=adobe&repo=developer.adobe.com&ref=master&path=/index.md&strain=${STRAIN}`;
const config = yaml.safeLoad(fs.readFileSync('helix-config.yaml', 'utf8'));
const strainObj = config.strains.find(s => s.name === STRAIN);
const PACKAGE = strainObj.package;
assert(PACKAGE.includes('developer-adobe-com'), 'package does not contain runtime namespace!');
const agent = supertest(DOMAIN);

// TODO: do proxy strains get their own runtime actions, and if so, how can we
// test that?

describe('runtime action post-deploy tests', () => {
  describe('"html" action HTTP tests', () => {
    const endpoint = `${BASEPATH}${PACKAGE}/html${HOME_QUERY}`;
    it(`${DOMAIN}${endpoint} should return 200 with content containing adobe somewhere`, (done) => {
      agent
        .get(endpoint)
        .send()
        .expect(200)
        .expect(/adobe/i)
        .end(done);
    });
  });
  describe('"default_html" action HTTP tests', () => {
    const endpoint = `${BASEPATH}${PACKAGE}/default_html${HOME_QUERY}`;
    it(`${DOMAIN}${endpoint} should return 200 with content containing adobe somewhere`, (done) => {
      agent
        .get(endpoint)
        .send()
        .expect(200)
        .expect(/adobe/i)
        .end(done);
    });
  });
  describe('"docs_html" action HTTP tests', () => {
    const homeEndpoint = `${BASEPATH}${PACKAGE}/docs_html${HOME_QUERY}`;
    const XD_QUERY = '?owner=adobexd&repo=plugin-docs&ref=master&path=/README.md&strain=xd-docs-helixdemo';
    const xdEndpoint = `${BASEPATH}${PACKAGE}/docs_html${XD_QUERY}`;
    it(`${DOMAIN}${homeEndpoint} should return 200 with content containing adobe somewhere if told to get content from this repo`, (done) => {
      agent
        .get(homeEndpoint)
        .send()
        .expect(200)
        .expect(/adobe/i)
        .end(done);
    });
    it(`${DOMAIN}${xdEndpoint} should return 200 with content containing xd somewhere if told to get content from xd docs repo`, (done) => {
      agent
        .get(xdEndpoint)
        .send()
        .expect(200)
        .expect(/xd/i)
        .end(done);
    });
  });
  describe('"summary_html" action HTTP tests', () => {
    const XD_QUERY = '?owner=adobexd&repo=plugin-docs&ref=master&path=/SUMMARY.md&strain=xd-docs-helixdemo';
    const endpoint = `${BASEPATH}${PACKAGE}/summary_html${XD_QUERY}`;
    it(`${DOMAIN}${endpoint} should return 200 with content containing xd somewhere if told to get content from xd docs repo`, (done) => {
      agent
        .get(endpoint)
        .send()
        .expect(200)
        .expect(/xd/i)
        .end(done);
    });
  });
});
