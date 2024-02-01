const { get } = require("lodash");
const credentialModel = require("../models/credential");
const settingModel = require("../models/setting");
const { wordaiLog } = require("../services/logger");
const puppeteer = require("puppeteer-extra");

const login = async (req, res) => {
    let { email, password } = req.body;
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
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        });
        await page.setDefaultNavigationTimeout(100000);
        await page.goto("https://alishark.com/login");

        await page.focus("input#firstshit").then(async () => {
            await page.keyboard.type(email, { delay: 100 });
        });
        await page.focus("input#secondshit").then(async () => {
            await page.keyboard.type(password, { delay: 100 });
        });
        await Promise.all([
            page.click("form button"),
            page.waitForNavigation({ waitUntil: 'load', timeout: 100000 })
        ]).then(async (result) => {
            if (page.url() === "https://alishark.com/") {
                const cookies = await page.cookies();
                let cookie = "";
                for (let idx in cookies) {
                    cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                }
                await browser.close(true);
                if (await credentialModel.findOne({ type: "alishark" })) {
                    await credentialModel.findOneAndUpdate({
                        type: "alishark"
                    }, {
                        username: email,
                        password: password
                    });
                } else {
                    await credentialModel.create({
                        type: "alishark",
                        username: email,
                        password: password
                    });
                }
                await settingModel.findOneAndUpdate(null, {
                    alisharkCookie: cookie,
                }, {
                    upsert: true
                });
                wordaiLog.info(`Start session with ${email} successfully.`);
                res.send('Login successfully.');
            } else {
                res.status(500).send("Credential is incorrect.");
            }
        });
    } catch (err) {
        wordaiLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};