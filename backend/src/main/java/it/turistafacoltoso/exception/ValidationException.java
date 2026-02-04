package it.turistafacoltoso.exception;

/**
 * Eccezione per errori di validazione (es. date prenotazione fuori disponibilità).
 * Restituisce HTTP 400.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}
