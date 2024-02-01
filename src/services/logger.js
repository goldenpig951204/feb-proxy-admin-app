const path = require("path");
const moment = require("moment");
const winston = require("winston");
require("winston-daily-rotate-file");

const defaultFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.splat(),
    winston.format.printf(msg => `[${msg.level}] ${moment.utc(msg.timestamp).format('DD/MM/YYYY hh:mm:ss')} ${msg.message}`)
);

const serverLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/server-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const semrushLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/semrush-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const spyfuLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/spyfu-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const seolyzeLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/seolyze-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const sistrixLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/sistrix-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const linkcentaurLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/linkcentaur-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const spamzillaLog =  winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/spamzilla-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const seodityLog =  winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/seodity-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const rytrmeLog =  winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/rytrme-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const wordaiLog =  winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/wordai-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const keywordLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/keyword-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const nicheLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/niche-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const pipiadsLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/pipiads-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const keywordkegLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/keywordkeg-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const paraphraserLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/paraphraser-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const buzzsumoLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/buzzsumo-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const articleforgeLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/articleforge-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const bigspyLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/bigspy-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const colinkriLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/colinkri-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const dinorankLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/dinorank-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const yourtextLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/yourtext-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const babbarLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/babbar-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const firstfrLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/firstfr-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const textoptimizerLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/textoptimizer-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const onehourindexingLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/textoptimizer-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const ranxplorerLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/ranxplorer-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const woorankLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/woorank-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const seobserverLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/seobserver-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const affilistingLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/affilisting-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const explodingtopicsLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/explodingtopics-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const localrankerLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/localranker-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const prowritingaidLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/prowritingaid-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const copyscapeLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/copyscape-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const sellthetrendLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/sllthetrend-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const ecomhuntLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/ecomhunt-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const mangoolsLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/mangools-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const spinrewriterLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/spinrewriter-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const pacdoraLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/pacdora-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

const templatemonsterLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/templatemonster-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ]
});

module.exports = {
    serverLog,
    semrushLog,
    spyfuLog,
    seolyzeLog,
    sistrixLog,
    linkcentaurLog,
    spamzillaLog,
    seodityLog,
    rytrmeLog,
    wordaiLog,
    keywordLog,
    nicheLog,
    pipiadsLog,
    keywordkegLog,
    paraphraserLog,
    buzzsumoLog,
    articleforgeLog,
    bigspyLog,
    colinkriLog,
    dinorankLog,
    yourtextLog,
    babbarLog,
    firstfrLog,
    textoptimizerLog,
    onehourindexingLog,
    ranxplorerLog,
    woorankLog,
    seobserverLog,
    affilistingLog,
    explodingtopicsLog,
    localrankerLog,
    prowritingaidLog,
    copyscapeLog,
    sellthetrendLog,
    ecomhuntLog,
    mangoolsLog,
    spinrewriterLog,
    pacdoraLog,
    templatemonsterLog
}