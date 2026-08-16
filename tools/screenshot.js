#!/usr/bin/env node
// tools/screenshot.js
// Usage:
//  node tools/screenshot.js --url http://localhost:8000 --out screenshots/after

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const argv = require('minimist')(process.argv.slice(2));
const url = argv.url || argv.u || 'http://localhost:8000';
const out = argv.out || 'screenshots/out';

const viewports = [
  {name:'mobile-se', width:320, height:568},
  {name:'mobile', width:375, height:812},
  {name:'tablet', width:768, height:1024},
  {name:'desktop', width:1366, height:768}
];

(async ()=>{
  if(!fs.existsSync(out)) fs.mkdirSync(out, {recursive:true});
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  for(const vp of viewports){
    await page.setViewport({width:vp.width,height:vp.height});
    await page.goto(url, {waitUntil:'networkidle2'});
    const filename = path.join(out, `${vp.name}-${vp.width}x${vp.height}.png`);
    await page.screenshot({path:filename, fullPage:false});
    console.log('Saved', filename);
    // small wait to ensure animations finish
    await page.waitForTimeout(250);
  }
  await browser.close();
  console.log('All screenshots saved in', out);
})();
