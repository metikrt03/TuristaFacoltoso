package it.turistafacoltoso.service;

import it.turistafacoltoso.dao.HostDAO;
import it.turistafacoltoso.exception.DataAccessException;
import it.turistafacoltoso.exception.NotFoundException;
import it.turistafacoltoso.model.Host;

import java.sql.SQLException;
import java.util.List;

public class HostService {

    private final HostDAO hostDAO = new HostDAO();

    public List<Host> findAll() {
        try {
            return hostDAO.findAll();
        } catch (SQLException e) {
            throw new DataAccessException("Errore lettura host", e);
        }
    }

    public Host findById(Integer id) {
        try {
            return hostDAO.findById(id);
        } catch (SQLException e) {
            throw new DataAccessException("Errore ricerca host", e);
        }
    }

    public Host findByCodiceHost(String codiceHost) {
        try {
            return hostDAO.findByCodiceHost(codiceHost);
        } catch (SQLException e) {
            throw new DataAccessException("Errore ricerca host per codice", e);
        }
    }

    public Host create(Host host) {
        try {
            if (hostDAO.findByCodiceHost(host.getCodiceHost()) != null) {
                throw new DataAccessException("Codice host già esistente. Scegli un altro codice (es. HOST002).");
            }
        } catch (SQLException e) {
            throw new DataAccessException("Errore verifica codice host", e);
        }
        try {
            return hostDAO.insert(host);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                throw new DataAccessException("Codice host già esistente. Scegli un altro codice (es. HOST002).", e);
            }
            throw new DataAccessException("Errore creazione host", e);
        }
    }

    public Host update(Integer id, Host host) {
        host.setId(id);
        try {
            Host existingWithCodice = hostDAO.findByCodiceHost(host.getCodiceHost());
            if (existingWithCodice != null && !existingWithCodice.getId().equals(id)) {
                throw new DataAccessException("Codice host già esistente. Scegli un altro codice (es. HOST002).");
            }
            if (hostDAO.findById(id) == null) {
                throw new NotFoundException("Host non trovato");
            }
            if (hostDAO.update(host)) {
                return host;
            }
        } catch (SQLException e) {
            throw new DataAccessException("Errore aggiornamento host", e);
        }
        throw new NotFoundException("Host non trovato");
    }

    public boolean delete(Integer id) {
        try {
            if (hostDAO.findById(id) == null) {
                throw new NotFoundException("Host non trovato");
            }
            return hostDAO.delete(id);
        } catch (SQLException e) {
            throw new DataAccessException("Errore eliminazione host", e);
        }
    }

    public List<Host> findHostPiuPrenotazioniUltimoMese() {
        try {
            return hostDAO.findHostPiuPrenotazioniUltimoMese();
        } catch (SQLException e) {
            throw new DataAccessException("Errore report host prenotazioni", e);
        }
    }

    public List<Host> findAllSuperHost() {
        try {
            return hostDAO.findAllSuperHost();
        } catch (SQLException e) {
            throw new DataAccessException("Errore report super-host", e);
        }
    }
}
