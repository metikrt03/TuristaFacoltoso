package it.turistafacoltoso.controller;

import io.javalin.Javalin;
import it.turistafacoltoso.model.Feedback;
import it.turistafacoltoso.service.FeedbackService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FeedbackController {

    private static final Logger log = LoggerFactory.getLogger(FeedbackController.class);
    private final FeedbackService feedbackService = new FeedbackService();

    public void registerRoutes(Javalin app) {

        app.get("/api/feedback", ctx -> {
            log.info("Richiesta lista feedback");
            ctx.json(feedbackService.findAll());
        });

        app.get("/api/feedback/{id}", ctx -> ControllerUtil.getById(ctx, "id", feedbackService::findById, "Feedback non trovato"));

        app.get("/api/feedback/prenotazione/{prenotazioneId}", ctx -> {
            int prenotazioneId = Integer.parseInt(ctx.pathParam("prenotazioneId"));
            Feedback f = feedbackService.findByPrenotazioneId(prenotazioneId);
            if (f != null) ctx.json(f);
            else ctx.status(404).json(java.util.Map.of("error", "Feedback non trovato per questa prenotazione"));
        });

        app.post("/api/feedback", ctx -> {
            Feedback feedback = ctx.bodyAsClass(Feedback.class);
            Feedback created = feedbackService.create(feedback);
            log.info("Creato feedback con id: {}", created.getId());
            ctx.status(201).json(created);
        });

        app.put("/api/feedback/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Feedback feedback = ctx.bodyAsClass(Feedback.class);
            Feedback updated = feedbackService.update(id, feedback);
            ctx.json(updated);
        });

        app.delete("/api/feedback/{id}", ctx -> {
            log.info("Eliminato feedback con id: {}", ctx.pathParam("id"));
            ControllerUtil.deleteById(ctx, "id", feedbackService::delete, "Feedback non trovato");
        });
    }
}
