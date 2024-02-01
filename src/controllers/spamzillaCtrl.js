const settingModel = require("../models/setting");
const credentialModel = require("../models/credential");
const { spamzillaLog } = require("../services/logger");
const { get } = require("lodash");
const puppeteer = require("puppeteer-extra");
const recaptchaPlugin = require('@nsourov/puppeteer-extra-plugin-recaptcha');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
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
        await page.goto('https://www.spamzilla.io/account/login/', { waitUntil: 'load', timeout: 100000 });
        await page.focus("#loginform-email").then(async () => {
            await page.keyboard.type(email, { delay: 200 });
        });
        await page.focus("#loginform-password").then(async () => {
            await page.keyboard.type(password, { delay: 200 });
        });
        await page.solveRecaptchas();

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'load', timeout: 100000 }),
            page.click('.custom-submit-btn')
        ]).then(async (result) => {
            if (/account\/login/.test(page.url())) {
                await page.solveRecaptchas();
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'load', timeout: 100000 }),
                    page.click('.custom-submit-btn')
                ]).then(async (result) => {
                    if (/account\/login/.test(page.url())) {
                        await page.solveRecaptchas();
                        await Promise.all([
                            page.waitForNavigation({ waitUntil: 'load', timeout: 100000 }),
                            page.click('.custom-submit-btn')
                        ]).then(async (result) => {
                            if (/account\/login/.test(page.url())) {
                                await browser.close(true);
                                res.status(500).send('Credential is incorrect.');
                            } else {
                                let cookies = await page.cookies();
                                await browser.close(true);
                                let cookie = "";
                                for (let idx in cookies) {
                                    cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                                }
                                if (await credentialModel.findOne({ type: "spamzilla" })) {
                                    await credentialModel.findOneAndUpdate({ type: "spamzilla" }, {
                                        username: email,
                                        password: password
                                    });
                                } else {
                                    await credentialModel.create({
                                        type: "spamzilla",
                                        username: email,
                                        password: password
                                    });
                                }
                                await settingModel.findOneAndUpdate(null, {
                                    spamzillaCookie: cookie
                                }, {
                                    upsert: true
                                });
                                spamzillaLog.info(`Start session with ${email} successfully.`);
                                res.send('Login successfully.');
                            }
                        });
                    } else {
                        let cookies = await page.cookies();
                        await browser.close(true);
                        let cookie = "";
                        for (let idx in cookies) {
                            cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                        }
                        if (await credentialModel.findOne({ type: "spamzilla" })) {
                            await credentialModel.findOneAndUpdate({ type: "spamzilla" }, {
                                username: email,
                                password: password
                            });
                        } else {
                            await credentialModel.create({
                                type: "spamzilla",
                                username: email,
                                password: password
                            });
                        }
                        await settingModel.findOneAndUpdate(null, {
                            spamzillaCookie: cookie
                        }, {
                            upsert: true
                        });
                        spamzillaLog.info(`Start session with ${email} successfully.`);
                        res.send('Login successfully.');
                    }
                });
                // await browser.close(true);
                // spamzillaLog.error(`Start session with ${email} failed.`);
                // res.status(500).send("Credential is incorrect.");
            } else {
                let cookies = await page.cookies();
                await browser.close(true);
                let cookie = "";
                for (let idx in cookies) {
                    cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                }
                if (await credentialModel.findOne({ type: "spamzilla" })) {
                    await credentialModel.findOneAndUpdate({ type: "spamzilla" }, {
                        username: email,
                        password: password
                    });
                } else {
                    await credentialModel.create({
                        type: "spamzilla",
                        username: email,
                        password: password
                    });
                }
                await settingModel.findOneAndUpdate(null, {
                    spamzillaCookie: cookie
                }, {
                    upsert: true
                });
                spamzillaLog.info(`Start session with ${email} successfully.`);
                res.send('Login successfully.');
            }
        });
    } catch (err) {
        spamzillaLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};