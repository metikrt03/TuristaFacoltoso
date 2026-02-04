package it.turistafacoltoso.controller;

import io.javalin.Javalin;
import it.turistafacoltoso.model.Host;
import it.turistafacoltoso.service.HostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HostController {

    private static final Logger log = LoggerFactory.getLogger(HostController.class);
    private final HostService hostService = new HostService();

    public void registerRoutes(Javalin app) {

        // GET /api/host - tutti gli host
        app.get("/api/host", ctx -> {
            log.info("Richiesta lista host");
            ctx.json(hostService.findAll());
        });

        // GET /api/host/{id} - host per id
        app.get("/api/host/{id}", ctx -> ControllerUtil.getById(ctx, "id", hostService::findById, "Host non trovato"));

        // GET /api/host/codice/{codiceHost} - host per codice
        app.get("/api/host/codice/{codiceHost}", ctx -> {
            Host host = hostService.findByCodiceHost(ctx.pathParam("codiceHost"));
            if (host != null) ctx.json(host);
            else ctx.status(404).json(java.util.Map.of("error", "Host non trovato"));
        });

        // POST /api/host - crea host
        app.post("/api/host", ctx -> {
            Host host = ctx.bodyAsClass(Host.class);
            Host created = hostService.create(host);
            log.info("Creato host con id: {}", created.getId());
            ctx.status(201).json(created);
        });

        // PUT /api/host/{id} - modifica host
        app.put("/api/host/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Host host = ctx.bodyAsClass(Host.class);
            Host updated = hostService.update(id, host);
            ctx.json(updated);
        });

        // DELETE /api/host/{id} - elimina host
        app.delete("/api/host/{id}", ctx -> {
            log.info("Eliminato host con id: {}", ctx.pathParam("id"));
            ControllerUtil.deleteById(ctx, "id", hostService::delete, "Host non trovato");
        });

        // GET /api/host/report/top-prenotazioni - Host con più prenotazioni ultimo mese
        app.get("/api/host/report/top-prenotazioni", ctx -> {
            log.info("Richiesta host con più prenotazioni ultimo mese");
            ctx.json(hostService.findHostPiuPrenotazioniUltimoMese());
        });

        // GET /api/host/report/super-host - Tutti i super-host
        app.get("/api/host/report/super-host", ctx -> {
            log.info("Richiesta lista super-host");
            ctx.json(hostService.findAllSuperHost());
        });
    }
}
