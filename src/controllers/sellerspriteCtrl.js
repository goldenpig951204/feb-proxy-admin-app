const { get } = require("lodash");
const crypto = require("node:crypto");
const dvAxios = require("devergroup-request").default;
const axios = new dvAxios({
    axiosOpt: {
        timeout: 30000
    }
});
const parseHTML = require("jquery-html-parser");
const credentialModel = require("../models/credential");
const settingModel = require("../models/setting");
const { wordaiLog } = require("../services/logger");

const login = async (req, res) => {
    let { email, password } = req.body;
    try {
        const _password = crypto.createHash('md5').update(password).digest('hex');
        const salt = crypto.createHash('md5').update(`${email}${_password}`).digest('hex');
        const body = `callback=&password=${_password}&email=${email}&password_otn=${password}&salt=${salt}`;
        const response = await axios.instance.post(
            "https://www.sellersprite.com/w/user/signin",
            body,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.from(body, 'utf-8'),
                    "Host": "www.sellersprite.com",
                    "Referer": "https://www.sellersprite.com/w/user/signin"
                }
            }
        );
        $ = parseHTML(response.data);
        if ($("title").text() != "Sign In SellerSprite.com") {
            let cookie = axios.cookieJar.getCookieStringSync("https://www.sellersprite.com/v2/welcome");
            if (await credentialModel.findOne({ type: "sellersprite" })) {
                await credentialModel.findOneAndUpdate({
                    type: "sellersprite"
                }, {
                    username: email,
                    password: password
                })
            } else {
                await credentialModel.create({
                    type: "sellersprite",
                    username: email,
                    password: password
                });
            }
            await settingModel.findOneAndUpdate(null, {
                sellerspriteCookie: cookie
            }, {
                upsert: true
            });
            wordaiLog.info(`Start session with ${email} successfully.`);
            res.send("Login successfully.");
        } else {
            res.status(500).send("Credential is incorrect.");
        }
    } catch (err) {
        wordaiLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};