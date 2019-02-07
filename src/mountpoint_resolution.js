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

module.exports = function resoloveMount(strain) {
  // Currently supports two strain types. 
  // xd-docs-* (returns xd/docs)
  // xd-marketing-* (returns xd)

  //match first word
  let firstWord = strain.match(/(^\w+)-/);
  firstWord = firstWord[1];

  //match second word 
  let secondWord = strain.match(/^\w+-(\w+)-/);
  secondWord = secondWord[1];

  if (secondWord === 'docs') {
    return `${firstWord}/${secondWord}`;
  } else if (secondWord === 'marketing') {
    return `${firstWord}`
  } 

  return null;
};