package it.turistafacoltoso.util;

// Pattern Singleton
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DatabaseConnection {

    private static String url;
    private static String user;
    private static String pwd;
    private static boolean initialized = false;

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
            e.printStackTrace();
            throw new RuntimeException("Error: props file not found: " + configPath, e);
        }
    }

    public static Connection getConnection() throws SQLException {

        if (!initialized) {
            throw new RuntimeException("Execute init() first!");
        }

        // Il driverManager me lo prendo dal package di postgresql
        return DriverManager.getConnection(url, user, pwd);

    }
}
