const { get } = require("lodash");
const settingModel = require('../models/setting');
const credentialModel = require('../models/credential');
const { pacdoraLog } = require('../services/logger');
const puppeteer = require('puppeteer-extra');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
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
                timeout: 100000,
            };
        } else {
            options = {
                headless: false,
                timeout: 100000,
                args: [
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                ],
            };
        }
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.goto('https://www.pacdora.com/login', { timeout: 100000 });
        await page.focus('input[type="text"]').then(async () => {
            await page.keyboard.type(email, { delay: 100 });
        });

        await page.focus('input[type="password"]').then(async () => {
            await page.keyboard.type(password, { delay: 100 });
        });

        await Promise.all([
            page.click("button.pacdoraSignIn"),
            page.waitForNavigation({ waitUntil: 'load', timeout: 100000 })
        ]).then(async (result) => {
            console.log(page.url());
            if (page.url() == 'https://www.pacdora.com/') {
                let cookies = await page.cookies();
                console.log('COOKIES======>', cookies);
                await browser.close(true);
                let cookie = '';
                for (let idx in cookies) {
                    cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                }
                if (await credentialModel.findOne({ type: "pacdora" })) {
                    await credentialModel.findOneAndUpdate({ type: "pacdora" }, {
                        username: email,
                        password: password
                    });
                } else {
                    await credentialModel.create({
                        type: "pacdora",
                        username: email,
                        password: password
                    });
                }
                await settingModel.findOneAndUpdate(null, {
                    pacdoraCookie: cookie
                }, {
                    upsert: true
                });
                pacdoraLog.info(`Start session with ${email} successfully.`);
                res.send('Login successfully.');
            } else {
                await browser.close(true);
                pacdoraLog.error(`Start session with ${email} failed.`);
                res.status(500).send('Credential is incorrect.');
            }
        });
    } catch (err) {
        pacdoraLog.error(`Start session with ${email} failed: ${get(err, 'response.data.message') || err.toString()}`);
        res.status(500).send(get(err, 'response.data.message') || err.toString());
    }
}

module.exports = {
    login
}