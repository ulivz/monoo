# monoo

[![npm version](https://badgen.net/npm/v/monoo)](https://npm.im/monoo)

Monorepo development & continuous integration tooling.

## Motivation

When we released **_monorepo_**, a headache problem was that release flow failed but some packages had been published to NPM. At this time, you may discard current release, or publish manually one by one, but it's quite troublesome in a monorepo with a large number of packages.

**mono** introduced a post `patch` process, it helps you to continue current release with visible release status.

![](./assets/workflow.png)


## Features

- Restartable release flow, powered by a post `patch` release process with [visible release status](#a-complete-release-workflow).
- Quickly launch on-demand development build for monorepo.
- Generated changelog with author.

## Table of Contents

- [monoo](#monoo)
  - [Motivation](#motivation)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Usage](#usage)
    - [A complete release workflow](#a-complete-release-workflow)
    - [Execute build after bump version](#execute-build-after-bump-version)
    - [Independent patch process](#independent-patch-process)
    - [Generate Changelog](#generate-changelog)
      - [Attach commit author](#attach-commit-author)
      - [Create commit](#create-commit)
      - [Auto push](#auto-push)
    - [On-demand development build](#on-demand-development-build)
  - [Commands](#commands)
    - [monoo release](#monoo-release)
    - [monoo patch](#monoo-patch)
    - [monoo changelog](#monoo-changelog)
    - [monoo dev](#monoo-dev)
  - [Projects Using MONOO](#projects-using-mono)
  - [FAQ](#faq)
    - [I don't use lerna, can I use it?](#i-dont-use-lerna-can-i-use-it)
  - [Author](#author)

## Install

```bash
npm i -g monoo # globally
npm i -D monoo # as devDependencies
```

## Usage

### A complete release workflow

If you had a monorepo as:

```bash
.
├── lerna.json
├── package.json
└── packages
    ├── foo
    ├── bar
    ├── baz
    └── qux
```

If current version is `2.1.1`, after a period of time, I decide to release a patch version with `latest` version, so I execute:

```bash
monoo release
```

You'll receive a prompt log to choose a release version, and you selected `2.1.2` to continue.

If release process got failed, you'll see a _**visible release status**_ under `patch` stage:

<p align="center">
  <img width="600" src="./assets/release-status.png"/>
</p>

Just select `Y` to finish release for all unpublished packages.

### Execute build after bump version

You may execute `monoo release` after build packages, but if your build process generated assets that contains the version of each, you'll get a wrong version at final NPM assets, you can execute build after version is bumped:

```bash
monoo release --build --ignore-scripts 
# Note that --ignore-scripts is required if you set `prepublishOnly` for sub packages.
```

### Independent patch process

Patch process has been integrated into [release flow](#a-complete-release-workflow), you can also use it separately:

```bash
monoo patch --tag=latest       # launch patch process with latest tag.
```

### Generate Changelog

Changelog process has been integrated into [release flow](#a-complete-release-workflow), You can also use it separately:

```bash
monoo changelog # generate changelog
```

The equivalent command under release flow is:

```
monoo changelog --beautify --commit --gitPush --attachAuthor --authorNameType name
```

#### Attach commit author

```bash
monoo changelog --attachAuthor
```

Commits under generated changelog will be attached with commit author:

```diff
 ### Bug Fixes
 
-* **scope:** xx ([d1cfea5](...))
+* **scope:** xx ([d1cfea5](...)) [@ULIVZ](https://github.com/ulivz)
```

#### Create commit

```bash
monoo changelog --commit
```

monoo will create a commit for generated changelog.

#### Auto push

```bash
monoo changelog --gitPush
```

monoo will create a push action to remote repository.

### On-demand development build

using `lerna run dev` will launch all dev process for all packages, using `monoo dev` will launch a on-demand development build for monorepo.

```bash
monoo dev
```

## Commands

### monoo release

Using `monoo release` to replace `lerna publish`:

```bash
monoo release                  # standard release flow
monoo release --no-changelog   # do not generate changelog
monoo release --ignore-scripts # ignore npm scripts under release process.
monoo release --dry-run        # preview execution
```

### monoo patch

```bash
monoo patch --tag laest      # standard release flow
monoo patch --tag next       # launch patch process with next tag.
monoo patch --tag latest --ignore-scripts    # Ignore npm scripts under patch process.
```

### monoo changelog

```bash
monoo changelog
monoo changelog --beautify              # beautify changelog
monoo changelog --commit                # create a commit
monoo changelog --gitPush               # push to remote repository
monoo changelog --attachAuthor          # add author to generated changelog
monoo changelog --authorNameType email  # set display author to author's email
monoo changelog --authorNameType name   # set display author to author's name
```

Recommended composable flags:

```bash
monoo changelog --beautify --commit --gitPush --attachAuthor --authorNameType name
```

### monoo dev

```bash
monoo dev       # launch a on-demand development build for monorepo.
```

## Projects Using MONOO

Projects that use **MONOO**:

- [VuePress](https://github.com/vuejs/vuepress): 📝 Minimalistic Vue-powered static site generator.
- Many ByteDance projects.
- Feel free to add yours here...

## FAQ

### I don't use lerna, can I use it?

monoo leverage lerna under the hood, but you can still use it in other monorepo tool chains, such as rush.

## Author

MIT &copy; [ULIVZ](https://github.com/sponsors/ulivz)
