// const settingModel = require("../models/setting");
// const { wordaiLog } = require("../services/logger");
// const { get } = require("lodash");
// const dvAxios = require("devergroup-request").default;
// const parseHTML = require("jquery-html-parser");
// const axios = new dvAxios({
//     axiosOpt: {
//         timeout: 30000
//     }
// });

// const login = async (req, res) => {
//     let { email, password } = req.body;
//     try {
//         let response = await axios.instance.get("https://wai.wordai.com/users/sign_in");
//         let cookie = response.headers["set-cookie"][0];
//         let $ = parseHTML(response.data);
//         let authenticityToken = $("meta[name='csrf-token']").attr("content");
//         console.log(cookie, authenticityToken, email, password);
//         let body = `authenticity_token=${authenticityToken}&user[email]=${email}&user[password]=${password}&user[remember_me]=0`;
//         response = await axios.instance.post(
//             "https://wai.wordai.com/users/sign_in",
//             body,
//             {
//                 headers: {
//                     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
//                     "Content-Type": "application/x-www-form-urlencoded",
//                     "Content-Length": Buffer.byteLength(body),
//                     "Cookie": cookie,
//                     "Host": "wai.wordai.com",
//                     "Origin": "https://wai.wordai.com",
//                     "Referer": "https://wai.wordai.com/users/sign_in"
//                 }
//             }
//         );
//         if (response.status == 200) {
//             cookie = axios.cookieJar.getCookieStringSync("https://wai.wordai.com");
//             await settingModel.findOneAndUpdate(null, {
//                 wordaiCookie: cookie
//             }, {
//                 upsert: true
//             });
//             wordaiLog.info(`Start session with ${email} successfully.`);
//             res.send("Login successfully.");
//         } else {
//             res.status(500).send("Credential is incorrect.");
//         }
//     } catch (err) {
//         console.log(err);
//         wordaiLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.toString()}`);
//         res.status(500).send(get(err, "response.data.message") || err.toString());
//     }
// }

// module.exports = {
//     login
// };

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
        await page.goto("https://wai.wordai.com/users/sign_in");
        await page.focus("#user_email").then(async () => {
            await page.keyboard.type(email, { delay: 100 });
        });
        await page.focus("#user_password").then(async () => {
            await page.keyboard.type(password, { delay: 100 });
        });
        await Promise.all([
            page.click("button[type='submit']"),
            page.waitForNavigation({waitUntil: 'load', timeout : 100000})
        ]).then(async (result) => {
            if (page.url() === "https://wai.wordai.com/") {
                let cookies = await page.cookies();
                await browser.close(true);
                let cookie = "";
                for (let idx in cookies) {
                    cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                }
                if (await credentialModel.findOne({ type: "wordai" })) {
                    await credentialModel.findOneAndUpdate({
                        type: "wordai"
                    }, {
                        username: email,
                        password: password
                    })
                } else {
                    await credentialModel.create({
                        type: "wordai",
                        username: email,
                        password: password
                    });
                }
                await settingModel.findOneAndUpdate(null, {
                    wordaiCookie: cookie
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