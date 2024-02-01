const { get } = require("lodash");
const credentialModel = require("../models/credential");
const settingModel = require("../models/setting");
const { woorankLog } = require("../services/logger");
const puppeteer = require("puppeteer-extra");
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const dvAxios = require("devergroup-request").default;
const captcha = require("2captcha");
const axios = new dvAxios({
    axiosOpt: {
        timeout: 30000
    }
});

const login = async (req, res) => {
    let { email, password } = req.body;
    try {
        let siteKey = "6LfZji4hAAAAAPLOsr8TFnm-VuwMbf3jgLJgHFcX";
        let solver = new captcha.Solver(process.env.TWO_CAPTCHA_KEY);
        let response = await solver.recaptcha(siteKey, "https://www.woorank.com/en/login");
        let body = JSON.stringify({
            email,
            password,
            "g-recaptcha-response": response.data
        });
        let { data } = await axios.instance.post(
            "https://www.woorank.com/api/user/login",
            body,
            {
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json",
                    "content-length": Buffer.from(body, 'utf-8'),
                }
            }
        );
        if (data.status) {
            let cookie = axios.cookieJar.getCookieStringSync("https://www.woorank.com/en/overview");
            if (await credentialModel.findOne({type: "woorank"})) {
                await credentialModel.findOneAndUpdate({type: "woorank"}, {
                    username: email,
                    password: password
                });
            } else {
                await credentialModel.create({
                    type: "woorank",
                    username: email,
                    password: password
                });
            }
            await settingModel.findOneAndUpdate(null, {
                woorankCookie: cookie
            }, {
                upsert: true
            });
            woorankLog.info(`Start session with ${email} successfully.`);
            res.send("Login successfully.");
        } else {
            woorankLog.errror(`Start session with ${email} failed.`);
            res.status(500).send('Credential is incorrect.');
        }
        // puppeteer.use(
        //     RecaptchaPlugin({
        //       provider: {
        //         id: '2captcha',
        //         token: '1cca50f7c9ce7bacaa1cb447e3ec2bbd' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
        //       },
        //       visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
        //     })
        //   )
        // const windowsLikePathRegExp = /[a-z]:\\/i;
        // let inProduction = false;

        // if (! windowsLikePathRegExp.test(__dirname)) {
        //     inProduction = true;
        // }
        // let options = {};
        // if (inProduction) {
        //     options = {
        //         headless : true,
        //         args: [
        //             '--no-sandbox',
        //             '--disable-setuid-sandbox',
        //             '--disable-dev-shm-usage',
        //             '--media-cache-size=0',
        //             '--disk-cache-size=0',
        //             '--ignore-certificate-errors',
        //             '--ignore-certificate-errors-spki-list',
        //         ],
        //         timeout: 200000,
        //     };
        // } else {
        //     options = {
        //         headless : false,
        //         timeout: 200000,
        //         args: [
        //             '--ignore-certificate-errors',
        //             '--ignore-certificate-errors-spki-list',
        //         ],
        //     };
        // }
        // const browser = await puppeteer.launch(options);
        // const page = await browser.newPage();
        // await page.goto("https://www.woorank.com/en/login");
        // await page.solveRecaptchas();
        // await page.focus("#email").then(async () => {
        //     await page.keyboard.type(email, { delay: 100 });
        // });
        // await page.focus("#password").then(async () => {
        //     await page.keyboard.type(password, { delay: 100 });
        // });
        // await Promise.all([
        //     page.click("button[type='submit'"),
        //     page.waitForNavigation({waitUntil: 'load', timeout : 100000})
        // ]).then(async (result) => {
        //     if (page.url() === "https://www.woorank.com/en/overview") {
        //         let cookies = await page.cookies();
        //         await browser.close(true);
        //         let cookie = "";
        //         for (let idx in cookies) {
        //             cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
        //         }
        //         if (await credentialModel.findOne({type: "woorank"})) {
        //             await credentialModel.findOneAndUpdate({type: "woorank"}, {
        //                 username: email,
        //                 password: password
        //             });
        //         } else {
        //             await credentialModel.create({
        //                 type: "woorank",
        //                 username: email,
        //                 password: password
        //             });
        //         }
        //         await settingModel.findOneAndUpdate(null, {
        //             woorankCookie: cookie
        //         }, {
        //             upsert: true
        //         });
        //         woorankLog.info(`Start session with ${email} successfully.`);
        //         res.send("Login successfully.");
        //     } else {
        //         await browser.close(true);
        //         woorankLog.errror(`Start session with ${email} failed.`);
        //         res.status(500).send('Credential is incorrect.');
        //     }
        // });
    } catch (err) {
        woorankLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};