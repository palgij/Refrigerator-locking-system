let express     = require("express"),
    rc522       = require("rc522"),
    middleware  = require("../middleware/auth/regularAuth"),
    sqlFun      = require("../middleware/database/sqlFun/cardReadSqlFun"),
    pass        = require("../middleware/database/sqlFun/adminSqlFun"),
    errorCodes  = require("../middleware/errorCodes"),
    buzzer      = require("../middleware/gpio"),
    email       = require("../middleware/sendMail"),
    router      = express.Router();

let password = async () => {
    let credentials = await pass.getCredentials('admin', console.log);
    return credentials[0].salasona
};

// Viipa kaarti
router.get("/", (req, res) => {
    if (req.query.id !== undefined) {
        middleware.removeUser(req.query.id);
    }
    res.render("home");
});

// Tahetakse kaarti viibata
router.get("/kaart", (req, res, next) => {
    rc522.init();
    let timeout = setTimeout(() => {
        rc522.child()
        let error = new Error(errorCodes.NO_CARD_ERROR.message);
        error.statusCode = errorCodes.NO_CARD_ERROR.code;
        next(error);
    }, 10000);

    // Kaardi viipamise ootamine
    rc522.read(async (serial) => {
        clearTimeout(timeout);      
        buzzer.ring();
        rc522.child();
        let kasutaja = await sqlFun.kasutajaKaardiLugemisel(next, serial);
        if (kasutaja === -1) return;

        // Andmebaasis leidus kasutaja
        if (kasutaja.length > 0) {
            // Kasutaja on kinnitatud, on kas Tavaline või Juthser
            if (kasutaja[0].admin_on_kinnitanud === 1 && (kasutaja[0].kasutaja_seisu_id === 1 || kasutaja[0].kasutaja_seisu_id === 2)) {
                middleware.addUserCard(serial);
                // Rebane või tava kasutaja
                if (kasutaja[0].kasutaja_staatuse_id === 1) res.redirect("/tooted/" + serial + "/paneKirja");
                else res.redirect("/tooted/" + serial);
            } else {
                // Kas kasutaja kinnitamata või on kasutaja on väljalangenu
                if (kasutaja[0].admin_on_kinnitanud === 0) {
                    let err = new Error(errorCodes.ADMINI_KINNITUS_PUUDUB.message);
                    err.statusCode = errorCodes.ADMINI_KINNITUS_PUUDUB.code;
                    next(err);
                } else {
                    let err = new Error(errorCodes.VÄLJALANGENU.message);
                    err.statusCode = errorCodes.VÄLJALANGENU.code;
                    next(err);
                }
            }
        // Uus kaardi id -> uus kasutaja
        } else {
            res.redirect("/registreeri/" + serial);
        }
    });
});

// Registreerimis vaade, uus kaart
router.get("/registreeri/:id", (req, res) => {
    let id = req.params.id;
    res.render("registreeri", {id: id});
});

// Kinnita kasutaja vaade, meilist päritakse
router.get("/kinnitaKasutaja/:id", async (req, res, next) => {
    if (getIndexOfUserId(req.params.id) !== -1) {
        let kasutaja = await sqlFun.kasutajaCardID(next, req.params.id);
        if (kasutaja === -1) return;

        res.render("kinnitaKasutaja", {kasutaja: kasutaja[0], id: req.params.id});
    } else {
        let err = new Error(errorCodes.MAIL_ALREADY_CONFIRMED.message);
        err.statusCode = errorCodes.MAIL_ALREADY_CONFIRMED.code;
        next(err);
    }
});

// Kinnita kasutaja, vastavast vaates kutsutakse
router.put("/kinnitaKasutaja/:id", async (req, res, next) => {
    // Kinnita kasutaja ainult siis kui leidub kaardi id arrayst
    if (removeUserId(req.params.id)) {
        if (req.body.password === await password()) {
            if (await sqlFun.kinnitaKasutaja(req.params.id, next) === -1) return;
            
            req.flash("SUCCESS2", "Kasutaja on kinnitatud!", "/");
        } else {
            email.userIds.push(req.params.id);
            let err = new Error(errorCodes.WRONG_PASSWORD_KINNITAMINE.message);
            err.statusCode = errorCodes.WRONG_PASSWORD_KINNITAMINE.code;
            err.url = `/kinnitaKasutaja/${req.params.id}`;
            next(err);
        }
    } else {
        let err = new Error(errorCodes.MAIL_ALREADY_CONFIRMED.message);
        err.statusCode = errorCodes.MAIL_ALREADY_CONFIRMED.code;
        next(err);
    }
});

// Kasutaja registreerimine süsteemi
router.post("/registreeri/:id", async (req, res, next) => {
    let uusKasutaja = {
        id: req.params.id,
        eesnimi: req.body.eesnimi,
        perenimi: req.body.perenimi,
        staatus: parseFloat(req.body.staatuse_id),
        coetus: req.body.coetus
    };

    let staatuseNimetus = await sqlFun.registreeriKasutaja(uusKasutaja, next);
    if (staatuseNimetus === -1) return;

    // Anna bibendile teada uue kasutaja registreerimisest asünkroonselt
    let nimi = `Nimi - ${uusKasutaja.eesnimi} ${uusKasutaja.perenimi}`;
    let staatus = `Staatus - ${staatuseNimetus}`;
    let coetusTxt = `Coetus - ${uusKasutaja.coetus}`;
    let link = `http://192.168.1.243:3000/kinnitaKasutaja/${uusKasutaja.id}`;
    let html = `<p><h1>Uus kasutaja vajab kinnitamist!</h1><ul><li>${nimi}</li><li>${staatus}</li><li>${coetusTxt}</li>
    </ul><a href="${link}" type="button">Kinnita kasutaja, vajuta siia</a></p>`;
    email.sendMail("Uus Kasutaja registreeris ennast süsteemi", html, uusKasutaja.id);
    req.flash("SUCCESS2", "Registreerimine õnnestus! Oota Bibendi kinnitust.", "/");
});

module.exports = router;

// =============================================

let removeUserId = (id) => {
    let pos = getIndexOfUserId(id);
    if (pos !== -1) {
        email.userIds.splice(pos, 1);
        return true;
    } else return false;
};

let getIndexOfUserId = id => email.userIds.findIndex(elem => elem === id);
