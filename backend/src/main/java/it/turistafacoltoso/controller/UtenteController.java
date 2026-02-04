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

        app.get("/api/utenti", ctx -> {
            log.info("Richiesta lista utenti");
            ctx.json(utenteService.findAll());
        });

        app.get("/api/utenti/{id}", ctx -> ControllerUtil.getById(ctx, "id", utenteService::findById, "Utente non trovato"));

        app.post("/api/utenti", ctx -> {
            Utente utente = ctx.bodyAsClass(Utente.class);
            Utente created = utenteService.create(utente);
            log.info("Creato utente con id: {}", created.getId());
            ctx.status(201).json(created);
        });

        app.put("/api/utenti/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Utente utente = ctx.bodyAsClass(Utente.class);
            Utente updated = utenteService.update(id, utente);
            ctx.json(updated);
        });

        app.delete("/api/utenti/{id}", ctx -> {
            log.info("Eliminato utente con id: {}", ctx.pathParam("id"));
            ControllerUtil.deleteById(ctx, "id", utenteService::delete, "Utente non trovato");
        });

        app.get("/api/utenti/report/top-giorni", ctx -> {
            log.info("Richiesta top 5 utenti per giorni prenotati ultimo mese");
            ctx.json(utenteService.findTop5UtentiPiuGiorniUltimoMese());
        });
    }
}
