package it.turistafacoltoso.util;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class DateConverter {

    public static LocalDate date2LocalDate(Date date2convert) {
        return LocalDate.ofInstant(date2convert.toInstant(), ZoneId.systemDefault());
    }

    public static LocalDateTime convertLocalDateTimeFromTimestamp(Timestamp ts) {
        return ts.toLocalDateTime();
    }

    public static Date localDate2Date(LocalDate localDate) {
        return Date.valueOf(localDate);
    }
}
