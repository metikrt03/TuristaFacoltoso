package it.turistafacoltoso.dao;

import java.util.List;

import it.turistafacoltoso.model.Utente;

public interface UtenteDAO {

    Utente insert(Utente utente);

    List<Utente> findAll();

    Utente findById(Integer id);

    Utente findByEmail(String email);

    boolean update(Utente utente);

    boolean delete(Integer id);

    List<Utente> findTop5UtentiPiuGiorniUltimoMese();
}

