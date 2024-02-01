const settingModel = require("../models/setting");
// const dvAxios = require("devergroup-request").default;
// const axios = new dvAxios({
//     axiosOpt: {
//         timeout: 30000
//     }
// });
const credentialModel = require("../models/credential");
const { dinorankLog } = require("../services/logger");
const { get } = require("lodash");
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
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--media-cache-size=0",
          "--disk-cache-size=0",
          "--ignore-certificate-errors",
          "--ignore-certificate-errors-spki-list",
        ],
        timeout: 100000,
      };
    } else {
      options = {
        headless: false,
        timeout: 100000,
        args: [
          "--ignore-certificate-errors",
          "--ignore-certificate-errors-spki-list",
        ],
      };
    }
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.goto('https://dinorank.com/en/login/', { waitUntil: 'load', timeout: 100000});
    await page.focus("#usuario").then(async () => {
        await page.keyboard.type(email, { delay: 100 })
    })
    await page.focus("#password").then(async () => {
        await page.keyboard.type(password, { delay: 100 })
    })
    await page.click("#permanecer")

    await Promise.all([
        page.waitForNavigation({waitUntil: 'load', timeout: 100000 }),
         page.click("#botonLogin")
    ]).then(async (result) => {
        if (/\/homed\//.test(page.url())) {
            const cookies = await page.cookies()
            await browser.close(true);
            let cookie = ''
            for (let idx in cookies) {
                cookie += cookies[idx].name + '=' + cookies[idx].value + '; '
            }
            if (await credentialModel.findOne({ type: 'dinorank' })) {
                await credentialModel.findOneAndUpdate({ type: 'dinorank' }, {
                    username: email,
                    password: password
                })
            } else {
                await credentialModel.create({
                    type: 'dinorank',
                    username: email,
                    password: password
                })
            }
            await settingModel.findOneAndUpdate(null, {
                dinorankCookie: cookie
            }, {
                upsert: true
            })
            dinorankLog.info(`Start session with ${email} successfully.`)
            res.send('Login successfully.')
        } else {
            await browser.close(true);
            dinorankLog.error(`Start session with ${email} failed: ${get(err, 'response.data.message') || err.message}`);
            res.status(500).send("Credential is incorrect.");    
        }
    })
  } catch (err) {
    dinorankLog.error(
      `Start session with ${email} failed: ${
        get(err, "response.data.message") || err.message
      }`
    );
    res.status(500).send(get(err, "response.data.message") || err.message);
  }
  // https://dinorank.com/ajax/login.php
  // try {
  //     let body = `nombreUsuario=${email}&clave=${password}&permanecer=si&elemento=`;
  //     let response = await axios.instance.post(
  //         "https://dinorank.com/ajax/login.php",
  //         body,
  //         {
  //             headers: {
  //                 "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
  //                 "content-type": "application/x-www-form-urlencoded",
  //                 "content-length": Buffer.byteLength(body),
  //             }
  //         }
  //     );
  //     if (response.data.status === "activo") {
  //         console.log("URL====>", response.data.message);
  //         let cookie = axios.cookieJar.getCookieStringSync(response.data.message);
  //         console.log("COOKIE=====>", cookie);
  //         await settingModel.findOneAndUpdate(null, {
  //             dinorankCookie: cookie
  //         }, {
  //             upsert: true
  //         });
  //         dinorankLog.info(`Start session with ${email} successfully.`);
  //         res.send('Login successfully.');
  //     } else {
  //         res.status(500).send('Credential is incorrect.');
  //     }
  // } catch (err) {
  //     dinorankLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.message}`);
  //     res.status(500).send(get(err, "response.data.message") || err.message);
  // }
};

module.exports = {
  login,
};
