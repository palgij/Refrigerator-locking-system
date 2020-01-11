// passid
module.exports.getCredentials = "SELECT kasutaja_nimi, salasona FROM Autentimine WHERE nimetus = ?"

// regularCardRead.js
module.exports.kasutajaSeisKinn = "SELECT kasutaja_seisu_id, kasutaja_staatuse_id, admin_on_kinnitanud FROM Kasutaja WHERE kaardi_id = ?";
module.exports.insertKasutaja = "INSERT INTO Kasutaja (kasutaja_staatuse_id, kaardi_id, eesnimi, perenimi, coetus) VALUES (?, ?, ?, ?, ?)";
module.exports.updateKinnitatudKAARDIID = "UPDATE Kasutaja SET admin_on_kinnitanud = 1 WHERE kaardi_id = ?";
module.exports.kasutajadPaneKirja = "SELECT staatuse_nimetus, eesnimi, perenimi, coetus, kaardi_id FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id WHERE kasutaja_seisu_id <> 3 AND admin_on_kinnitanud = 1 AND kaardi_id <> ? ORDER BY coetus DESC, eesnimi, perenimi";

// ostmine.js
module.exports.toode1 = "SELECT * FROM Toode WHERE toote_kategooria_id = 1";
module.exports.toode2 = "SELECT * FROM Toode WHERE toote_kategooria_id = 2";
module.exports.toode3 = "SELECT * FROM Toode WHERE toote_kategooria_id = 3";
module.exports.toode4 = "SELECT * FROM Toode WHERE toote_kategooria_id = 4";
module.exports.toode5 = "SELECT * FROM Toode WHERE toote_kategooria_id = 5";
module.exports.toode6 = "SELECT * FROM Toode WHERE toote_kategooria_id = 6";
module.exports.kasutaja_seisID = "SELECT staatuse_nimetus, eesnimi, perenimi, kasutaja_seisu_id FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id WHERE kaardi_id =?";
module.exports.myygiHindNIMETUS = "SELECT myygi_hind FROM Toode WHERE toote_nimetus =?";
module.exports.volgStaatusID = "SELECT volg, kasutaja_staatuse_id FROM Kasutaja WHERE kaardi_id =?";
module.exports.hetke_kogusNIMETUS = "SELECT hetke_kogus FROM Toode WHERE toote_nimetus =?";
module.exports.updateVolgID = "UPDATE Kasutaja SET volg =? WHERE kaardi_id =?";
module.exports.updateKogusNIMETUS = "UPDATE Toode SET hetke_kogus =? WHERE toote_nimetus =?";
module.exports.lisaOst = "INSERT INTO Ost (ostja_nimi, toote_nimi, kogus, summa, on_tasuta, rebane_ostis, summa_oma_hind) VALUES (?, ?, ?, ?, ?, ?, ?)";
module.exports.tooteKategooriaOmaHindID = "SELECT toote_kategooria_id, oma_hind FROM Toode WHERE toote_nimetus = ?";
module.exports.kasutajaInfID = "SELECT staatuse_nimetus, eesnimi, perenimi FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id WHERE kaardi_id = ?";

