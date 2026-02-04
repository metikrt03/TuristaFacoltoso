package it.turistafacoltoso.model;

import java.time.LocalDate;

public class Prenotazione {

    private Integer id;
    private LocalDate dataInizio;
    private LocalDate dataFine;
    private Integer utenteId;
    private Integer abitazioneId;

    public Prenotazione() {
    }

    public Prenotazione(Integer id, LocalDate dataInizio, LocalDate dataFine, Integer utenteId, Integer abitazioneId) {
        this.id = id;
        this.dataInizio = dataInizio;
        this.dataFine = dataFine;
        this.utenteId = utenteId;
        this.abitazioneId = abitazioneId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDate getDataInizio() {
        return dataInizio;
    }

    public void setDataInizio(LocalDate dataInizio) {
        this.dataInizio = dataInizio;
    }

    public LocalDate getDataFine() {
        return dataFine;
    }

    public void setDataFine(LocalDate dataFine) {
        this.dataFine = dataFine;
    }

    public Integer getUtenteId() {
        return utenteId;
    }

    public void setUtenteId(Integer utenteId) {
        this.utenteId = utenteId;
    }

    public Integer getAbitazioneId() {
        return abitazioneId;
    }

    public void setAbitazioneId(Integer abitazioneId) {
        this.abitazioneId = abitazioneId;
    }

    @Override
    public String toString() {
        return "Prenotazione{" +
                "id=" + id +
                ", dataInizio=" + dataInizio +
                ", dataFine=" + dataFine +
                ", utenteId=" + utenteId +
                ", abitazioneId=" + abitazioneId +
                '}';
    }
}
