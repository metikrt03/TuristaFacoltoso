-- 1. UTENTE
CREATE TABLE utente (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    indirizzo VARCHAR(150)
);

-- 2. HOST
CREATE TABLE host (
    id INTEGER PRIMARY KEY,
    codice_host VARCHAR(20) UNIQUE NOT NULL,
    CONSTRAINT fk_host_utente
        FOREIGN KEY (id)
        REFERENCES utente(id)
        ON DELETE CASCADE
);

-- 3. ABITAZIONE
CREATE TABLE abitazione (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    indirizzo VARCHAR(150) NOT NULL,
    locali INTEGER NOT NULL,
    posti_letto INTEGER NOT NULL,
    piano INTEGER,
    prezzo NUMERIC(8,2) NOT NULL,
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    host_id INTEGER NOT NULL,
    CONSTRAINT fk_abitazione_host
        FOREIGN KEY (host_id)
        REFERENCES host(id)
        ON DELETE CASCADE
);

-- 4. PRENOTAZIONE
CREATE TABLE prenotazione (
    id SERIAL PRIMARY KEY,
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    utente_id INTEGER NOT NULL,
    abitazione_id INTEGER NOT NULL,
    CONSTRAINT fk_prenotazione_utente
        FOREIGN KEY (utente_id)
        REFERENCES utente(id),
    CONSTRAINT fk_prenotazione_abitazione
        FOREIGN KEY (abitazione_id)
        REFERENCES abitazione(id)
);

-- 5. FEEDBACK
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    titolo VARCHAR(100),
    testo TEXT,
    punteggio INTEGER CHECK (punteggio BETWEEN 1 AND 5),
    prenotazione_id INTEGER UNIQUE NOT NULL,
    CONSTRAINT fk_feedback_prenotazione
        FOREIGN KEY (prenotazione_id)
        REFERENCES prenotazione(id)
        ON DELETE CASCADE
);
