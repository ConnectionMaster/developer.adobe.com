# Testing Strategy

This document aims to detail how testing and continuous integration (CI) + deployment (CD)
works for this project. Parts of it may be aspirational, and when possible, this
is called out and an issue is linked.

1. [Requirements](#requirements)
2. [Implementation of Tests](#implementation-of-tests)
    - [Unit Tests](#unit-tests)
    - [End to End Tests](#end-to-end-tests)
    - [Adobe Runtime Action Tests](#adobe-runtime-action-tests)
    - [Performance Testing](#performance-testing)
    - [Link and Image Checking](#link-and-image-checking)
3. [Continuous Delivery Pipeline](#continous-delivery-pipeline)
    - [Environments](#environments)
    - [Delivery Pipeline Implementation](#delivery-pipeline-implementation)
4. [Future Helix Testing Goodness](#future-helix-testing-goodness)

## Requirements

In order to keep this project easy to contribute to, we want testing, and in particular
local testing, to be simple. Anyone should be able to run the tests without too
much hassle. To that end we want `npm install && npm test` to be all that is needed
in order to verify project functionality. Some of the components making up the
full test suite are executable in isolation to enable testing different
environments.

## Implementation of Tests

Three types of tests currently exist:

- [unit tests](#unit-tests)
- [end-to-end/clicky/functional tests](#end-to-end-tests)
- [Adobe Runtime action tests](#adobe-runtime-action-tests)

Additional testing to be implemented:

- [performance testing](#performance-testing)
- [link and image checking](#link-and-image-checking)

### Unit Tests

    npm run test:unit

[This project's unit tests](../test/unit) are fast, run in memory and exercise
purely logical functionality revisioned in this project. As such, most programming
errors _that apply to code revisioned in this project_ can be caught with unit
tests. However, programming errors in libraries that this project depends on usually
cannot be easily caught with unit tests. Additionally, stylistics or UI issues
as well as performance cannot be easily verified using unit tests.

Things that are a good fit for unit testing include:

- Helix pipeline `*.pre.js` files revisioned under [`src/`](../src)
- Any utility or helper modules written that are leveraged in `*.pre.js`
    modules.

### End to End Tests

    # check out the various npm run scripts for variations on how to run the end
    # to end tests.
    grep e2e package.json

[This project's end-to-end tests](../test/e2e) spin up a real browser and automate
the browser to load URLs, find elements, click them, run JavaScript in these browser
sessions - the automation possibilities are endless. Unlike the [unit tests](#unit-tests),
these tests can be executed against any environment - local, staging, and production.
Going even further, the implementation of the underlying website is irrelevant.
That is a big deal for us as we have an AEM-powered version of the site being maintained
alongside a Helix-powered version. If done well, these tests could be written in
a manner that could be used for either implementation.

However, because of all this power and flexibility, they are _much_ slower than
unit tests. At the time of writing this document, `npm run test:unit` runs seven
tests and takes ~11ms, while a local end-to-end test runs 2 tests and takes 13.74s.

End-to-end tests are currently enshrined only to run in CI, and leverage a
remote service ([Sauce Labs](https://saucelabs.com)) to run them in parallel in
order to provide fast feedback.

### Adobe Runtime Action Tests

    npm run test:post-deploy

[This project's Adobe Runtime action tests](../test/post_deploy) are used to
verify the helix serverless actions perform as desired. These are typically only
run as part of the continuous deployment pipeline ([gory details available in
the `.circleci/config.yaml` file](../.circleci/config.yaml)), but they can be
run manually too.

The benefit for having this be a separate testing task and thus individually
runable (manually or as part of CI/CD) is that in a helix reality, pushing to
production is a two-step process: `hlx deploy` followed by `hlx publish`. No changes
hit production until `hlx publish` completes successfully. As such, if we
discover an issue after `hlx deploy`, but before `hlx publish`, we can abort the
`publish` and thus save ourselves some embarassment!

### Performance Testing

*TODO* to be implemented
([adobe/developer.adobe.com-planning#170](https://github.com/adobe/developer.adobe.com-planning/issues/170))

Requirements: want to keep load time under 4 seconds.

### Link and Image Checking

*TODO* to be implemented
([adobe/developer.adobe.com-planning#171](https://github.com/adobe/developer.adobe.com-planning/issues/171))

## Continous Delivery Pipeline

We want to build in automation from the beginning to make deployment easy and
painless.

### Environments

Having isolated environments, where an entire version of the site is accessible,
helps in testing and quality assurance. To that end we want to formalize several
environments to make clear where testing and deployment happens.

The target environments, from least public-facing to most, are as follows:

1. **Local**. Someone with this repo's code could run a local version of the
   site simply by running `npm start`. This exposes the site locally on your
   machine at http://localhost:3000. Mounting specific content to specific
   paths/URLs is managed by local-specific helix strains in `helix-config.yaml`.
2. **Pull-Request-Specific**. *TODO* How to deploy and access this environment
   is still a work-in-progress. The ideal implementation of this environment
   would provide a publicly-accessible URL dedicated to the pull request. In the
   mean time, every pull request open or update follows the **Staging** flow...
3. **Staging**. We have a staging domain set up: https://adobedevsite.helix-demo.xyz.
   When a pull request is opened or updated, or when code is pushed to the
   `master` branch, code is deployed and published to this environment. A fully
   automated test suite executes against this environment. This is the final destination
   for pull request code. However, for code landing in the `master` branch, if
   any failures arise, we stop the [delivery pipeline](#delivery-pipeline-implementation)
   from executing so that no regressions land in...
4. **Production**. Our public environment: https://developer.adobe.com. If our
   test suite passes in our staging environment, then the
   [delivery pipeline](#delivery-pipeline-implementation) will continue its execution
   and push changes up to production automatically.

### Delivery Pipeline Implementation

We want our delivery pipeline to be able to target staging as well as production
environments in order to enable previewing and testing of pull requests.

It is always best to read the source so don't be afraid to look at the
[CircleCI config file](`../.circleci/config.yaml) - best to start by looking at
the [`continuously_deploy` workflow
definition](https://github.com/adobe/developer.adobe.com/blob/master/.circleci/config.yml#L195).
Pull requests are deployed to our staging [environment](#environments). Commits
to the `master` branch deploy to both the staging as well as production
[environments](#environments). A high-level overview of what happens:

1. Install dependencies, build the helix site, and run tests on a local
   instance of helix.
2. If this passes, we deploy the site to our staging
   [environment](#environments) and run end-to-end tests against its public URL.
   Pull requests do not proceed beyond this step.
3. On commits to `master`, if the step above passes, then we deploy to our
   production [environment](#environment) and run a final pass of end-to-end
   tests. If this is successful, we tag the state of the repo with a known-good
   tag (for use in site rollbacks in the future if we decide we need it).

#### Delivery Pipeline TODOs

- [ ] [performance testing](#performance-testing); both pre and post deploy
- [ ] [link and image checking](#link-and-image-checking); both pre and post
    deploy

## Future Helix Testing Goodness

- Full default helix CI/CD implementation currently a work in progress:
    [adobe/helix-cli#582](https://github.com/adobe/helix-cli/issues/582)
- [Calibre](https://calibreapp.com) can be used for thresholds for different environments
    which can be used. A [micro service is already wrapping it in helix](https://github.com/adobe/helix-perf).
- Test new code on new strain where it will see no actual traffic.
