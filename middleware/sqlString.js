// regularCardRead.js
module.exports.kasutajaSeis = "SELECT kasutaja_seisu_id FROM Kasutaja WHERE kaardi_id =?";
module.exports.insertKasutaja = "INSERT INTO Kasutaja (kasutaja_staatuse_id, kaardi_id, eesnimi, perenimi, coetus) VALUES (?, ?, ?, ?, ?)";

// sqlFunAdmin.js
module.exports.topOstjad = "SELECT nimetus, eesnimi, perenimi, volg FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id ORDER BY volg DESC LIMIT 10";
module.exports.topTooted = "SELECT toote_nimi, COUNT(toote_nimi) AS arv FROM Ost WHERE aeg BETWEEN DATE_SUB(NOW(), INTERVAL 90 DAY) AND NOW() GROUP BY toote_nimi ORDER BY COUNT(toote_nimi) DESC, toote_nimi LIMIT 10";
module.exports.kasutajad = "SELECT kasutaja_id, eesnimi, perenimi, volg, coetus, admin_on_kinnitanud, Kasutaja_Staatus.nimetus AS staatus, Kasutaja_Seis.nimetus AS seisuNim FROM Kasutaja INNER JOIN Kasutaja_Seis ON Kasutaja.kasutaja_seisu_id = Kasutaja_Seis.kasutaja_seisu_id INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id ORDER BY coetus DESC";
module.exports.kasutajaID = "SELECT * FROM Kasutaja WHERE kasutaja_id =?";
module.exports.toodeID = "SELECT * FROM (Toode INNER JOIN Toote_Kategooria ON Toode.toote_kategooria_id = Toote_Kategooria.toote_kategooria_id) INNER JOIN Toote_Kategooria_Klass ON Toote_Kategooria.toote_kategooria_klassi_id = Toote_Kategooria_Klass.toote_kategooria_klassi_id WHERE Toode.toote_id = ?";
module.exports.joogid = "SELECT * FROM (Toode INNER JOIN Toote_Kategooria ON Toode.toote_kategooria_id = Toote_Kategooria.toote_kategooria_id) INNER JOIN Toote_Kategooria_Klass ON Toote_Kategooria.toote_kategooria_klassi_id = Toote_Kategooria_Klass.toote_kategooria_klassi_id WHERE Toote_Kategooria.toote_kategooria_klassi_id = 1 ORDER BY Toode.toote_kategooria_id, Toode.nimetus";
module.exports.soogid = "SELECT * FROM (Toode INNER JOIN Toote_Kategooria ON Toode.toote_kategooria_id = Toote_Kategooria.toote_kategooria_id) INNER JOIN Toote_Kategooria_Klass ON Toote_Kategooria.toote_kategooria_klassi_id = Toote_Kategooria_Klass.toote_kategooria_klassi_id WHERE Toote_Kategooria.toote_kategooria_klassi_id = 2 ORDER BY Toode.toote_kategooria_id, Toode.nimetus";
module.exports.ostud = "SELECT DATE_FORMAT(aeg, '%d.%m.%Y %H:%i') aeg, ostja_nimi, toote_nimi, kogus, summa, on_tasuta FROM Ost ORDER BY DATE(aeg) DESC";
module.exports.volad = "SELECT Kasutaja_Staatus.nimetus as staatus, eesnimi, perenimi, volg FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id WHERE volg > 0";
module.exports.nulliVolad = "UPDATE Kasutaja SET volg = 0 WHERE volg <> 0";

// ostmine.js
module.exports.toode1 = "SELECT * FROM Toode WHERE toote_kategooria_id = 1";
module.exports.toode2 = "SELECT * FROM Toode WHERE toote_kategooria_id = 2";
module.exports.toode3 = "SELECT * FROM Toode WHERE toote_kategooria_id = 3";
module.exports.toode4 = "SELECT * FROM Toode WHERE toote_kategooria_id = 4";
module.exports.toode5 = "SELECT * FROM Toode WHERE toote_kategooria_id = 5";
module.exports.toode6 = "SELECT * FROM Toode WHERE toote_kategooria_id = 6";
module.exports.kasutaja_seisID = "SELECT nimetus, eesnimi, perenimi, kasutaja_seisu_id FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id WHERE kaardi_id =?";
module.exports.myygiHindNIMETUS = "SELECT myygi_hind FROM Toode WHERE nimetus =?";
module.exports.volgStaatusID = "SELECT volg, kasutaja_staatuse_id FROM Kasutaja WHERE kaardi_id =?";
module.exports.hetke_kogusNIMETUS = "SELECT hetke_kogus FROM Toode WHERE nimetus =?";
module.exports.updateVolgID = "UPDATE Kasutaja SET volg =? WHERE kaardi_id =?";
module.exports.updateKogusNIMETUS = "UPDATE Toode SET hetke_kogus =? WHERE nimetus =?";
module.exports.lisaOst = "INSERT INTO Ost (ostja_nimi, toote_nimi, kogus, summa, on_tasuta) VALUES (?, ?, ?, ?, ?)";

// admin.js
module.exports.updateKasutaja = "UPDATE Kasutaja SET kasutaja_seisu_id = ?, kasutaja_staatuse_id = ?, eesnimi = ?, perenimi = ?, volg = ?, admin_on_kinnitanud = ? WHERE kasutaja_id = ?";
module.exports.updateToode = "UPDATE Toode SET toote_kategooria_id = ?, nimetus = ?, hetke_kogus = ?, myygi_hind = ?, oma_hind = ? WHERE toote_id = ?";
module.exports.insertToode = "INSERT INTO Toode (toote_kategooria_id, nimetus, hetke_kogus, myygi_hind, oma_hind) VALUES (?, ?, ?, ?, ?)";