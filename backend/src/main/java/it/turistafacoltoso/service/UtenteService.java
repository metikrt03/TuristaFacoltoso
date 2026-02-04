package it.turistafacoltoso.service;

import it.turistafacoltoso.dao.UtenteDAO;
import it.turistafacoltoso.dao.UtenteDAOImpl;
import it.turistafacoltoso.exception.DataAccessException;
import it.turistafacoltoso.exception.NotFoundException;
import it.turistafacoltoso.model.Utente;

import java.util.List;

public class UtenteService {

    private final UtenteDAO utenteDAO = new UtenteDAOImpl();

    public List<Utente> findAll() {
        return utenteDAO.findAll();
    }

    public Utente findById(Integer id) {
        return utenteDAO.findById(id);
    }

    public Utente create(Utente utente) {
        if (utenteDAO.findByEmail(utente.getEmail()) != null) {
            throw new DataAccessException("Email già esistente. Scegli un'altra email.");
        }
        return utenteDAO.insert(utente);
    }

    public Utente update(Integer id, Utente utente) {
        utente.setId(id);
        Utente existingWithEmail = utenteDAO.findByEmail(utente.getEmail());
        if (existingWithEmail != null && !existingWithEmail.getId().equals(id)) {
            throw new DataAccessException("Email già esistente. Scegli un'altra email.");
        }
        if (utenteDAO.findById(id) == null) {
            throw new NotFoundException("Utente non trovato");
        }
        if (Boolean.TRUE.equals(utenteDAO.update(utente))) {
            return utente;
        }
        throw new NotFoundException("Utente non trovato");
    }

    public boolean delete(Integer id) {
        if (utenteDAO.findById(id) == null) {
            throw new NotFoundException("Utente non trovato");
        }
        return utenteDAO.delete(id);
    }

    public List<Utente> findTop5UtentiPiuGiorniUltimoMese() {
        return utenteDAO.findTop5UtentiPiuGiorniUltimoMese();
    }
}
