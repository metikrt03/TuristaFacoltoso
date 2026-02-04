-- ============================================
-- TURISTA FACOLTOSO - DML (Data Manipulation Language)
-- Script con dati di esempio
-- ============================================

-- UTENTI (alcuni diventeranno host, altri solo ospiti)
INSERT INTO utente (nome, cognome, email, indirizzo) VALUES
('Mario', 'Rossi', 'mario.rossi@email.it', 'Via Roma 1, Milano'),
('Luigi', 'Verdi', 'luigi.verdi@email.it', 'Via Napoli 25, Roma'),
('Anna', 'Bianchi', 'anna.bianchi@email.it', 'Corso Italia 10, Torino'),
('Giulia', 'Neri', 'giulia.neri@email.it', 'Piazza Duomo 5, Firenze'),
('Marco', 'Gialli', 'marco.gialli@email.it', 'Via Veneto 100, Roma'),
('Sara', 'Blu', 'sara.blu@email.it', 'Via Dante 33, Bologna'),
('Paolo', 'Viola', 'paolo.viola@email.it', 'Corso Magenta 8, Milano'),
('Elena', 'Rosa', 'elena.rosa@email.it', 'Via Garibaldi 12, Genova'),
('Francesco', 'Marrone', 'francesco.marrone@email.it', 'Via Mazzini 45, Napoli'),
('Chiara', 'Arancio', 'chiara.arancio@email.it', 'Piazza San Marco 1, Venezia');

-- HOST (utenti 1, 2, 3 diventano host)
INSERT INTO host (id, codice_host) VALUES
(1, 'HOST001'),
(2, 'HOST002'),
(3, 'HOST003');

-- ABITAZIONI
INSERT INTO abitazione (nome, indirizzo, locali, posti_letto, piano, prezzo, data_inizio, data_fine, host_id) VALUES
('Appartamento Centro Milano', 'Via Montenapoleone 10, Milano', 3, 4, 2, 150.00, '2025-01-01', '2025-12-31', 1),
('Loft Moderno Navigli', 'Ripa di Porta Ticinese 55, Milano', 2, 2, 1, 120.00, '2025-01-01', '2025-12-31', 1),
('Villa Vista Mare', 'Via Costiera 100, Amalfi', 5, 8, 0, 350.00, '2025-05-01', '2025-10-31', 2),
('Attico Panoramico Roma', 'Via del Corso 200, Roma', 4, 6, 5, 280.00, '2025-01-01', '2025-12-31', 2),
('Casa Colonica Toscana', 'Strada del Chianti 15, Greve', 6, 10, 0, 400.00, '2025-03-01', '2025-11-30', 3),
('Monolocale Torino Centro', 'Via Po 22, Torino', 1, 2, 3, 80.00, '2025-01-01', '2025-12-31', 3);

-- PRENOTAZIONI (con alcune nell'ultimo mese per testare le query)
INSERT INTO prenotazione (data_inizio, data_fine, utente_id, abitazione_id) VALUES
-- Prenotazioni recenti (ultimo mese - gennaio 2026)
('2026-01-05', '2026-01-10', 4, 1),   -- Giulia, 5 giorni
('2026-01-08', '2026-01-15', 5, 2),   -- Marco, 7 giorni
('2026-01-10', '2026-01-20', 6, 4),   -- Sara, 10 giorni
('2026-01-12', '2026-01-14', 7, 6),   -- Paolo, 2 giorni
('2026-01-15', '2026-01-25', 8, 1),   -- Elena, 10 giorni (stessa abitazione di Giulia)
('2026-01-18', '2026-01-28', 9, 1),   -- Francesco, 10 giorni (abitazione più gettonata)
('2026-01-20', '2026-01-22', 10, 3),  -- Chiara, 2 giorni
('2026-01-01', '2026-01-31', 4, 4),   -- Giulia, 30 giorni (utente con più giorni)

-- Prenotazioni passate (per storico)
('2025-06-01', '2025-06-07', 5, 3),
('2025-07-10', '2025-07-17', 6, 5),
('2025-08-01', '2025-08-10', 7, 1),
('2025-09-15', '2025-09-20', 8, 2),
('2025-10-01', '2025-10-05', 9, 4),
('2025-11-10', '2025-11-15', 10, 6),
('2025-12-20', '2025-12-27', 4, 5);

-- FEEDBACK
INSERT INTO feedback (titolo, testo, punteggio, prenotazione_id) VALUES
('Ottimo soggiorno!', 'Appartamento pulito e ben posizionato. Host molto disponibile.', 5, 1),
('Carino ma rumoroso', 'Il loft è bello ma di notte si sente il traffico.', 3, 2),
('Esperienza fantastica', 'Vista mare incredibile, torneremo sicuramente!', 5, 9),
('Perfetto per famiglie', 'Casa spaziosa, ideale per gruppi numerosi.', 4, 10),
('Buon rapporto qualità-prezzo', 'Niente di eccezionale ma onesto.', 3, 11);
