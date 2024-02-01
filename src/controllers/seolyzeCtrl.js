const { get } = require("lodash");
const settingModel = require("../models/setting");
const credentialModel = require('../models/credential');
const { seolyzeLog } = require("../services/logger");
const puppeteer = require('puppeteer-extra');
// const dvAxios = require("devergroup-request").default;
// const axios = new dvAxios({
//     axiosOpt: {
//         timeout: 30000
//     }
// });

const login = async (req, res) => {
    let { username, password } = req.body;
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
        await page.goto('https://seolyze.com/en');
        // const loginBtn = await page.$(".navlogin > a");
        // if (loginBtn) {
        //     await page.click('.navlogin > a');
        // } else {
        await page.click(".navbar-toggle");
        await page.click('.navlogin > a');
        // }
        await page.waitForSelector('#login.modal');
        await page.focus('#username').then(async () => {
            await page.keyboard.type(username, { delay: 100 });
        });
        await page.focus('#password').then(async () => {
            await page.keyboard.type(password, { delay: 100 });
        });
        await page.click('#stay_logged');

        await Promise.all([
            page.click("button#regButton"),
            page.waitForNavigation({ waitUntil: 'load', timeout: 100000 })
        ]).then(async (result) => {
            if (page.url() == 'https://www.seolyze.com/en/EPS-KF/') {
                let cookies = await page.cookies();
                await browser.close(true);
                let cookie = '';
                for (let idx in cookies) {
                    cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                }
                if (await credentialModel.findOne({ type: "seolyze" })) {
                    await credentialModel.findOneAndUpdate({ type: "seolyze" }, {
                        username: username,
                        password: password
                    });
                } else {
                    await credentialModel.create({
                        type: "seolyze",
                        username: username,
                        password: password
                    });
                }
                await settingModel.findOneAndUpdate(null, {
                    seolyzeCookie: cookie
                }, {
                    upsert: true
                });
                seolyzeLog.info(`Start session with ${username} successfully.`);
                res.send('Login successfully.');
            } else {
                await browser.close(true);
                seolyzeLog.error(`Start session with ${username} failed.`);
            }
        })
    } catch (err) {
        seolyzeLog.error(`Start session with ${username} failed. ${get(err, 'response.data.message') || err.toString()}`);
        res.status(500).send(get(err, 'response.data.message') || err.toString());
    }

    // try {
    //     let body = `username=${username}&password=${password}&stay_logged=1`;
    //     let { data } = await axios.instance.post(
    //         "https://www.seolyze.com/php_bin/security/login.php",
    //         body, 
    //         {
    //             headers: {
    //                 "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
    //                 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    //                 'content-length': Buffer.byteLength(body),
    //                 'referer': 'https://www.seolyze.com/en',
    //                 'x-requested-with': 'XMLHttpRequest',
    //             }
    //         }
    //     );
    //     if (typeof data.action !== "undefined") {
    //         let cookie = axios.cookieJar.getCookieStringSync("https://www.seolyze.com");
    //         cookie +=   "; langCookie=en";
    //         await settingModel.findOneAndUpdate(null, { 
    //             seolyzeCookie: cookie 
    //         }, {
    //             upsert: true
    //         });
    //         seolyzeLog.info(`Start session with ${username} successfully.`);
    //         res.send("Login successfully.");
    //     } else {
    //         res.status(500).send("Credential is incorrect.");
    //     }
    // } catch (err) {
    //     seolyzeLog.error(`Start session with ${username} failed: ${get(err, "response.data.message") || err.toString()}`);
    //     res.status(500).send(get(err, "response.data.message") || err.toString());
    // }
}

module.exports = {
    login
};