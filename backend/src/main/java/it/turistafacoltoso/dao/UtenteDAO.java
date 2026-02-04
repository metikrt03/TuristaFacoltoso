package it.turistafacoltoso.dao;

import java.util.List;

import it.turistafacoltoso.model.Utente;

public interface UtenteDAO {

    // === CREATE ===
    Utente insert(Utente utente);

    // === READ ===
    List<Utente> findAll();

    Utente findById(Integer id);

    Utente findByEmail(String email);

    // === UPDATE ===
    boolean update(Utente utente);

    // === DELETE ===
    boolean delete(Integer id);

    // === QUERY SPECIFICA ===
    List<Utente> findTop5UtentiPiuGiorniUltimoMese();
}

