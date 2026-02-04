package it.turistafacoltoso.dao;

import it.turistafacoltoso.model.Host;
import it.turistafacoltoso.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class HostDAO {

    // === CRUD ===

    public List<Host> findAll() throws SQLException {
        List<Host> hosts = new ArrayList<>();
        String sql = """
            SELECT u.id, u.nome, u.cognome, u.email, u.indirizzo, h.codice_host
            FROM host h
            JOIN utente u ON h.id = u.id
            ORDER BY u.id
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                hosts.add(mapRowToHost(rs));
            }
        }
        return hosts;
    }

    public Host findById(Integer id) throws SQLException {
        String sql = """
            SELECT u.id, u.nome, u.cognome, u.email, u.indirizzo, h.codice_host
            FROM host h
            JOIN utente u ON h.id = u.id
            WHERE h.id = ?
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToHost(rs);
                }
            }
        }
        return null;
    }

    public Host findByCodiceHost(String codiceHost) throws SQLException {
        String sql = """
            SELECT u.id, u.nome, u.cognome, u.email, u.indirizzo, h.codice_host
            FROM host h
            JOIN utente u ON h.id = u.id
            WHERE h.codice_host = ?
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, codiceHost);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToHost(rs);
                }
            }
        }
        return null;
    }

    public Host insert(Host host) throws SQLException {
        String sqlUtente = "INSERT INTO utente (nome, cognome, email, indirizzo) VALUES (?, ?, ?, ?) RETURNING id";
        String sqlHost = "INSERT INTO host (id, codice_host) VALUES (?, ?)";

        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // Inserisco utente
                try (PreparedStatement ps = conn.prepareStatement(sqlUtente)) {
                    ps.setString(1, host.getNome());
                    ps.setString(2, host.getCognome());
                    ps.setString(3, host.getEmail());
                    ps.setString(4, host.getIndirizzo());

                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            host.setId(rs.getInt("id"));
                        }
                    }
                }

                // Inserisco host
                try (PreparedStatement ps = conn.prepareStatement(sqlHost)) {
                    ps.setInt(1, host.getId());
                    ps.setString(2, host.getCodiceHost());
                    ps.executeUpdate();
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        }
        return host;
    }

    public boolean update(Host host) throws SQLException {
        String sqlUtente = "UPDATE utente SET nome = ?, cognome = ?, email = ?, indirizzo = ? WHERE id = ?";
        String sqlHost = "UPDATE host SET codice_host = ? WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement ps = conn.prepareStatement(sqlUtente)) {
                    ps.setString(1, host.getNome());
                    ps.setString(2, host.getCognome());
                    ps.setString(3, host.getEmail());
                    ps.setString(4, host.getIndirizzo());
                    ps.setInt(5, host.getId());
                    ps.executeUpdate();
                }

                try (PreparedStatement ps = conn.prepareStatement(sqlHost)) {
                    ps.setString(1, host.getCodiceHost());
                    ps.setInt(2, host.getId());
                    ps.executeUpdate();
                }

                conn.commit();
                return true;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        }
    }

    public boolean delete(Integer id) throws SQLException {
        // CASCADE su utente eliminerà anche host
        String sql = "DELETE FROM utente WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    // === QUERY SPECIFICA: Host con più prenotazioni nell'ultimo mese ===

    public List<Host> findHostPiuPrenotazioniUltimoMese() throws SQLException {
        List<Host> hosts = new ArrayList<>();
        String sql = """
            SELECT u.id, u.nome, u.cognome, u.email, u.indirizzo, h.codice_host,
                   COUNT(p.id) AS num_prenotazioni
            FROM host h
            JOIN utente u ON h.id = u.id
            JOIN abitazione a ON h.id = a.host_id
            JOIN prenotazione p ON a.id = p.abitazione_id
            WHERE p.data_inizio >= CURRENT_DATE - INTERVAL '1 month'
            GROUP BY u.id, h.codice_host
            ORDER BY num_prenotazioni DESC
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                hosts.add(mapRowToHost(rs));
            }
        }
        return hosts;
    }

    // === QUERY SPECIFICA: Tutti i super-host (almeno 100 prenotazioni totali) ===

    public List<Host> findAllSuperHost() throws SQLException {
        List<Host> hosts = new ArrayList<>();
        String sql = """
            SELECT u.id, u.nome, u.cognome, u.email, u.indirizzo, h.codice_host,
                   COUNT(p.id) AS totale_prenotazioni
            FROM host h
            JOIN utente u ON h.id = u.id
            JOIN abitazione a ON h.id = a.host_id
            JOIN prenotazione p ON a.id = p.abitazione_id
            GROUP BY u.id, h.codice_host
            HAVING COUNT(p.id) >= 100
            """;

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                hosts.add(mapRowToHost(rs));
            }
        }
        return hosts;
    }

    // === Helper ===

    private Host mapRowToHost(ResultSet rs) throws SQLException {
        Host h = new Host();
        h.setId(rs.getInt("id"));
        h.setNome(rs.getString("nome"));
        h.setCognome(rs.getString("cognome"));
        h.setEmail(rs.getString("email"));
        h.setIndirizzo(rs.getString("indirizzo"));
        h.setCodiceHost(rs.getString("codice_host"));
        return h;
    }
}
