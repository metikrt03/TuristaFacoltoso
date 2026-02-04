package it.turistafacoltoso.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Abitazione {

    private Integer id;
    private String nome;
    private String indirizzo;
    private Integer locali;
    private Integer postiLetto;
    private Integer piano;           // può essere null
    private BigDecimal prezzo;
    private LocalDate dataInizio;
    private LocalDate dataFine;
    private Integer hostId;

    public Abitazione() {
    }

    public Abitazione(Integer id, String nome, String indirizzo, Integer locali, Integer postiLetto,
                      Integer piano, BigDecimal prezzo, LocalDate dataInizio, LocalDate dataFine, Integer hostId) {
        this.id = id;
        this.nome = nome;
        this.indirizzo = indirizzo;
        this.locali = locali;
        this.postiLetto = postiLetto;
        this.piano = piano;
        this.prezzo = prezzo;
        this.dataInizio = dataInizio;
        this.dataFine = dataFine;
        this.hostId = hostId;
    }

    // Getters e Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getIndirizzo() {
        return indirizzo;
    }

    public void setIndirizzo(String indirizzo) {
        this.indirizzo = indirizzo;
    }

    public Integer getLocali() {
        return locali;
    }

    public void setLocali(Integer locali) {
        this.locali = locali;
    }

    public Integer getPostiLetto() {
        return postiLetto;
    }

    public void setPostiLetto(Integer postiLetto) {
        this.postiLetto = postiLetto;
    }

    public Integer getPiano() {
        return piano;
    }

    public void setPiano(Integer piano) {
        this.piano = piano;
    }

    public BigDecimal getPrezzo() {
        return prezzo;
    }

    public void setPrezzo(BigDecimal prezzo) {
        this.prezzo = prezzo;
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

    public Integer getHostId() {
        return hostId;
    }

    public void setHostId(Integer hostId) {
        this.hostId = hostId;
    }

    @Override
    public String toString() {
        return "Abitazione{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", indirizzo='" + indirizzo + '\'' +
                ", locali=" + locali +
                ", postiLetto=" + postiLetto +
                ", piano=" + piano +
                ", prezzo=" + prezzo +
                ", dataInizio=" + dataInizio +
                ", dataFine=" + dataFine +
                ", hostId=" + hostId +
                '}';
    }
}
