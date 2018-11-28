const puppeteer = require('puppeteer');
const path = require('path');

const images_path = './data';

const getFilePath = () => {
    return path.join(images_path, Date.now().toString() + '.png');
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

(async () => {

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const height = await page.evaluate(function () {
        const body = document.body;
        const html = document.documentElement;
        return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,html.scrollHeight, html.offsetHeight);
    });

    await page.setViewport({
        width: 1920,
        height: Math.max(height, 1080 * 6)
    });


    await page.goto('https://fonts.google.com/');

    async function screenshotDOMElement(selector, i, padding = 0) {
        const rect = await page.evaluate((selector, i) => {
            const elements = Array.from(document.querySelectorAll(selector));
            const element = elements[i];
            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        }, selector, i);

        return await page.screenshot({
            path: getFilePath(),
            clip: {
                x: rect.left - padding,
                y: rect.top - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2
            }
        });
    }

    setTimeout(async () => {
        for (let i = 0; i < 16; i++) {   
            for (let letter of alphabet) {
                await page.evaluate((letter, i) => {
                    const elements = Array.from(document.querySelectorAll('gf-content-editable'));
                    const element = elements[i];
                    element.innerText = letter;
                    element.setAttribute("style", element.getAttribute("style") + "font-style: normal;line-height: normal;font-weight: 400;min-height: auto;height: 64px;width: 64px;text-align: center;display: inline-block;");
                }, letter, i);

                await screenshotDOMElement('gf-content-editable', i);
            }
        }

        await browser.close();
    }, 2000);

})();