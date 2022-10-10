---
title: 'Static site with Hugo + Netlify deploy'
slug: 'hugo-static-site'
date: 2020-01-05
image: 'img/static.jpg'
tags: ['netlify', 'hugo']
author: 'bmz'
description: 'How to make a static site with Hugo and deploy it to Netlify'
canonicalUrl: 'https://blog.risingstack.com/static-site-generator-hugo-netlify/'
metas:
  title: 'Static site with Hugo + Netlify deploy'
  description: 'How to make a static site with Hugo and deploy it to Netlify'
  image: 'img/static.jpg'
---

If you're wondering how to make a static site like this one, search no more.

I had this thought before that it would be good to have developer blog, but I was lazy to make it. Until now...

So what are the options in terms of static site generators?

- Gatsby (React)
- Hugo (Go)
- Next.js (React)
- Jekyll (Ruby)
- Gridsome (Vue)

These are the most starred projects on GitHub. I've read about Hugo previously, so I decided to make this blog with it.

## Install

Mac:

```bash
brew install hugo
```

Linux:

```bash
sudo apt-get install hugo

or

sudo pacman -Syu hugo
```

To verify your install:

```bash
hugo version
```

## Usage

Create a new project:

```bash
hugo new site my-project
```

Add a theme. You can find themes [here](https://themes.gohugo.io/).

```bash
cd my-project
git init
git submodule add https://github.com/budparr/gohugo-theme-ananke.git themes/ananke
```

Add the theme to the config file.

```
echo 'theme = "ananke"' >> config.toml
```

Add some content.

```bash
hugo new posts/my-first-post.md
```

It should look something like this:

```
---
title: "My First Post"
date: 2020-01-05T18:37:11+01:00
draft: true
---

Hello World!
```

There are lots of options (tags, description, categories, author) you can write to the front matter details.
More about the details [here](https://gohugo.io/content-management/front-matter/).

Take a look what we made:

```bash
hugo server -D
```

Open `localhost:1313`

## Styling

Remember, we applied a theme before. Now if we inspect the `themes` folder, we can see the styling files.

But surprise!
**DO NOT EDIT THESE FILES DIRECTLY**.

Instead we will mirror the theme directory structure to the root `layouts` folder.
Let's say I want to apply custom CSS to the theme.

The theme has a `themes/theme-name/layouts/partials` folder, where we can find some html templates (header.html, footer.html). Now we will edit the `header.html` template, so copy the content from this file to `layouts/partials/header.html` and be careful to create the same directory structure like the theme's into the root `layouts` folder.

```
layouts/partials/header.html

themes/theme-name/layouts/partials/header.html
```

Create a custom css file: `static/css/custom-style.css`.

Add the custom css file to `config.toml`:

```
[params]
  custom_css = ["css/custom-style.css"]
```

Open `layouts/partials/header.html`:

Add this code inside the `<head>` tag:

```html
{{ range .Site.Params.custom_css -}}
<link rel="stylesheet" href="{{ . | absURL }}" />
{{- end }}
```

Now you can overwrite css classes applied by your theme.

## Deploy

Netlify is a very good choice for hosting a static site.

Requirements:

- Netlify account
- Github repository

Create a `netlify.toml` file into the root of your project with the content below.

I won't go into the smallest [details](https://gohugo.io/hosting-and-deployment/hosting-on-netlify/) how to set up Github and Netlify on the UI, but here is a `netlify.toml` file:

```
[build]
publish = "public"  // default hugo build folder
command = "hugo --gc --minify" // hugo build command

[context.production.environment]
HUGO_VERSION = "0.62.1"
HUGO_ENV = "production"
HUGO_ENABLEGITINFO = "true"
```

Now if you push your code to Github, Netlify will deploy the site, and blogging shall start.

Hugo offers so much more you should know about. Discover the official [documentation](https://gohugo.io/documentation/).

![Unlimited power](https://media1.giphy.com/media/3o84sq21TxDH6PyYms/giphy.gif?cid=790b7611f96ab1767b958080a2f06b34e1ed402337c52d48&rid=giphy.gif)