// admin.js
module.exports.updateKasutaja = "UPDATE Kasutaja SET kasutaja_seisu_id = ?, kasutaja_staatuse_id = ?, eesnimi = ?, perenimi = ?, volg = ?, admin_on_kinnitanud = ? WHERE kasutaja_id = ?";
module.exports.updateToode = "UPDATE Toode SET toote_kategooria_id = ?, toote_nimetus = ?, hetke_kogus = ?, myygi_hind = ?, oma_hind = ? WHERE toote_id = ?";
module.exports.insertToode = "INSERT INTO Toode (toote_kategooria_id, toote_nimetus, hetke_kogus, myygi_hind, oma_hind) VALUES (?, ?, ?, ?, ?)";
module.exports.deleteKasutajaID = "DELETE FROM Kasutaja WHERE kasutaja_id = ?";
module.exports.deleteToodeID = "DELETE FROM Toode WHERE toote_id = ?";
module.exports.insertTooteMuutus = "INSERT INTO Toote_Koguse_Muutus (toote_nimi, kogus, tegevus) VALUES (?, ?, ?)";
module.exports.insertKasutajaMuutus = "INSERT INTO Kasutaja_Muutus (kasutaja_nimi, tegevus, muudeti) VALUES (?, ?, ?)";
module.exports.kasutajaNimiID = "SELECT staatuse_nimetus, eesnimi, perenimi FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id WHERE kasutaja_id = ?";
module.exports.staatusNimetusID = "SELECT staatuse_nimetus FROM Kasutaja_Staatus WHERE kasutaja_staatuse_id = ?";
module.exports.tooteNimetusID = "SELECT toote_nimetus, hetke_kogus FROM Toode WHERE toote_id = ?";
module.exports.topOstjad = "SELECT staatuse_nimetus, eesnimi, perenimi, volg FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id ORDER BY volg DESC LIMIT 10";
module.exports.topTooted = "SELECT toote_nimi, COUNT(toote_nimi) AS arv FROM Ost WHERE aeg BETWEEN DATE_SUB(NOW(), INTERVAL 90 DAY) AND NOW() GROUP BY toote_nimi ORDER BY COUNT(toote_nimi) DESC, toote_nimi LIMIT 10";
module.exports.kasutajad = "SELECT kasutaja_id, eesnimi, perenimi, volg, coetus, admin_on_kinnitanud, staatuse_nimetus AS staatus, seisu_nimetus AS seisuNim FROM Kasutaja INNER JOIN Kasutaja_Seis ON Kasutaja.kasutaja_seisu_id = Kasutaja_Seis.kasutaja_seisu_id INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id ORDER BY coetus DESC, staatus, eesnimi, perenimi";
module.exports.kasutajaID = "SELECT * FROM Kasutaja WHERE kasutaja_id =?";
module.exports.toodeID = "SELECT * FROM (Toode INNER JOIN Toote_Kategooria ON Toode.toote_kategooria_id = Toote_Kategooria.toote_kategooria_id) INNER JOIN Toote_Kategooria_Klass ON Toote_Kategooria.toote_kategooria_klassi_id = Toote_Kategooria_Klass.toote_kategooria_klassi_id WHERE Toode.toote_id = ?";
module.exports.joogid = "SELECT * FROM (Toode INNER JOIN Toote_Kategooria ON Toode.toote_kategooria_id = Toote_Kategooria.toote_kategooria_id) INNER JOIN Toote_Kategooria_Klass ON Toote_Kategooria.toote_kategooria_klassi_id = Toote_Kategooria_Klass.toote_kategooria_klassi_id WHERE Toote_Kategooria.toote_kategooria_klassi_id = 1 ORDER BY Toode.toote_kategooria_id, Toode.toote_nimetus";
module.exports.soogid = "SELECT * FROM (Toode INNER JOIN Toote_Kategooria ON Toode.toote_kategooria_id = Toote_Kategooria.toote_kategooria_id) INNER JOIN Toote_Kategooria_Klass ON Toote_Kategooria.toote_kategooria_klassi_id = Toote_Kategooria_Klass.toote_kategooria_klassi_id WHERE Toote_Kategooria.toote_kategooria_klassi_id = 2 ORDER BY Toode.toote_kategooria_id, Toode.toote_nimetus";
module.exports.ostud = "SELECT DATE_FORMAT(aeg, '%d.%m.%Y %H:%i') AS aeg, ostja_nimi, toote_nimi, kogus, summa, on_tasuta, rebane_ostis FROM Ost ORDER BY DATE(aeg) DESC, TIME(aeg) DESC";
module.exports.volad = "SELECT Kasutaja_Staatus.staatuse_nimetus as staatus, eesnimi, perenimi, volg FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id WHERE volg > 0";
module.exports.nulliVolad = "UPDATE Kasutaja SET volg = 0 WHERE volg <> 0";
module.exports.ostudAEG = "SELECT DATE_FORMAT(aeg, '%d.%m.%Y %H:%i') AS aeg, ostja_nimi, toote_nimi, kogus, summa, summa_oma_hind, on_tasuta, rebane_ostis FROM Ost WHERE aeg BETWEEN ? and ? ORDER BY DATE(aeg) DESC, TIME(aeg) DESC";
module.exports.toodeteMuutused = "SELECT DATE_FORMAT(aeg, '%d.%m.%Y %H:%i') AS aeg, toote_nimi, kogus, tegevus FROM Toote_Koguse_Muutus ORDER BY DATE(aeg) DESC, TIME(aeg) DESC";
module.exports.kasutajateMuutused = "SELECT DATE_FORMAT(aeg, '%d.%m.%Y %H:%i') AS aeg, kasutaja_nimi, tegevus, muudeti FROM Kasutaja_Muutus ORDER BY DATE(aeg) DESC, TIME(aeg) DESC";
module.exports.viimase12hKasutajad = "SELECT ostja_nimi, kaardi_id FROM Ost INNER JOIN Kasutaja ON LOCATE(CONCAT(eesnimi, ' ', perenimi), ostja_nimi) <> 0 WHERE kasutaja_seisu_id <> 3 AND admin_on_kinnitanud = 1 AND kaardi_id <> ? AND aeg >= DATE_SUB(NOW(), INTERVAL 12 HOUR) GROUP BY kaardi_id ORDER BY DATE(aeg) DESC, TIME(aeg) DESC, ostja_nimi";
module.exports.getToodeID = "SELECT * FROM Toode WHERE toote_id = ?";
module.exports.rebasteJoodudOlled = "SELECT COALESCE(SUM(summa_oma_hind), 0) AS olledSumma FROM Ost WHERE aeg BETWEEN (LAST_DAY(NOW() - INTERVAL 2 MONTH) + INTERVAL 1 DAY) AND LAST_DAY(NOW() - INTERVAL 1 MONTH) AND ostja_nimi LIKE 'reb! %' AND on_tasuta = 1";
module.exports.getTooted = "SELECT toote_kategooria_id, toote_nimetus, myygi_hind, oma_hind, hetke_kogus FROM Toode ORDER BY toote_kategooria_id";