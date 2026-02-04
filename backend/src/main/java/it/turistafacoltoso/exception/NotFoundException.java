package it.turistafacoltoso.exception;

/**
 * Eccezione lanciata quando una risorsa richiesta non è stata trovata (es. GET by id).
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
