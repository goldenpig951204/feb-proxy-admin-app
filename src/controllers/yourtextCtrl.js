const credentialModel = require("../models/credential");
const settingModel = require("../models/setting");
const { yourtextLog } = require("../services/logger");
const { get } = require("lodash");
const puppeteer = require("puppeteer-extra");

const login = async (req, res) => {
    let { email, password } = req.body;
    try {
        const windowsLikePathRegExp = /[a-z]:\\/i;
        let inProduction = false;

        if (! windowsLikePathRegExp.test(__dirname)) {
            inProduction = true;
        }
        let options = {};
        if (inProduction) {
            options = {
                headless : true,
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
                headless : false,
                timeout: 100000,
                args: [
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                ],
            };
        }
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.goto('https://yourtext.guru/login/', {waitUntil: 'load', timeout: 100000});
        await page.focus("#email").then(async () => {
            await page.keyboard.type(email, { deplay: 100 });
        });
        await page.focus("#password").then(async () => {
            await page.keyboard.type(password, { delay: 100 });
        });
        await Promise.all([
            page.waitForNavigation({waitUntil: "load", timeout: 100000}),
            page.evaluate(() => document.querySelector("input[type='submit']").click())
        ]).then(async (result) => {
            if (!/\/login/.test(page.url())) {
                let cookies = await page.cookies();
                await browser.close(true);
                let cookie = "";
                for( let idx in cookies) {
                    cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                }
                if (await credentialModel.findOne({type: "yourtext"})) {
                    await credentialModel.findOneAndUpdate({type: "yourtext"}, {
                        username: email,
                        password: password
                    });
                } else {
                    await credentialModel.create({
                        type: "yourtext",
                        username: email,
                        password: password
                    });
                }
                await settingModel.findOneAndUpdate(null, { 
                    yourtextCookie: cookie
                }, {
                    upsert: true
                });
                yourtextLog.info(`Start session with ${email} successfully.`);
                res.send("Login successfully.");
            } else {
                yourtextLog.error(`Start session with ${email} failed`);
                res.status(500).send("Credential is incorrect.");
            }
        });
    } catch (err) {
        yourtextLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.message}`);
        res.status(500).send(get(err, "response.data.message") || err.message);
    }
}

module.exports = {
    login
};