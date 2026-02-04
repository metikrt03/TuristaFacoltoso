package it.turistafacoltoso.model;

public class Feedback {

    private Integer id;
    private String titolo;
    private String testo;
    private Integer punteggio;      // da 1 a 5
    private Integer prenotazioneId;

    public Feedback() {
    }

    public Feedback(Integer id, String titolo, String testo, Integer punteggio, Integer prenotazioneId) {
        this.id = id;
        this.titolo = titolo;
        this.testo = testo;
        this.punteggio = punteggio;
        this.prenotazioneId = prenotazioneId;
    }

    // Getters e Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitolo() {
        return titolo;
    }

    public void setTitolo(String titolo) {
        this.titolo = titolo;
    }

    public String getTesto() {
        return testo;
    }

    public void setTesto(String testo) {
        this.testo = testo;
    }

    public Integer getPunteggio() {
        return punteggio;
    }

    public void setPunteggio(Integer punteggio) {
        this.punteggio = punteggio;
    }

    public Integer getPrenotazioneId() {
        return prenotazioneId;
    }

    public void setPrenotazioneId(Integer prenotazioneId) {
        this.prenotazioneId = prenotazioneId;
    }

    @Override
    public String toString() {
        return "Feedback{" +
                "id=" + id +
                ", titolo='" + titolo + '\'' +
                ", testo='" + testo + '\'' +
                ", punteggio=" + punteggio +
                ", prenotazioneId=" + prenotazioneId +
                '}';
    }
}
