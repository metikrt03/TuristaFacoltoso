package it.turistafacoltoso.controller;

import io.javalin.http.Context;
import it.turistafacoltoso.exception.NotFoundException;

import java.util.function.Function;
import java.util.function.IntFunction;

/**
 * Utility per ridurre codice ripetuto nei controller (get by id, delete).
 */
public final class ControllerUtil {

    private ControllerUtil() {}

    /** GET by id: se trovato → 200 + json, altrimenti lancia NotFoundException. */
    public static <T> void getById(Context ctx, String pathParam, Function<Integer, T> finder, String entityName) throws Exception {
        Integer id = Integer.parseInt(ctx.pathParam(pathParam));
        T entity = finder.apply(id);
        if (entity != null) {
            ctx.json(entity);
        } else {
            throw new NotFoundException(entityName);
        }
    }

    /** DELETE by id: se eliminato → 204, altrimenti lancia NotFoundException. */
    public static void deleteById(Context ctx, String pathParam, IntFunction<Boolean> deleter, String entityName) throws Exception {
        Integer id = Integer.parseInt(ctx.pathParam(pathParam));
        if (Boolean.TRUE.equals(deleter.apply(id))) {
            ctx.status(204);
        } else {
            throw new NotFoundException(entityName);
        }
    }
}
