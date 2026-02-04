package it.turistafacoltoso.dao;

import it.turistafacoltoso.model.Feedback;
import it.turistafacoltoso.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class FeedbackDAO {

    // === CRUD ===

    public List<Feedback> findAll() throws SQLException {
        List<Feedback> feedbacks = new ArrayList<>();
        String sql = "SELECT * FROM feedback ORDER BY id";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                feedbacks.add(mapRowToFeedback(rs));
            }
        }
        return feedbacks;
    }

    public Feedback findById(Integer id) throws SQLException {
        String sql = "SELECT * FROM feedback WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToFeedback(rs);
                }
            }
        }
        return null;
    }

    public Feedback findByPrenotazioneId(Integer prenotazioneId) throws SQLException {
        String sql = "SELECT * FROM feedback WHERE prenotazione_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, prenotazioneId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToFeedback(rs);
                }
            }
        }
        return null;
    }

    public Feedback insert(Feedback feedback) throws SQLException {
        String sql = """
            INSERT INTO feedback (titolo, testo, punteggio, prenotazione_id)
            VALUES (?, ?, ?, ?) RETURNING id
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, feedback.getTitolo());
            ps.setString(2, feedback.getTesto());
            ps.setInt(3, feedback.getPunteggio());
            ps.setInt(4, feedback.getPrenotazioneId());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    feedback.setId(rs.getInt("id"));
                }
            }
        }
        return feedback;
    }

    public boolean update(Feedback feedback) throws SQLException {
        String sql = """
            UPDATE feedback
            SET titolo = ?, testo = ?, punteggio = ?, prenotazione_id = ?
            WHERE id = ?
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, feedback.getTitolo());
            ps.setString(2, feedback.getTesto());
            ps.setInt(3, feedback.getPunteggio());
            ps.setInt(4, feedback.getPrenotazioneId());
            ps.setInt(5, feedback.getId());

            return ps.executeUpdate() > 0;
        }
    }

    public boolean delete(Integer id) throws SQLException {
        String sql = "DELETE FROM feedback WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    // === Helper ===

    private Feedback mapRowToFeedback(ResultSet rs) throws SQLException {
        Feedback f = new Feedback();
        f.setId(rs.getInt("id"));
        f.setTitolo(rs.getString("titolo"));
        f.setTesto(rs.getString("testo"));
        f.setPunteggio(rs.getInt("punteggio"));
        f.setPrenotazioneId(rs.getInt("prenotazione_id"));
        return f;
    }
}
