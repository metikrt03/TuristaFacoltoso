package it.turistafacoltoso.util;

import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DatabaseConnection {

    private static String url;
    private static String user;
    private static String pwd;
    private static boolean initialized = false;

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnection.class);

    private DatabaseConnection() {
    }

    public static void init(String configPath) {
        Properties props = new Properties();

        try (FileInputStream fis = new FileInputStream(configPath)) {
            props.load(fis);

            url = props.getProperty("db.url");
            user = props.getProperty("db.user");
            pwd = props.getProperty("db.pwd");

            initialized = true;
            Class.forName("org.postgresql.Driver");

        } catch (IOException | ClassNotFoundException e) {
            log.error("Error initializing DatabaseConnection with config {}: {}", configPath, e.getMessage(), e);
            throw new RuntimeException("Error: props file not found: " + configPath, e);
        }
    }

    public static Connection getConnection() throws SQLException {

        if (!initialized) {
            throw new RuntimeException("Execute init() first!");
        }

        return DriverManager.getConnection(url, user, pwd);

    }
}
