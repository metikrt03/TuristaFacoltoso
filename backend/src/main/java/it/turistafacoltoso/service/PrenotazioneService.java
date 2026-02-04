package it.turistafacoltoso.service;

import it.turistafacoltoso.dao.PrenotazioneDAO;
import it.turistafacoltoso.exception.DataAccessException;
import it.turistafacoltoso.exception.ValidationException;
import it.turistafacoltoso.exception.NotFoundException;
import it.turistafacoltoso.model.Abitazione;
import it.turistafacoltoso.model.Prenotazione;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

public class PrenotazioneService {

    private final PrenotazioneDAO prenotazioneDAO = new PrenotazioneDAO();
    private final AbitazioneService abitazioneService = new AbitazioneService();

    private void validaDateInDisponibilita(Prenotazione prenotazione) {
        Abitazione abitazione = abitazioneService.findById(prenotazione.getAbitazioneId());
        if (abitazione == null) return;
        LocalDate dispInizio = abitazione.getDataInizio();
        LocalDate dispFine = abitazione.getDataFine();
        LocalDate prenInizio = prenotazione.getDataInizio();
        LocalDate prenFine = prenotazione.getDataFine();
        if (prenInizio.isBefore(dispInizio) || prenFine.isAfter(dispFine)) {
            throw new ValidationException(
                "Le date della prenotazione devono essere comprese nel periodo di disponibilità dell'abitazione (dal " + dispInizio + " al " + dispFine + ")."
            );
        }
    }

    public List<Prenotazione> findAll() {
        try {
            return prenotazioneDAO.findAll();
        } catch (SQLException e) {
            throw new DataAccessException("Errore lettura prenotazioni", e);
        }
    }

    public Prenotazione findById(Integer id) {
        try {
            return prenotazioneDAO.findById(id);
        } catch (SQLException e) {
            throw new DataAccessException("Errore ricerca prenotazione", e);
        }
    }

    public Prenotazione findUltimaByUtenteId(Integer utenteId) {
        try {
            return prenotazioneDAO.findUltimaByUtenteId(utenteId);
        } catch (SQLException e) {
            throw new DataAccessException("Errore ricerca ultima prenotazione utente", e);
        }
    }

    public Prenotazione create(Prenotazione prenotazione) {
        validaDateInDisponibilita(prenotazione);
        try {
            return prenotazioneDAO.insert(prenotazione);
        } catch (SQLException e) {
            throw new DataAccessException("Errore creazione prenotazione", e);
        }
    }

    public Prenotazione update(Integer id, Prenotazione prenotazione) {
        prenotazione.setId(id);
        validaDateInDisponibilita(prenotazione);
        try {
            if (prenotazioneDAO.findById(id) == null) {
                throw new NotFoundException("Prenotazione non trovata");
            }
            boolean ok = prenotazioneDAO.update(prenotazione);
            if (ok) return prenotazione;
        } catch (SQLException e) {
            throw new DataAccessException("Errore aggiornamento prenotazione", e);
        }
        throw new NotFoundException("Prenotazione non trovata");
    }

    public boolean delete(Integer id) {
        try {
            if (prenotazioneDAO.findById(id) == null) {
                throw new NotFoundException("Prenotazione non trovata");
            }
            return prenotazioneDAO.delete(id);
        } catch (SQLException e) {
            throw new DataAccessException("Errore eliminazione prenotazione", e);
        }
    }
}
