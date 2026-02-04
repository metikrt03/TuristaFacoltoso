package it.turistafacoltoso.dao;

import it.turistafacoltoso.model.Prenotazione;
import it.turistafacoltoso.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PrenotazioneDAO {

    // === CRUD ===

    public List<Prenotazione> findAll() throws SQLException {
        List<Prenotazione> prenotazioni = new ArrayList<>();
        String sql = "SELECT * FROM prenotazione ORDER BY id";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                prenotazioni.add(mapRowToPrenotazione(rs));
            }
        }
        return prenotazioni;
    }

    public Prenotazione findById(Integer id) throws SQLException {
        String sql = "SELECT * FROM prenotazione WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToPrenotazione(rs);
                }
            }
        }
        return null;
    }

    public Prenotazione insert(Prenotazione prenotazione) throws SQLException {
        String sql = """
            INSERT INTO prenotazione (data_inizio, data_fine, utente_id, abitazione_id)
            VALUES (?, ?, ?, ?) RETURNING id
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setDate(1, Date.valueOf(prenotazione.getDataInizio()));
            ps.setDate(2, Date.valueOf(prenotazione.getDataFine()));
            ps.setInt(3, prenotazione.getUtenteId());
            ps.setInt(4, prenotazione.getAbitazioneId());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    prenotazione.setId(rs.getInt("id"));
                }
            }
        }
        return prenotazione;
    }

    public boolean update(Prenotazione prenotazione) throws SQLException {
        String sql = """
            UPDATE prenotazione
            SET data_inizio = ?, data_fine = ?, utente_id = ?, abitazione_id = ?
            WHERE id = ?
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setDate(1, Date.valueOf(prenotazione.getDataInizio()));
            ps.setDate(2, Date.valueOf(prenotazione.getDataFine()));
            ps.setInt(3, prenotazione.getUtenteId());
            ps.setInt(4, prenotazione.getAbitazioneId());
            ps.setInt(5, prenotazione.getId());

            return ps.executeUpdate() > 0;
        }
    }

    public boolean delete(Integer id) throws SQLException {
        String sql = "DELETE FROM prenotazione WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    // === QUERY SPECIFICA: Ultima prenotazione per utente ===

    public Prenotazione findUltimaByUtenteId(Integer utenteId) throws SQLException {
        String sql = """
            SELECT * FROM prenotazione
            WHERE utente_id = ?
            ORDER BY data_inizio DESC
            LIMIT 1
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, utenteId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToPrenotazione(rs);
                }
            }
        }
        return null;
    }

    // === Helper ===

    private Prenotazione mapRowToPrenotazione(ResultSet rs) throws SQLException {
        Prenotazione p = new Prenotazione();
        p.setId(rs.getInt("id"));
        p.setDataInizio(rs.getDate("data_inizio").toLocalDate());
        p.setDataFine(rs.getDate("data_fine").toLocalDate());
        p.setUtenteId(rs.getInt("utente_id"));
        p.setAbitazioneId(rs.getInt("abitazione_id"));
        return p;
    }
}
