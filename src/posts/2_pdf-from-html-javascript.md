---
title: 'Generating PDF from HTML with JavaScript'
date: 2020-01-04
slug: 'pdf-from-html'
description: 'In this article I’m going to show how you can generate a PDF document from a heavily styled React page using Puppeteer, headless Chrome & Docker'
image: 'img/pdf.webp'
tags: ['pdf', 'puppeteer', 'pdf from html', 'docker']
author: 'bmz'
canonicalUrl: 'https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/'
metas:
  title: 'Generating PDF from HTML with JavaScript'
  description: 'In this article I’m going to show how you can generate a PDF document from a heavily styled React page using Puppeteer, headless Chrome & Docker.'
  image: 'img/pdf.webp'
---

**In this article I’m going to show how you can generate a PDF document from a heavily styled React page using Puppeteer, headless Chrome & Docker.**

Background: A few months ago one of our clients asked us to develop a feature where the user would be able to request a React page in PDF format. That page is basically a report/result for patients with data visualization, containing a lot of SVGs. Furthermore, there were some special requests to manipulate the layout and make some rearrangements of the HTML elements. So the PDF should have different styling and additions compared to the original React page.

As the assignment was a bit more complex than what could have been solved with simple CSS rules, we first explored possible implementations. Essentially we found 3 main solutions. This blogpost will walk you through on these possibilities and the final implementations.

A personal comment before we get started: it’s quite a hassle, so buckle up!

## Table of contents

Client/Backend side
Option 1: Screenshot from the DOM
Option 2: Use only a PDF library
Final option 3: Puppeteer, headless Chrome
Using Puppeteer with Docker
Option 3 +1: CSS print rules
Summary

## Client side vs Backend

It is possible to generate a PDF file both on the client-side and on the server-side. However, it probably makes more sense to let the backend handle it, as you don’t want to use up all the resources the user’s browser can offer.

Even so, I’ll still show solutions for both methods.

## Option 1: Make a screenshot from the DOM

At first sight, this solution seemed to be the simplest, and it turned out to be true, but it has its own limitations. If you don’t have special needs, like selectable or searchable text in the PDF, it is a good and simple way to generate one.

This method is plain and simple: create a screenshot from the page, and put it in a PDF file. Pretty straightforward. We used two packages for this approach:

[Html2canvas](https://html2canvas.hertzen.com/), to make a screenshot from the DOM
[jsPdf](https://github.com/MrRio/jsPDF), a library to generate PDF

Let’s start coding.

```bash
npm install html2canvas jspdf
```

```js
import html2canvas from 'html2canvas'
import jsPdf from 'jspdf'

function printPDF () {
    const domElement = document.getElementById('your-id')
    html2canvas(domElement, { onclone: (document) => {
      document.getElementById('print-button').style.visibility = 'hidden'
}})
    .then((canvas) => {
        const img = canvas.toDataURL('image/png')
        const pdf = new jsPdf()
        pdf.addImage(imgData, 'JPEG', 0, 0, width, height)
        pdf.save('your-filename.pdf')
})
```

And that’s it!

Make sure you take a look at the `html2canvas` `onclone` method. It can prove to be handy when you quickly need to take a snapshot and manipulate the DOM (e.g. hide the print button) before taking the picture. I can see quite a lot of use cases for this package. Unfortunately, ours wasn’t one, as we needed to handle the PDF creation on the backend side.

## Option 2: Use only a PDF library

There are several libraries out there on NPM for this purpose, like jsPDF (mentioned above) or [PDFKit](https://www.npmjs.com/package/pdfkit). The problem with them that I would have to recreate the page structure again if I wanted to use these libraries. That definitely hurts maintainability, as I would have needed to apply all subsequent changes to both the PDF template and the React page.

Take a look at the code below. You need to create the PDF document yourself by hand. Now you could traverse the DOM and figure out how to translate each element to PDF ones, but that is a tedious job. There must be an easier way.

```js
doc = new PDFDocument()
doc.pipe fs.createWriteStream('output.pdf')
doc.font('fonts/PalatinoBold.ttf')
   .fontSize(25)
   .text('Some text with an embedded font!', 100, 100)

doc.image('path/to/image.png', {
   fit: [250, 300],
   align: 'center',
   valign: 'center'
});

doc.addPage()
   .fontSize(25)
   .text('Here is some vector graphics...', 100, 100)

doc.end()
```

This snippet is from the PDFKit docs. However, it can be useful if your target is a PDF file straight away and not the conversion of an already existing (and ever-changing) HTML page.

## Final Option 3: Puppeteer

### What is [Puppeteer](https://github.com/GoogleChrome/puppeteer)?

The documentation says ‘Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium’.

It’s basically a browser which you can run from Node.js. If you read the docs, the first thing it says about Puppeteer is that you can use it to **Generate screenshots and PDFs of pages**’. Excellent! That’s what we were looking for.

Let’s install Puppeteer, and implement our use case.

```bash
$ npm i puppeteer
```

```js
const puppeteer = require('puppeteer')

async function printPDF() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://blog.risingstack.com', {waitUntil: 'networkidle0'});
  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();
  return pdf
})
```

This is a simple function that navigates to a URL and generates a PDF file of the site.

First, we launch the browser (PDF generation only supported in headless mode), then we open a new page, set the viewport, and navigate to the provided URL.

Setting the`waitUntil: ‘networkidle0’`option means, that Puppeteer considers navigation to be finished when there are no network connections for at least 500 ms. (Check [API docs](https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md) for further information.)

After that, we save the PDF to a variable, we close the browser and return the PDF.

Note: The `page.pdf`method receives an `options` object, where you can save the file to disk with the ‘path’ option as well. If path is not provided, the PDF won’t be saved to the disk, you’ll get a buffer instead. Later on, I discuss how you can handle it.)

In case you need to log in first to generate a PDF from a protected page, first you need to navigate to the login page, inspect the form elements for ID or name, fill them in, then submit the form:

```js
await page.type('#email', process.env.PDF_USER)
await page.type('#password', process.env.PDF_PASSWORD)
await page.click('#submit')
```

**Nb. Always store login credentials in environment variables, do not hardcode them!**

### Style manipulation

Puppeteer has a solution for this style manipulation too. You can insert style tags before generating the PDF, and Puppeteer will generate a file with the modified styles.

```css
await page.addStyleTag({ content: '.nav { display: none} .navbar { border: 0px} #print-button {display: none}' })
```

### Send file to the client and save it

Okay, now you have generated a PDF file on the backend. What to do now?

As I mentioned above, if you don’t save the file to disk, you’ll get a buffer. You just need to send that buffer with the proper content type to the front-end.

```js
printPDF.then(pdf => {
	res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
	res.send(pdf)
```

Now you can simply send a request to the server, to get the generated PDF.

```js
function getPDF() {
 return axios.get(`${API_URL}/your-pdf-endpoint`, {
   responseType: 'arraybuffer',
   headers: {
     'Accept': 'application/pdf'
   }
 })
```

Once you’ve sent the request, the buffer should start downloading. Now the last step is to convert the buffer into a PDF file.

```js
savePDF = () => {
    this.openModal(‘Loading…’) // open modal
   return getPDF() // API call
     .then((response) => {
       const blob = new Blob([response.data], {type: 'application/pdf'})
       const link = document.createElement('a')
       link.href = window.URL.createObjectURL(blob)
       link.download = `your-file-name.pdf`
       link.click()
       this.closeModal() // close modal
     })
   .catch(err => /** error handling **/)
 }
```

```js
<button onClick={this.savePDF}>Save as PDF</button>
```

That was it! If you click on the save button, the PDF will be saved by the browser.

## Usage with Docker

I think this is the trickiest part of the implementation - so let me save you a couple of hours of Googling.

The official documentation states that _“getting headless Chrome up and running in Docker can be tricky”_. The official docs have a [Troubleshooting](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker) section, where at the time of writing you can find all the necessary information on installing puppeteer with Docker.

If you install Puppeteer on the Alpine image, make sure you scroll down a bit to [this part of the page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-on-alpine). Otherwise, you might gloss over the fact that you cannot run the latest Puppeteer version and you also need to disable shm usage, using a flag:

```js
const browser = await puppeteer.launch({
  headless: true,
  args: ['--disable-dev-shm-usage'],
})
```

Otherwise, the Puppeteer sub process might run out of memory before it even gets started properly. More info about that on the troubleshooting link above.

## Option 3 + 1: CSS print rules

One might think that simply using CSS print rules is easy from a developers standpoint. No NPM modules, just pure CSS. But how do they fare when it comes to cross-browser compatibility?

When choosing CSS print rules, you have to test the outcome in every browser to make sure it provides the same layout, and it’s not 100% that it does.

For example, inserting a break after a given element cannot be considered an esoteric use case, yet you might be surprised that you need to use workarounds [to get that working in Firefox](https://developer.mozilla.org/en-US/docs/Web/CSS/break-after#Browser_compatibility).

Unless you are a battle-hardened CSS magician with a lot of experience in creating printable pages, this can be time-consuming.

Print rules are great if you can keep the print stylesheets simple.

Let’s see an example.

```css
@media print {
  .print-button {
    display: none;
  }

  .content div {
    break-after: always;
  }
}
```

This CSS above hides the print button, and inserts a page break after every `div` with the class `content.` There is a [great article](https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/) that summarizes what you can do with print rules, and what are the difficulties with them including browser compatibility.

Taking everything into account, CSS print rules are great and effective if you want to make a PDF from a not so complex page.

## Summary

So let’s quickly go through the options we covered here for generating PDF files from HTML pages:

**Screenshot from the DOM**: This can be useful when you need to create snapshots from a page (for example to create a thumbnail), but falls short when you have a lot of data to handle.
**Use only a PDF library**: If you need to create PDF files programmatically from scratch, this is a perfect solution. Otherwise, you need to maintain the HTML and PDF templates which is definitely a no-go.
**Puppeteer**: Despite being relatively difficult to get it working on Docker, it provided the best result for our use case, and it was also the easiest to write the code with.
**CSS print rules**: If your users are educated enough to know how to print to a file and your pages are relatively simple, it can be the most painless solution. As you saw in our case, it wasn’t.

Happy printing!
