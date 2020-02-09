let bodyParser		= require("body-parser"),
    express     	= require("express"),
    flash       	= require("express-flash-notification"),
    session     	= require("express-session"),
    database    	= require("./middleware/database/databaseConnection"),
    auth        	= require("./middleware/auth/basicAuth"),
    errorCodes  	= require("./middleware/errorCodes"),
    morgan      	= require("morgan"),
    requestIp   	= require("request-ip"),
    helmet		    = require("helmet"),
    methodOverride 	= require('method-override'),
    app         	= express();

//This line add the authentication requirement to all pages starting with localhost:3000/
app.all("/*", auth);

//app.use(morgan('tiny'));
app.use(requestIp.mw());
app.use(helmet());
app.use(methodOverride('_method'));

// ============ ROUTES ============

let ostmineRoutes   = require("./routes/ostmine"),
    regularCardRead = require("./routes/regularCardRead"),
    adminRoutes     = require("./routes/admin/admin"),
    adminKasutajad  = require("./routes/admin/adminKasutajad"),
    adminTooted     = require("./routes/admin/adminTooted");

// ============ APP USE ============

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.disable("view cache");

app.use(session({
    secret: 'Kapilukk on väga salajane!',
    resave: false,
    saveUninitialized: false
}));

// ============ FLASH ============

const flashNotificationOptions = {
    beforeSingleRender: function(item, callback) {
        if (item.type) {
            switch(item.type) {
                case 'SUCCESS':
                    item.type = 'SUCCESS';
                    item.alertClass = 'alert-successs';
                    break;
                case 'ERROR':
                    item.type = 'ERROR';
                    item.alertClass = 'alert-dangerr';
                    break;
            }
        }
        callback(null, item);
    }
};

// Flash Notification Middleware Initialization
app.use(flash(app, flashNotificationOptions));

// ============ SERVER LISTENING TO ROUTES ============

app.use("/tooted/:id", ostmineRoutes);
app.use(regularCardRead);
app.use("/admin", adminRoutes);
app.use("/admin/kasutajad", adminKasutajad);
app.use("/admin/tooted", adminTooted)

let server = app.listen(3000, function(){
    console.log("Server is listening to port 3000! (ip:3000)");
});

// ============ ERRORS ============

app.get("*", function(req, res, next) {
    let err = new Error(`${errorCodes.NO_SUCH_PAGE.message} ${req.originalUrl}`);
    err.statusCode = errorCodes.NO_SUCH_PAGE.code;
    next(err);
});

