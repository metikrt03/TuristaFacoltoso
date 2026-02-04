package it.turistafacoltoso.service;

import it.turistafacoltoso.dao.FeedbackDAO;
import it.turistafacoltoso.exception.DataAccessException;
import it.turistafacoltoso.exception.NotFoundException;
import it.turistafacoltoso.model.Feedback;

import java.sql.SQLException;
import java.util.List;

public class FeedbackService {

    private final FeedbackDAO feedbackDAO = new FeedbackDAO();

    public List<Feedback> findAll() {
        try {
            return feedbackDAO.findAll();
        } catch (SQLException e) {
            throw new DataAccessException("Errore lettura feedback", e);
        }
    }

    public Feedback findById(Integer id) {
        try {
            return feedbackDAO.findById(id);
        } catch (SQLException e) {
            throw new DataAccessException("Errore ricerca feedback", e);
        }
    }

    public Feedback findByPrenotazioneId(Integer prenotazioneId) {
        try {
            return feedbackDAO.findByPrenotazioneId(prenotazioneId);
        } catch (SQLException e) {
            throw new DataAccessException("Errore ricerca feedback per prenotazione", e);
        }
    }

    public Feedback create(Feedback feedback) {
        try {
            if (feedbackDAO.findByPrenotazioneId(feedback.getPrenotazioneId()) != null) {
                throw new DataAccessException("Esiste già un feedback per questa prenotazione. Ogni prenotazione può avere un solo feedback.");
            }
        } catch (SQLException e) {
            throw new DataAccessException("Errore verifica feedback prenotazione", e);
        }
        try {
            return feedbackDAO.insert(feedback);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                throw new DataAccessException("Esiste già un feedback per questa prenotazione. Ogni prenotazione può avere un solo feedback.", e);
            }
            throw new DataAccessException("Errore creazione feedback", e);
        }
    }

    public Feedback update(Integer id, Feedback feedback) {
        feedback.setId(id);
        try {
            Feedback existingForPrenotazione = feedbackDAO.findByPrenotazioneId(feedback.getPrenotazioneId());
            if (existingForPrenotazione != null && !existingForPrenotazione.getId().equals(id)) {
                throw new DataAccessException("Esiste già un feedback per questa prenotazione. Ogni prenotazione può avere un solo feedback.");
            }
            if (feedbackDAO.findById(id) == null) {
                throw new NotFoundException("Feedback non trovato");
            }
            if (feedbackDAO.update(feedback)) {
                return feedback;
            }
        } catch (SQLException e) {
            throw new DataAccessException("Errore aggiornamento feedback", e);
        }
        throw new NotFoundException("Feedback non trovato");
    }

    public boolean delete(Integer id) {
        try {
            if (feedbackDAO.findById(id) == null) {
                throw new NotFoundException("Feedback non trovato");
            }
            return feedbackDAO.delete(id);
        } catch (SQLException e) {
            throw new DataAccessException("Errore eliminazione feedback", e);
        }
    }
}
