let rpio        = require("../middleware/gpio"),
    express     = require("express"),
    middleware  = require("../middleware/regularAuth"),
    sqlFun      = require("../middleware/sqlFun"),
    router      = express.Router({mergeParams: true});

router.get("/", middleware.checkUserSessionValid, async (req, res, next) => {
    let id = req.params.id;
    let results;
    if (id.includes('"')) {
	    let arr = id.split('"');
	    id = arr[0] // rebase id
        middleware.getUsers(id).newId = arr[1];
        middleware.getUsers(id).reb = true;
        results = await sqlFun.getTootedJaKasutaja(arr[1], next);
    } else results = await sqlFun.getTootedJaKasutaja(id, next);
    
    if (result !== -1) {
    	let nimi = results[6][0].nimetus + " " + results[6][0].eesnimi + " " + results[6][0].perenimi;
    	middleware.getUsers(id).nimi = nimi; 
    	res.render("tooted", {id: id, reb: !!middleware.getUsers(id).reb, jook1: results[0], jook2: results[1], jook3: results[2], jook4: results[3],
				sook5: results[4], sook6: results[5], nimi: nimi, seis: results[6][0].kasutaja_seisu_id});
    }
});

router.get("/paneKirja", middleware.checkUserSessionValid, async (req, res, next) => {
    let id = req.params.id;  
    let kasutajad = await sqlFun.kasutajadPaneKirja(id, next);
    if (kasutajad !== -1) {
	let viimased12hKasutajad = await sqlFun.viimase12hKasutajad(id, next);

	if (viimased12hKasutajad !== -1) {
    	    let uusKasutajad = [];
    	    let str = "";
    	    let num = -1;
    	    kasutajad.forEach((kasutaja) => {
	    	if (str !== kasutaja.coetus) {
	    	    str = kasutaja.coetus;
	    	    num++;
	    	    uusKasutajad.push([]);
	    	}
	    	uusKasutajad[num].push(kasutaja);
    	    });
    	    res.render("paneKirja", {kasutajad: uusKasutajad, rebId: id, viimane12h: viimased12hKasutajad});
	}
    }
});

router.get("/:toode/", middleware.checkUserSessionValid, async (req, res, next) => {
    let toode = req.params.toode;
    let id = req.params.id;
    let hind = await sqlFun.myygiHindNim(toode, next);
    if (hind !== -1) {
	let nimi = middleware.getUsers(id).nimi;

    	middleware.getUsers(id).hind = hind[0].myygi_hind;
    	res.render("kogus", {id: id, reb: !!middleware.getUsers(id).reb, newId: middleware.getUsers(id).newId, toode: toode, 
				hind: hind[0].myygi_hind, nimi: nimi});
    }
});

router.post("/:toode", middleware.checkUserSessionValid, async (req, res, next) => {
    let hind = middleware.getUsers(req.params.id).hind;
    if (hind !== -1) {
    	let kategooria;
    	let volg;
    	let ost = {
            toode   : req.params.toode,
            id      : req.params.id,
            kogus   : parseFloat(req.body.kogus),
            summa   : hind * parseFloat(req.body.kogus),
            nimi    : middleware.getUsers(req.params.id).nimi,
            tasuta  : false
        };
    	let result = await sqlFun.tooteKategooriaID(ost.toode, next);
	if (result !== -1) {
    	    kategooria = result[0].toote_kategooria_id;

    	    console.log("========== LISA SUMMA KASUTAJA VÕLGA ==========");
    	    if (!!middleware.getUsers(ost.id).reb) result = await sqlFun.volgStaatusID(middleware.getUsers(ost.id).newId, next);
    	    else result = await sqlFun.volgStaatusID(ost.id, next);
    	    
	    if (result !== -1) {
	    	console.log(`Kogus: ${ost.kogus} | hind: ${hind} | kokku: ${ost.summa} | (1 == reb!) ${result[0].kasutaja_staatuse_id}`);
    	    	console.log(`Võlg enne: ${parseFloat(result[0].volg)}`);
    		volg = parseFloat(result[0].volg);
    		if (result[0].kasutaja_staatuse_id === 1 && (kategooria === 1 || kategooria === 2)) {
        	    ost.tasuta = true;
        	    console.log("Võlg sama mis enne - !reb");
    		} else {
        	    volg += ost.summa;
        	    console.log(`Võlg uus: ${volg}`);
    		    if (!!middleware.getUsers(ost.id).reb) result = await sqlFun.updateVolgID(middleware.getUsers(ost.id).newId, volg, next);
        	    else result = await sqlFun.updateVolgID(ost.id, volg, next);
    		}
		if (result !== -1) {
    		    console.log("========== MUUDA TOOTE KOGUST ==========");
    		    result = await sqlFun.hetkeKogusNimetus(ost.toode, next);
		    if (result !== -1) {
			let total = parseFloat(result[0].hetke_kogus) - ost.kogus;
    			console.log(`Vana kogus: ${result[0].hetke_kogus} | Uus kogus: ${total}`);
    			if (await sqlFun.updateKogusNimetus(total, ost.toode, next) !== -1) {
    			    console.log("========== LISA OST ANDMEBAASI ==========");
    			    if (!!middleware.getUsers(ost.id).reb) console.log(`Toode: ${ost.toode} | Ostja: reb! -> ${ost.nimi}`);
    			    else console.log(`Toode: ${ost.toode} | Ostja: ${ost.nimi}`);
    			    if (await sqlFun.lisaOst(ost, !!middleware.getUsers(ost.id).reb, next) !== -1) {
				rpio.lockOpen();
    				middleware.removeUser(ost.id);
    				req.flash("SUCCESS", "Kapp on avatud 10s", "/");
			    }
			}
		    }
		}
	    }
	}
    }
});

module.exports = router;