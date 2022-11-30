# Adding/Modifying Templates

## Before you start

- Discuss with maintainers and other game developers in our [Discord](https://discord.gg/myWacjdb5S)
- Raise a [GitHub issue](https://github.com/turnbasedgames/urturn/issues) to open up discussion (make sure one doesn't already exist); maintainers should give you the green/red light in a timely manner.

## Local Development

After cloning the monorepo, install dependencies, link packages, and build:

```bash
$ npm i # install all dependencies
$ npx lerna boostrap --hoist # link all packages together
$ npx lerna run build # builds all packages
```

You will mainly be working with the `@urturn/runner` package under `packages/runner` and the template under `templates/template-<framework>`. Refer to other templates to see what you have to change.

Testing your changes with the runner:

```bash
$ npx lerna @urturn/runner init my-game --git-url <url of your fork> --commit <specific commit or branch>
```

**Warning** - the flags `git-url` and `commit` are hidden because these are only used for testing the runner, so you won't see these if you add the help flag, `-h`, to your command

## Crediting Contributors

If you create a template, we add your github username to the prompt. For example:

```bash
$ npx  @urturn/runner init my-game 
@urturn/runner v0.1.12
? Which game frontend do you want to use?
❯ ReactJS (Created by @kevo1ution) # <== your GH username
  None 
```
