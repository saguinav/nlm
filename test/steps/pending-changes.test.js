/*
 * Copyright (c) 2015, Groupon, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * Neither the name of GROUPON nor the names of its contributors may be
 * used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const assert = require('assertive');

const getPendingChanges = require('../../lib/steps/pending-changes');

const withFixture = require('../fixture');

describe('getPendingChanges', () => {
  const dirname = withFixture('ticket-commits');
  const pkg = {
    version: '0.0.0',
    repository: 'usr/proj',
  };
  const options = {};

  before('create version commit', () => {
    return getPendingChanges(dirname, pkg, options);
  });

  it('adds the commits to the options', () => {
    assert.hasType(Array, options.commits);
  });

  it('resolves commit references', () => {
    const commit = options.commits.find(c => c.subject === 'Jira');
    assert.equal(1, commit.references.length);
    const ref = commit.references[0];
    assert.equal('REPO-', ref.prefix);
    assert.equal('https://jira.atlassian.com/browse/REPO-2001', ref.href);
  });

  it('truncates full urls to same repo', () => {
    const commit = options.commits.find(c => c.subject === 'Truncate');
    assert.equal(1, commit.references.length);
    const ref = commit.references[0];
    assert.equal('#', ref.prefix);
    assert.equal('https://github.com/usr/proj/issues/44', ref.href);
  });

  it('builds nice references to sibling repos', () => {
    const commit = options.commits.find(c => c.subject === 'Full');
    assert.equal(1, commit.references.length);
    const ref = commit.references[0];
    assert.equal('open/source#', ref.prefix);
    assert.equal('https://github.com/open/source/issues/13', ref.href);
  });

  it('expands short-style refs', () => {
    const commit = options.commits.find(c => c.subject === 'Short');
    assert.equal(1, commit.references.length);
    const ref = commit.references[0];
    assert.equal('#', ref.prefix);
    assert.equal('https://github.com/usr/proj/issues/42', ref.href);
  });

  it('supports refs to other Github instances', () => {
    const commit = options.commits.find(c => c.subject === 'GHE');
    assert.equal(1, commit.references.length);
    const ref = commit.references[0];
    assert.equal('github.example.com/some/thing#', ref.prefix);
    assert.equal('https://github.example.com/some/thing/issues/72', ref.href);
  });
});
