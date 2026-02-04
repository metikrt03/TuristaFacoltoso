package it.turistafacoltoso.exception;

/**
 * Eccezione lanciata in caso di errore durante l'accesso al database
 * (es. wrap di SQLException nei DAO).
 */
public class DataAccessException extends RuntimeException {

    public DataAccessException(String message) {
        super(message);
    }

    public DataAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}
