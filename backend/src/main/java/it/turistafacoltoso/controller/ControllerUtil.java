package it.turistafacoltoso.controller;

import java.util.function.Function;
import java.util.function.IntFunction;

import io.javalin.http.Context;
import it.turistafacoltoso.exception.NotFoundException;

public final class ControllerUtil {

    private ControllerUtil() {}

    public static <T> void getById(Context ctx, String pathParam, Function<Integer, T> finder, String entityName) throws Exception {
        Integer id = Integer.valueOf(ctx.pathParam(pathParam));
        T entity = finder.apply(id);
        if (entity != null) {
            ctx.json(entity);
        } else {
            throw new NotFoundException(entityName);
        }
    }

    public static void deleteById(Context ctx, String pathParam, IntFunction<Boolean> deleter, String entityName) throws Exception {
        Integer id = Integer.valueOf(ctx.pathParam(pathParam));
        if (Boolean.TRUE.equals(deleter.apply(id))) {
            ctx.status(204);
        } else {
            throw new NotFoundException(entityName);
        }
    }
}