app.use((err, req, res, next) => {
    console.error(`ERROR: "${err.message}"`);
    if (!err.statusCode) err.statusCode = 500;

    // Igal erroril on oma handling, et kuhu suunab kasutaja vms ja kuidas.
    switch(err.statusCode) {
        case errorCodes.NO_SUCH_PAGE_IN_OSTUD.code:
        case errorCodes.GET_TOOTED_ERROR.code:
            req.flash("ERROR", err.message, "/admin/ostud");
            break;
        case errorCodes.NO_SUCH_PAGE_IN_LAO_MUUTUSED.code:
            req.flash("ERROR", err.message, "/admin/muutused/ladu");
            break;
        case errorCodes.NO_SUCH_PAGE_IN_KASUTAJATE_MUUTUSED.code:
            req.flash("ERROR", err.message, "/admin/muutused/kasutajad");
            break;
        case errorCodes.NO_SUCH_PAGE.code:
	        if (req.url.includes("admin"))
		        req.flash("ERROR", err.message, "/admin/kodu");
	        else
		        req.flash("ERROR", err.message, "/");
            break;
        case errorCodes.IP_SESSIOON_AEGUNUD.code:
        case errorCodes.WRONG_PASSWORD.code:
            req.flash("ERROR", err.message, "/admin");
            break;
        case errorCodes.TOODETE_TOP_ERROR.code:
        case errorCodes.KASUTAJATE_TOP_ERROR.code:
	    case errorCodes.BIBENDI_MAIL_ERROR.code:
	    case errorCodes.REBASTE_OLLED_ERROR.code:
            req.flash("ERROR", err.message, "/admin/kodu");
            break;
        case errorCodes.GET_KASUTAJAD_ERROR.code:
        case errorCodes.GET_KASUTAJA_ERROR.code:
        case errorCodes.DELETE_KASUTAJA_ERROR.code:
        case errorCodes.UPDATE_KASUTAJA_ERROR.code:
        case errorCodes.GET_STAATUS_ERROR.code:
            req.flash("ERROR", err.message, "/admin/kasutajad");
            break;
        case errorCodes.GET_TOODE_ERROR.code:
        case errorCodes.GET_JOOGID_ERROR.code:
        case errorCodes.GET_SOOGID_ERROR.code:
        case errorCodes.DELETE_TOODE_ERROR.code:
        case errorCodes.UPDATE_TOODE_ERROR.code:
        case errorCodes.INSERT_TOODE_ERROR.code:
            req.flash("ERROR", err.message, "/admin/tooted");
            break;
	    case errorCodes.ER_DUP_ENTRY_TOODE.code:
	        req.flash("ERROR", errorCodes.ER_DUP_ENTRY_TOODE.message, "/admin/tooted");
            break;
	    case errorCodes.NULLI_VOLAD_ERROR.code:
        case errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.code:
        case errorCodes.INSERT_TOOTE_MUUTUS_ERROR.code:
        case errorCodes.GET_OSTUD_ERROR.code:
        case errorCodes.GET_KASUTAJATE_MUUTUSED_ERROR.code:
        case errorCodes.GET_TOODETE_MUUTUSED_ERROR.code:
	    case errorCodes.GET_KOIK_TOOTED_ERROR.code:
	    case errorCodes.LOCK_STATE_FETCH_FAILED.code:
	    case errorCodes.INSERT_KUU_LOPP_ERROR.code:
            req.flash("ERROR", err.message, req.headers.referer.split("3000")[1]);
            break;
        case errorCodes.KAARDI_SESSIOON_AEGUNUD.code:    
        case errorCodes.VÄLJALANGENU.code:
        case errorCodes.ADMINI_KINNITUS_PUUDUB.code:
            req.flash("ERROR", err.message, "/");
            break;
        case errorCodes.SOOK_JOOK_ERROR.code:
        case errorCodes.KASUTAJA_ERROR_OST.code:
        case errorCodes.KASUTAJATE_ERROR_OST.code:
        case errorCodes.VIIMASE_12H_KASUTAJATE_ERROR.code:
        case errorCodes.TOOTE_HINNA_ERROR.code:
        case errorCodes.TOOTE_KATEGOORIA_ERROR.code:
        case errorCodes.VÕLA_STAATUSE_ERROR.code:
        case errorCodes.UPDATE_VOLG_ERROR.code:
        case errorCodes.TOOTE_KOGUS_ERROR.code:
        case errorCodes.UPDATE_KOGUS_ERROR.code:
        case errorCodes.INSERT_OST_ERROR.code:
	    case errorCodes.MAIL_ALREADY_CONFIRMED.code:
        case errorCodes.GET_STAATUS_REGISTREERIMINE_ERROR.code:
        case errorCodes.INSERT_KASUTAJA_ERROR.code:
        case errorCodes.REGISTREERIMINE_INSERT_KASUTAJA_MUUTUS_ERROR.code:
        case errorCodes.KASUTAJA_NIME_ERROR.code:
        case errorCodes.KINNITA_KASUTAJA_ERROR.code:
        case errorCodes.GET_KASUTAJA_KAART_ERROR.code:
	    case errorCodes.NO_CARD_ERROR.code:
            req.flash("ERROR", err.message, "/");
            break;
	    case errorCodes.WRONG_PASSWORD_KINNITAMINE.code:
	        req.flash("ERROR", err.message, err.url);
	        break;
	    case errorCodes.CREDENTIALS_FAILED.code:
            req.flash("ERROR", err.message, req.headers.referer.split("3000")[1]);
            break;
        default:
            res.status(err.statusCode).send(err.message);
    }
});