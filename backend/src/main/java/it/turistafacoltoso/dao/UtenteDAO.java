package it.turistafacoltoso.dao;

import it.turistafacoltoso.model.Utente;

import java.util.List;

/**
 * Interfaccia DAO per Utente: definisce le operazioni CRUD e le query specifiche.
 * Gli errori di accesso dati sono propagati come DataAccessException (runtime).
 */
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

