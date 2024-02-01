const { get } = require("lodash");
const credentialModel = require("../models/credential");
const settingModel = require("../models/setting");
const { prowritingaidLog } = require("../services/logger");
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
                timeout: 300000,
            };
        } else {
            options = {
                headless: false,
                timeout: 300000,
                args: [
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                ],
            };
        }
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.goto("https://prowritingaid.com/en/Account/Login2", { timeout: 300000 });
        await page.focus("input[name='UserName']").then(async () => {
            await page.keyboard.type(email, { delay: 100 });
        });
        await page.focus("input[name='Password']").then(async () => {
            await page.keyboard.type(password, { delay: 100 });
        });
        await Promise.all([
            page.click("button[type='submit']"),
            page.waitForNavigation({ waitUntil: 'load', timeout: 300000 }),
        ]).then(async (result) => {
            setTimeout(async () => {
                if (page.url("https://prowritingaid.com/")) {
                    let cookies = await page.cookies();
                    await browser.close(true);
                    let cookie = "";
                    for (let idx in cookies) {
                        cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                    }
                    console.log(cookie);
                    if (await credentialModel.findOne({ type: "prowritingaid" })) {
                        await credentialModel.findOneAndUpdate({ type: "prowritingaid" }, {
                            username: email,
                            password: password
                        });
                    } else {
                        await credentialModel.create({
                            type: "prowritingaid",
                            username: email,
                            password: password
                        });
                    }
                    await settingModel.findOneAndUpdate(null, {
                        affilistingCookie: cookie
                    }, {
                        upsert: true
                    });
                    prowritingaidLog.info(`Start session with ${email} successfully.`);
                    res.send("Login successfully.");
                } else {
                    await browser.close(true);
                    prowritingaidLog.error(`Start session with ${email} failed.`);
                    res.status(500).send('Credential is incorrect.');
                }
            }, 2000);
        });
    } catch (err) {
        prowritingaidLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};