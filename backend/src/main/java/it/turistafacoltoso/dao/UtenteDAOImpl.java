package it.turistafacoltoso.dao;

import it.turistafacoltoso.exception.DataAccessException;
import it.turistafacoltoso.model.Utente;
import it.turistafacoltoso.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementazione JDBC del DAO per Utente.
 */
public class UtenteDAOImpl implements UtenteDAO {

    // === CRUD ===

    @Override
    public List<Utente> findAll() {
        List<Utente> utenti = new ArrayList<>();
        String sql = "SELECT id, nome, cognome, email, indirizzo FROM utente ORDER BY id";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                utenti.add(mapRowToUtente(rs));
            }
        } catch (SQLException ex) {
            throw new DataAccessException("Errore nel recupero degli utenti", ex);
        }
        return utenti;
    }

    @Override
    public Utente findById(Integer id) {
        String sql = "SELECT id, nome, cognome, email, indirizzo FROM utente WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUtente(rs);
                }
            }
        } catch (SQLException ex) {
            throw new DataAccessException("Errore nella ricerca utente per id: " + id, ex);
        }
        return null;
    }

    @Override
    public Utente findByEmail(String email) {
        if (email == null || email.isBlank()) return null;
        String sql = "SELECT id, nome, cognome, email, indirizzo FROM utente WHERE email = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRowToUtente(rs);
            }
        } catch (SQLException ex) {
            throw new DataAccessException("Errore nella ricerca utente per email", ex);
        }
        return null;
    }

    @Override
    public Utente insert(Utente utente) {
        String sql = "INSERT INTO utente (nome, cognome, email, indirizzo) VALUES (?, ?, ?, ?) RETURNING id";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, utente.getNome());
            ps.setString(2, utente.getCognome());
            ps.setString(3, utente.getEmail());
            ps.setString(4, utente.getIndirizzo());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    utente.setId(rs.getInt("id"));
                }
            }
        } catch (SQLException ex) {
            throw new DataAccessException("Errore nella creazione dell'utente", ex);
        }
        return utente;
    }

    @Override
    public boolean update(Utente utente) {
        String sql = "UPDATE utente SET nome = ?, cognome = ?, email = ?, indirizzo = ? WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, utente.getNome());
            ps.setString(2, utente.getCognome());
            ps.setString(3, utente.getEmail());
            ps.setString(4, utente.getIndirizzo());
            ps.setInt(5, utente.getId());

            return ps.executeUpdate() > 0;
        } catch (SQLException ex) {
            throw new DataAccessException("Errore nell'aggiornamento dell'utente id: " + utente.getId(), ex);
        }
    }

    @Override
    public boolean delete(Integer id) {
        String sql = "DELETE FROM utente WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException ex) {
            throw new DataAccessException("Errore nell'eliminazione dell'utente id: " + id, ex);
        }
    }

    // === QUERY SPECIFICA: Top 5 utenti con più giorni prenotati nell'ultimo mese ===

    @Override
    public List<Utente> findTop5UtentiPiuGiorniUltimoMese() {
        List<Utente> utenti = new ArrayList<>();
        String sql = """
            SELECT u.id, u.nome, u.cognome, u.email, u.indirizzo,
                   SUM(p.data_fine - p.data_inizio) AS giorni_totali
            FROM utente u
            JOIN prenotazione p ON u.id = p.utente_id
            WHERE p.data_inizio >= CURRENT_DATE - INTERVAL '1 month'
            GROUP BY u.id
            ORDER BY giorni_totali DESC
            LIMIT 5
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                utenti.add(mapRowToUtente(rs));
            }
        } catch (SQLException ex) {
            throw new DataAccessException("Errore nel report top 5 utenti per giorni", ex);
        }
        return utenti;
    }

    // === Helper ===

    private Utente mapRowToUtente(ResultSet rs) throws SQLException {
        Utente u = new Utente();
        u.setId(rs.getInt("id"));
        u.setNome(rs.getString("nome"));
        u.setCognome(rs.getString("cognome"));
        u.setEmail(rs.getString("email"));
        u.setIndirizzo(rs.getString("indirizzo"));
        return u;
    }
}

