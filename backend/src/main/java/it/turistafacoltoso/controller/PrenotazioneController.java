package it.turistafacoltoso.controller;

import io.javalin.Javalin;
import it.turistafacoltoso.model.Prenotazione;
import it.turistafacoltoso.service.PrenotazioneService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrenotazioneController {

    private static final Logger log = LoggerFactory.getLogger(PrenotazioneController.class);
    private final PrenotazioneService prenotazioneService = new PrenotazioneService();

    public void registerRoutes(Javalin app) {

        // GET /api/prenotazioni - tutte le prenotazioni
        app.get("/api/prenotazioni", ctx -> {
            log.info("Richiesta lista prenotazioni");
            ctx.json(prenotazioneService.findAll());
        });

        // GET /api/prenotazioni/{id} - prenotazione per id
        app.get("/api/prenotazioni/{id}", ctx -> ControllerUtil.getById(ctx, "id", prenotazioneService::findById, "Prenotazione non trovata"));

        // GET /api/prenotazioni/ultima/{utenteId} - ultima prenotazione per utente
        app.get("/api/prenotazioni/ultima/{utenteId}", ctx -> {
            int utenteId = Integer.parseInt(ctx.pathParam("utenteId"));
            log.info("Richiesta ultima prenotazione per utente: {}", utenteId);
            Prenotazione p = prenotazioneService.findUltimaByUtenteId(utenteId);
            if (p != null) ctx.json(p);
            else ctx.status(404).json(java.util.Map.of("error", "Nessuna prenotazione trovata per questo utente"));
        });

        // POST /api/prenotazioni - crea prenotazione
        app.post("/api/prenotazioni", ctx -> {
            Prenotazione prenotazione = ctx.bodyAsClass(Prenotazione.class);
            Prenotazione created = prenotazioneService.create(prenotazione);
            log.info("Creata prenotazione con id: {}", created.getId());
            ctx.status(201).json(created);
        });

        // PUT /api/prenotazioni/{id} - modifica prenotazione
        app.put("/api/prenotazioni/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Prenotazione p = ctx.bodyAsClass(Prenotazione.class);
            Prenotazione updated = prenotazioneService.update(id, p);
            ctx.json(updated);
        });

        // DELETE /api/prenotazioni/{id} - elimina prenotazione
        app.delete("/api/prenotazioni/{id}", ctx -> {
            log.info("Eliminata prenotazione con id: {}", ctx.pathParam("id"));
            ControllerUtil.deleteById(ctx, "id", prenotazioneService::delete, "Prenotazione non trovata");
        });
    }
}
