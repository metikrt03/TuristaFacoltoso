package it.turistafacoltoso.service;

import it.turistafacoltoso.dao.AbitazioneDAO;
import it.turistafacoltoso.exception.DataAccessException;
import it.turistafacoltoso.exception.NotFoundException;
import it.turistafacoltoso.model.Abitazione;

import java.sql.SQLException;
import java.util.List;

public class AbitazioneService {

    private final AbitazioneDAO abitazioneDAO = new AbitazioneDAO();

    public List<Abitazione> findAll() {
        try {
            return abitazioneDAO.findAll();
        } catch (SQLException e) {
            throw new DataAccessException("Errore lettura abitazioni", e);
        }
    }

    public Abitazione findById(Integer id) {
        try {
            return abitazioneDAO.findById(id);
        } catch (SQLException e) {
            throw new DataAccessException("Errore ricerca abitazione", e);
        }
    }

    public List<Abitazione> findByCodiceHost(String codiceHost) {
        try {
            return abitazioneDAO.findByCodiceHost(codiceHost);
        } catch (SQLException e) {
            throw new DataAccessException("Errore ricerca abitazioni per host", e);
        }
    }

    public Abitazione create(Abitazione abitazione) {
        try {
            return abitazioneDAO.insert(abitazione);
        } catch (SQLException e) {
            throw new DataAccessException("Errore creazione abitazione", e);
        }
    }

    public Abitazione update(Integer id, Abitazione abitazione) {
        abitazione.setId(id);
        try {
            if (abitazioneDAO.findById(id) == null) {
                throw new NotFoundException("Abitazione non trovata");
            }
            boolean ok = abitazioneDAO.update(abitazione);
            if (ok) return abitazione;
        } catch (SQLException e) {
            throw new DataAccessException("Errore aggiornamento abitazione", e);
        }
        throw new NotFoundException("Abitazione non trovata");
    }

    public boolean delete(Integer id) {
        try {
            if (abitazioneDAO.findById(id) == null) {
                throw new NotFoundException("Abitazione non trovata");
            }
            return abitazioneDAO.delete(id);
        } catch (SQLException e) {
            throw new DataAccessException("Errore eliminazione abitazione", e);
        }
    }

    public Abitazione findPiuGettonataUltimoMese() {
        try {
            return abitazioneDAO.findPiuGettonataUltimoMese();
        } catch (SQLException e) {
            throw new DataAccessException("Errore report abitazione gettonata", e);
        }
    }

    public Double getMediaPostiLetto() {
        try {
            return abitazioneDAO.getMediaPostiLetto();
        } catch (SQLException e) {
            throw new DataAccessException("Errore report media posti letto", e);
        }
    }
}
