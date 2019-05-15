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
const fs = require('fs');
const yaml = require('js-yaml');

const config = yaml.safeLoad(fs.readFileSync('helix-config.yaml', 'utf8'));
const { strains } = config;

const STAGING_URL = 'https://adobedevsite.helix-demo.xyz';
const PRODUCTION_URL = 'https://developer.adobe.com';
const DEV_LABEL = 'dev';
const STAGING_LABEL = 'staging';
const PRODUCTION_LABEL = 'production';

describe('helix-config.yaml static analysis', () => {
  it('should use the adobedevsite.helix-demo.xyz domain for all staging and dev strains', () => {
    const devstaging = strains.filter(s => s.name.endsWith(STAGING_LABEL)
      || s.name.endsWith(DEV_LABEL));
    devstaging.forEach((strain) => {
      assert(strain.url.startsWith(STAGING_URL), `found a dev or staging strain but does not use staging URL! ${JSON.stringify(strain)}`);
    });
  });
  it('should use the developer.adobe.com domain for all production strains', () => {
    const prod = strains.filter(s => s.name.endsWith(PRODUCTION_LABEL));
    prod.forEach((strain) => {
      assert(strain.url.startsWith(PRODUCTION_URL), `found a strain whose name ends with ${PRODUCTION_LABEL} but does not use production URL! ${JSON.stringify(strain)}`);
    });
  });
  it('should define one default strain', () => {
    const def = strains.find(s => s.name === 'default');
    assert(def, 'default strain exists');
    assert(def.package, 'default strain has a package');
  });
  it('should not define any strains not associated with one of adobedevsite.helix-demo.xyz or developer.adobe.com', () => {
    const invalid = strains.find(s => s.name !== 'default' && !s.url.startsWith(STAGING_URL) && !s.url.startsWith(PRODUCTION_URL));
    assert.equal(invalid, undefined, `found strains with invalid URLs! ${JSON.stringify(invalid)}`);
  });
  it('should not define any strains not named dev, staging or production', () => {
    const invalid = strains.find(s => s.name !== 'default' && !s.name.endsWith(STAGING_LABEL) && !s.name.endsWith(PRODUCTION_LABEL) && !s.name.endsWith(DEV_LABEL));
    assert.equal(invalid, undefined, `found strains with invalid names! ${JSON.stringify(invalid)}`);
  });
});
