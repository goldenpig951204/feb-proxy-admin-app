const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const recaptchaPlugin = require('@nsourov/puppeteer-extra-plugin-recaptcha');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const credentialModel = require('../models/credential');
const settingModel = require('../models/setting');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        puppeteer.use(stealthPlugin());
        puppeteer.use(
            recaptchaPlugin({
                provider: {
                    id: '2captcha',
                    token: process.env.TWO_CAPTCHA_KEY
                },
                visualFeedback: true
            })
        );

        const defaultTimeout = 300000;

        const windowsLikePathRegExp = /[a-z]:\\/i;
        let inProduction = false;

        if (!windowsLikePathRegExp.test(__dirname)) {
            inProduction = true;
        }

        let options = {};
        if (inProduction) {
            options = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--media-cache-size=0',
                    '--disk-cache-size=0',
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                ],
                timeout: defaultTimeout
            };
        } else {
            options = {
                headless: false,
                timeout: defaultTimeout,
                args: [
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                ],
            };
        }

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');
        await page.goto('https://iconscout.com/', { 
            waitUntil: 'load',
            timeout: defaultTimeout
        });
        await page.waitForSelector('#mainMasterHeader > header > nav > ul > li:nth-child(6) > button');
        await page.click('#mainMasterHeader > header > nav > ul > li:nth-child(6) > button');
        await page.waitForSelector('#modalAuthLogin', { visible: true });
        await page.focus('input[name="email"]').then(async () => {
            await page.keyboard.type(email, { delay: 100 });
        });
        await page.focus('input[name="password"]').then(async () => {
            await page.keyboard.type(password, { delay: 100 });
        });
        await page.click('#modalAuthLogin button[type="submit"]');
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'load', timeout: defaultTimeout }).then(async (result) => {
            if ('https://iconscout.com/' === page.url()) {
                const cookies = await page.cookies();
                await browser.close(true);
                let cookie = '';
                for (let idx in cookies) {
                    cookie += cookies[idx].name + '=' + cookies[idx].value + '; ';
                }

                if (await credentialModel.findOne({ type: 'iconscout' })) {
                    await credentialModel.findOneAndUpdate({
                        type: 'iconscout'
                    }, {
                        username: email,
                        password: password
                    });
                } else {
                    await credentialModel.create({
                        type: 'iconscout',
                        username: email,
                        password: password
                    });
                }
                await settingModel.findOneAndUpdate(null, {
                    iconscoutCookie: cookie
                }, {
                    upsert: true
                });
                res.send('Login successfully.');
            } else {
                res.status(500).send('Credential is incorrect.');
            }
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
}

module.exports = {
    login
}