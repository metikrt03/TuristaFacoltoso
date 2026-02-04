package it.turistafacoltoso.model;

public class Host extends Utente {

    private String codiceHost;

    public Host() {
    }

    public Host(Integer id, String nome, String cognome, String email, String indirizzo, String codiceHost) {
        super(id, nome, cognome, email, indirizzo);
        this.codiceHost = codiceHost;
    }

    public String getCodiceHost() {
        return codiceHost;
    }

    public void setCodiceHost(String codiceHost) {
        this.codiceHost = codiceHost;
    }

    public boolean isSuperHost(int totalePrenotazioni) {
        return totalePrenotazioni >= 100;
    }

    @Override
    public String toString() {
        return "Host{" +
                "id=" + getId() +
                ", nome='" + getNome() + '\'' +
                ", cognome='" + getCognome() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", indirizzo='" + getIndirizzo() + '\'' +
                ", codiceHost='" + codiceHost + '\'' +
                '}';
    }
}
