package it.turistafacoltoso;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;
import it.turistafacoltoso.controller.AbitazioneController;
import it.turistafacoltoso.controller.FeedbackController;
import it.turistafacoltoso.controller.HostController;
import it.turistafacoltoso.controller.PrenotazioneController;
import it.turistafacoltoso.controller.UtenteController;
import it.turistafacoltoso.exception.DataAccessException;
import it.turistafacoltoso.exception.NotFoundException;
import it.turistafacoltoso.exception.ValidationException;
import it.turistafacoltoso.util.DatabaseConnection;

public class Main {

    private static final Logger log = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {

        DatabaseConnection.init("config.properties");
        log.info("Connessione al database inizializzata");

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(rule -> {
                    rule.anyHost();
                });
            });
            config.jsonMapper(new JavalinJackson(objectMapper, false));
        });

        app.exception(NotFoundException.class, (e, ctx) -> {
            log.warn("Risorsa non trovata: {}", e.getMessage());
            ctx.status(404).json(Map.of("error", e.getMessage()));
        });
        app.exception(ValidationException.class, (e, ctx) -> {
            log.warn("Validazione fallita: {}", e.getMessage());
            ctx.status(400).json(Map.of("error", e.getMessage()));
        });
        app.exception(DataAccessException.class, (e, ctx) -> {
            log.error("Errore accesso dati: {}", e.getMessage(), e);
            ctx.status(500).json(Map.of("error", e.getMessage()));
        });
        app.exception(Exception.class, (e, ctx) -> {
            log.error("Errore: {}", e.getMessage(), e);
            ctx.status(500).json(Map.of("error", e.getMessage()));
        });

        new UtenteController().registerRoutes(app);
        new HostController().registerRoutes(app);
        new AbitazioneController().registerRoutes(app);
        new PrenotazioneController().registerRoutes(app);
        new FeedbackController().registerRoutes(app);

        app.start(7000);
        log.info("Server avviato su http://localhost:7000");
    }
}
