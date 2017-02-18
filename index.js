var Epub = require('epub-gen');
var request = require('request-promise');
var cheerio = require('cheerio');
var flatmap = require('flatmap');

const SITE_URL = "http://udaff.com";
const baseUrl = SITE_URL + '/read/netlenka/proza/';
const pages = [1, 2, 3, 4];
const pageUrls = pages.map(nr => baseUrl + `page${nr}.html`);
const urls = [baseUrl].concat(pageUrls);

const initialReqs = urls.map(request);
const extractArticles = html => cheerio.load(html)('div.item>h1>a').map((_, link) => link.attribs.href).get();
const articlePaths = Promise.all(initialReqs).then(reqs => flatmap(reqs, extractArticles));
const articleUrls = articlePaths.then(paths => paths.map(path => SITE_URL + path));

const articles = articleUrls.then(urls => Promise.all(urls.map(request)));

function toEpubArticle(html){
    const $html = cheerio.load(html);
    return {
        title: $html('div.yui-b>div.item h1.single').text(),
        data: $html('div.yui-b>div.item>div').first().text()
    };
}

const epubArticles = articles.then(articles => articles.map(toEpubArticle));

epubArticles.then(articles =>
      new Epub({
         title: "Netlenka",
         author: "hui",
         content: articles
      }, 'C:/Users/dioge/Desktop/udaff.epub')
   );
