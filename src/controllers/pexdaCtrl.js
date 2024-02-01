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
        await page.setDefaultNavigationTimeout(100000);
        await page.goto("https://www.pexda.com/account/");

        await page.focus("input#user_login").then(async () => {
            await page.keyboard.type(email, { delay: 100 });
        });
        await page.focus("input#user_pass").then(async () => {
            await page.keyboard.type(password, { delay: 100 });
        });
        await Promise.all([
            page.click("input#wp-submit"),
            page.waitForNavigation({waitUntil: 'load', timeout : 100000})
        ]).then(async (result) => {
            if (page.url() === "https://pexda.com/account/") {
                let cookies = await page.cookies();
                await browser.close(true);
                let cookie = "";
                for (let idx in cookies) {
                    cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                }
                if (await credentialModel.findOne({ type: "pexda" })) {
                    await credentialModel.findOneAndUpdate({
                        type: "pexda"
                    }, {
                        username: email,
                        password: password
                    })
                } else {
                    await credentialModel.create({
                        type: "pexda",
                        username: email,
                        password: password
                    });
                }
                await settingModel.findOneAndUpdate(null, {
                    pexdaCookie: cookie
                }, {
                    upsert: true
                });
                wordaiLog.info(`Start session with ${email} successfully.`);
                res.send("Login successfully.");
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