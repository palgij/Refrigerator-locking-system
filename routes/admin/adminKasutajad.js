let express     = require("express"),
    middleware  = require("../../middleware/auth/adminAuth"),
    sqlFun      = require("../../middleware/database/sqlFun/adminSqlFun"),
    router      = express.Router();

let lockClosed = async (next) => {
    let lockState = await sqlFun.getLockState(next);
    return lockState[0].lukk_kinni === 1
};

// Kasutajate tabel
router.get("/", middleware.checkIpSessionValid, async (req, res, next) => {
    let kasutajad = await sqlFun.getKasutajad(next);
    if (kasutajad === -1) return;
    
    res.render("admin/kasutajad", {kasutajad: kasutajad, lockClosed: await lockClosed(console.log)});
});

// Nulli võlad
router.put("/", middleware.checkIpSessionValid, async (req, res, next) => {
    if (await sqlFun.nulliVolad(next, "võlgade nullimine") === -1) return;

    req.flash("SUCCESS", "Võlad said nullitud.", req.headers.referer.split("3000")[1]);
});

// Muuda kasutajat
router.put("/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    let kasutaja = await sqlFun.getKasutaja(req.params.id, next);
    if (kasutaja === -1) return;
    
    let arr = [];
    let fields = {
        id          : req.params.id,
        eesnimi     : req.body.eesnimi,
        perenimi    : req.body.perenimi,
        volg        : parseFloat(req.body.volg).toFixed(2),
        kinnitatud  : !!req.body.check,
        seisus      : parseFloat(req.body.seis),
        staatus     : parseFloat(req.body.staatus)
    };

    // Kontrolli kas väljasid muudeti
    if (fields.seisus !== kasutaja[0].kasutaja_seisu_id) arr.push("seisus");
    if (fields.staatus !== kasutaja[0].kasutaja_staatuse_id) arr.push("staatus");
    if (fields.eesnimi !== kasutaja[0].eesnimi) arr.push("eesnimi");
    if (fields.perenimi !== kasutaja[0].perenimi) arr.push("perenimi");
    if (fields.volg !== parseFloat(kasutaja[0].volg).toFixed(2)) arr.push("volg");
    if (fields.kinnitatud != kasutaja[0].admin_on_kinnitanud) arr.push("kinnitanud");

    // Kui väljasid muudeti, siis muuda kasutajat
    if (arr.length !== 0 && arr.length !== undefined) {
        if (await sqlFun.updateKasutaja(next, fields, arr) === -1) return;
        
        req.flash("SUCCESS", "Kasutaja andmed said muudetud.", "/admin/kasutajad");
    } else 
        res.redirect("/admin/kasutajad"); 
});

// Muuda kasutajat vaade
router.get("/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    let kasutaja = await sqlFun.getKasutaja(req.params.id, next);
    if (kasutaja === -1) return;
    
    res.render("admin/muuda", {kasutaja: kasutaja[0], lockClosed: await lockClosed(console.log)});
});

// Kustuta kasutaja
router.delete("/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    if (await sqlFun.deleteKasutaja(req, next) === -1) return;
    
    req.flash("SUCCESS", "Kasutaja sai kustutatud.", "/admin/kasutajad");
});

module.exports = router;