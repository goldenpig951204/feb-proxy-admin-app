const credentialModel = require("../models/credential");
const settingModel = require("../models/setting");
const dvAxios = require("devergroup-request").default;
const axios = new dvAxios({
  axiosOpt: {
    timeout: 30000,
  },
});
const parseHTML = require("jquery-html-parser");
const { buzzsumoLog } = require("../services/logger");
const { get } = require("lodash");
const puppeteer = require('puppeteer')

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
    await page.goto("https://app.buzzsumo.com/login");

    const element = await page.$("#consent-manager button:nth-child(2)");
    if (element !== null) {
      await page.click("#consent-manager button:nth-child(2)");
    }
    await page.focus("input[name='email']").then(async () => {
      await page.keyboard.type(email, { delay: 500 });
    });
    await page.focus("input[name='password']").then(async () => {
      await page.keyboard.type(password, { delay: 500 });
    });
    await Promise.all([
      page.click("button[type='submit']"),
      page.waitForNavigation({ waitUntil: "load", timeout: 100000 }),
    ]).then(async (result) => {
        await page.waitForTimeout(3000);
        if (page.url() !== 'https://app.buzzsumo.com/login') {
            let cookies = await page.cookies();
            await browser.close(true);
            let cookie = '';
            for (let idx in cookies) {
                cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
            }

            if (await credentialModel.findOne({ type: "buzzsumo" })) {
                await credentialModel.findOneAndUpdate({
                    type: "buzzsumo"
                }, {
                    username: email,
                    password: password
                })
            } else {
                await credentialModel.create({
                    type: "buzzsumo",
                    username: email,
                    password: password
                })
            }
            await settingModel.findOneAndUpdate(null, {
                buzzsumoCookie: cookie
            }, {
                upsert: true
            })
            buzzsumoLog.info(`Start session with ${email} successfully.`);
            return res.send('Login successfully.')
        } else {
            return res.status(500).send('Credential is incorrect.')
        }
    });
  } catch (err) {
    console.log(err);
    buzzsumoLog.error(
      `Start session with ${email} failed: ${
        get(err, "response.data.message") || err.toString()
      }`
    );
    res.status(500).send(get(err, "response.data.message") || err.toString());
  }
};

module.exports = {
  login,
};
