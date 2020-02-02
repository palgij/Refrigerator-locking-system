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
module.exports.kasutajadPaneKirja = "SELECT staatuse_nimetus, eesnimi, perenimi, coetus, kaardi_id FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id WHERE kasutaja_seisu_id <> 3 AND admin_on_kinnitanud = 1 AND kaardi_id <> ? ORDER BY coetus DESC, eesnimi, perenimi";
module.exports.viimase12hKasutajad = "SELECT ostja_nimi, kaardi_id FROM Ost INNER JOIN Kasutaja ON LOCATE(CONCAT(eesnimi, ' ', perenimi), ostja_nimi) <> 0 WHERE kasutaja_seisu_id <> 3 AND admin_on_kinnitanud = 1 AND kaardi_id <> ? AND aeg >= DATE_SUB(NOW(), INTERVAL 12 HOUR) GROUP BY kaardi_id ORDER BY DATE(aeg) DESC, TIME(aeg) DESC, ostja_nimi";

