module.exports.kasutajaSeisKinn = "SELECT kasutaja_seisu_id, kasutaja_staatuse_id, admin_on_kinnitanud FROM Kasutaja WHERE kaardi_id = ?";
module.exports.insertKasutaja = "INSERT INTO Kasutaja (kasutaja_staatuse_id, kaardi_id, eesnimi, perenimi, coetus) VALUES (?, ?, ?, ?, ?)";
module.exports.updateKinnitatudKAARDIID = "UPDATE Kasutaja SET admin_on_kinnitanud = 1 WHERE kaardi_id = ?";
module.exports.kasutajaInfID = "SELECT staatuse_nimetus, eesnimi, perenimi FROM Kasutaja INNER JOIN Kasutaja_Staatus ON Kasutaja.kasutaja_staatuse_id = Kasutaja_Staatus.kasutaja_staatuse_id WHERE kaardi_id = ?";
module.exports.insertKasutajaMuutus = "INSERT INTO Kasutaja_Muutus (kasutaja_nimi, tegevus, muudeti) VALUES (?, ?, ?)";
module.exports.staatusNimetusID = "SELECT staatuse_nimetus FROM Kasutaja_Staatus WHERE kasutaja_staatuse_id = ?";
