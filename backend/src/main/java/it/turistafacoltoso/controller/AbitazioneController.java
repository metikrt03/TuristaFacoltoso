package it.turistafacoltoso.controller;

import io.javalin.Javalin;
import it.turistafacoltoso.model.Abitazione;
import it.turistafacoltoso.service.AbitazioneService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AbitazioneController {

    private static final Logger log = LoggerFactory.getLogger(AbitazioneController.class);
    private final AbitazioneService abitazioneService = new AbitazioneService();

    public void registerRoutes(Javalin app) {

        // GET /api/abitazioni - tutte le abitazioni
        app.get("/api/abitazioni", ctx -> {
            log.info("Richiesta lista abitazioni");
            ctx.json(abitazioneService.findAll());
        });

        // GET /api/abitazioni/{id} - abitazione per id
        app.get("/api/abitazioni/{id}", ctx -> ControllerUtil.getById(ctx, "id", abitazioneService::findById, "Abitazione non trovata"));

        // GET /api/abitazioni/host/{codiceHost} - abitazioni per codice host
        app.get("/api/abitazioni/host/{codiceHost}", ctx -> {
            String codice = ctx.pathParam("codiceHost");
            log.info("Richiesta abitazioni per host: {}", codice);
            ctx.json(abitazioneService.findByCodiceHost(codice));
        });

        // POST /api/abitazioni - crea abitazione
        app.post("/api/abitazioni", ctx -> {
            Abitazione abitazione = ctx.bodyAsClass(Abitazione.class);
            Abitazione created = abitazioneService.create(abitazione);
            log.info("Creata abitazione con id: {}", created.getId());
            ctx.status(201).json(created);
        });

        // PUT /api/abitazioni/{id} - modifica abitazione
        app.put("/api/abitazioni/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Abitazione abitazione = ctx.bodyAsClass(Abitazione.class);
            Abitazione updated = abitazioneService.update(id, abitazione);
            log.info("Aggiornata abitazione con id: {}", id);
            ctx.json(updated);
        });

        // DELETE /api/abitazioni/{id} - elimina abitazione
        app.delete("/api/abitazioni/{id}", ctx -> {
            log.info("Eliminata abitazione con id: {}", ctx.pathParam("id"));
            ControllerUtil.deleteById(ctx, "id", abitazioneService::delete, "Abitazione non trovata");
        });

        // GET /api/abitazioni/report/piu-gettonata - Abitazione più gettonata ultimo mese
        app.get("/api/abitazioni/report/piu-gettonata", ctx -> {
            log.info("Richiesta abitazione più gettonata ultimo mese");
            Abitazione abitazione = abitazioneService.findPiuGettonataUltimoMese();
            if (abitazione != null) {
                ctx.json(abitazione);
            } else {
                ctx.json(java.util.Map.of("message", "Nessuna prenotazione nell'ultimo mese"));
            }
        });

        // GET /api/abitazioni/report/media-posti-letto - Media posti letto
        app.get("/api/abitazioni/report/media-posti-letto", ctx -> {
            log.info("Richiesta media posti letto");
            Double media = abitazioneService.getMediaPostiLetto();
            ctx.json(java.util.Map.of("mediaPostiLetto", media != null ? media : 0));
        });
    }
}
