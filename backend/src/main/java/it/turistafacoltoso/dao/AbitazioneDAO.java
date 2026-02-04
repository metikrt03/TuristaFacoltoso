package it.turistafacoltoso.dao;

import it.turistafacoltoso.model.Abitazione;
import it.turistafacoltoso.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AbitazioneDAO {

    public List<Abitazione> findAll() throws SQLException {
        List<Abitazione> abitazioni = new ArrayList<>();
        String sql = "SELECT * FROM abitazione ORDER BY id";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                abitazioni.add(mapRowToAbitazione(rs));
            }
        }
        return abitazioni;
    }

    public Abitazione findById(Integer id) throws SQLException {
        String sql = "SELECT * FROM abitazione WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToAbitazione(rs);
                }
            }
        }
        return null;
    }

    public Abitazione insert(Abitazione abitazione) throws SQLException {
        String sql = """
            INSERT INTO abitazione (nome, indirizzo, locali, posti_letto, piano, prezzo, data_inizio, data_fine, host_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, abitazione.getNome());
            ps.setString(2, abitazione.getIndirizzo());
            ps.setInt(3, abitazione.getLocali());
            ps.setInt(4, abitazione.getPostiLetto());
            if (abitazione.getPiano() != null) {
                ps.setInt(5, abitazione.getPiano());
            } else {
                ps.setNull(5, Types.INTEGER);
            }
            ps.setBigDecimal(6, abitazione.getPrezzo());
            ps.setDate(7, Date.valueOf(abitazione.getDataInizio()));
            ps.setDate(8, Date.valueOf(abitazione.getDataFine()));
            ps.setInt(9, abitazione.getHostId());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    abitazione.setId(rs.getInt("id"));
                }
            }
        }
        return abitazione;
    }

    public boolean update(Abitazione abitazione) throws SQLException {
        String sql = """
            UPDATE abitazione
            SET nome = ?, indirizzo = ?, locali = ?, posti_letto = ?, piano = ?,
                prezzo = ?, data_inizio = ?, data_fine = ?, host_id = ?
            WHERE id = ?
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, abitazione.getNome());
            ps.setString(2, abitazione.getIndirizzo());
            ps.setInt(3, abitazione.getLocali());
            ps.setInt(4, abitazione.getPostiLetto());
            if (abitazione.getPiano() != null) {
                ps.setInt(5, abitazione.getPiano());
            } else {
                ps.setNull(5, Types.INTEGER);
            }
            ps.setBigDecimal(6, abitazione.getPrezzo());
            ps.setDate(7, Date.valueOf(abitazione.getDataInizio()));
            ps.setDate(8, Date.valueOf(abitazione.getDataFine()));
            ps.setInt(9, abitazione.getHostId());
            ps.setInt(10, abitazione.getId());

            return ps.executeUpdate() > 0;
        }
    }

    public boolean delete(Integer id) throws SQLException {
        String sql = "DELETE FROM abitazione WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    public List<Abitazione> findByCodiceHost(String codiceHost) throws SQLException {
        List<Abitazione> abitazioni = new ArrayList<>();
        String sql = """
            SELECT a.* FROM abitazione a
            JOIN host h ON a.host_id = h.id
            WHERE h.codice_host = ?
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, codiceHost);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    abitazioni.add(mapRowToAbitazione(rs));
                }
            }
        }
        return abitazioni;
    }

    public Abitazione findPiuGettonataUltimoMese() throws SQLException {
        String sql = """
            SELECT a.*, COUNT(p.id) AS num_prenotazioni
            FROM abitazione a
            JOIN prenotazione p ON a.id = p.abitazione_id
            WHERE p.data_inizio >= CURRENT_DATE - INTERVAL '1 month'
            GROUP BY a.id
            ORDER BY num_prenotazioni DESC
            LIMIT 1
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return mapRowToAbitazione(rs);
            }
        }
        return null;
    }

    public Double getMediaPostiLetto() throws SQLException {
        String sql = "SELECT AVG(posti_letto) AS media FROM abitazione";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getDouble("media");
            }
        }
        return 0.0;
    }

    private Abitazione mapRowToAbitazione(ResultSet rs) throws SQLException {
        Abitazione a = new Abitazione();
        a.setId(rs.getInt("id"));
        a.setNome(rs.getString("nome"));
        a.setIndirizzo(rs.getString("indirizzo"));
        a.setLocali(rs.getInt("locali"));
        a.setPostiLetto(rs.getInt("posti_letto"));

        int piano = rs.getInt("piano");
        a.setPiano(rs.wasNull() ? null : piano);

        a.setPrezzo(rs.getBigDecimal("prezzo"));
        a.setDataInizio(rs.getDate("data_inizio").toLocalDate());
        a.setDataFine(rs.getDate("data_fine").toLocalDate());
        a.setHostId(rs.getInt("host_id"));
        return a;
    }
}
