package it.turistafacoltoso.controller;

import io.javalin.Javalin;
import it.turistafacoltoso.model.Utente;
import it.turistafacoltoso.service.UtenteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UtenteController {

    private static final Logger log = LoggerFactory.getLogger(UtenteController.class);
    private final UtenteService utenteService = new UtenteService();

    public void registerRoutes(Javalin app) {

        // GET /api/utenti - tutti gli utenti
        app.get("/api/utenti", ctx -> {
            log.info("Richiesta lista utenti");
            ctx.json(utenteService.findAll());
        });

        // GET /api/utenti/{id} - utente per id
        app.get("/api/utenti/{id}", ctx -> ControllerUtil.getById(ctx, "id", utenteService::findById, "Utente non trovato"));

        // POST /api/utenti - crea utente
        app.post("/api/utenti", ctx -> {
            Utente utente = ctx.bodyAsClass(Utente.class);
            Utente created = utenteService.create(utente);
            log.info("Creato utente con id: {}", created.getId());
            ctx.status(201).json(created);
        });

        // PUT /api/utenti/{id} - modifica utente
        app.put("/api/utenti/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Utente utente = ctx.bodyAsClass(Utente.class);
            Utente updated = utenteService.update(id, utente);
            ctx.json(updated);
        });

        // DELETE /api/utenti/{id} - elimina utente
        app.delete("/api/utenti/{id}", ctx -> {
            log.info("Eliminato utente con id: {}", ctx.pathParam("id"));
            ControllerUtil.deleteById(ctx, "id", utenteService::delete, "Utente non trovato");
        });

        // GET /api/utenti/report/top-giorni - Top 5 utenti con più giorni prenotati ultimo mese
        app.get("/api/utenti/report/top-giorni", ctx -> {
            log.info("Richiesta top 5 utenti per giorni prenotati ultimo mese");
            ctx.json(utenteService.findTop5UtentiPiuGiorniUltimoMese());
        });
    }
}
