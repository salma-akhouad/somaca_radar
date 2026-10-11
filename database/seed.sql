\encoding UTF8

-- SOMACA RADAR - DONNÉES DE DÉVELOPPEMENT

-- UTILISATEURS
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, id_role) VALUES
    ('Zerouali', 'Inès', 'ines.zerouali@somaca.local', '$2b$12$FGHJC/bYQ6Vy2IOsMH1C1ORspqq2e2t5ghrfMMkv0O4Sv6wKWgY/e', (SELECT id_role FROM role WHERE nom_role = 'administrateur')),
    ('El Kettani', 'Mehdi', 'mehdi.elkettani@somaca.local', '$2b$12$FGHJC/bYQ6Vy2IOsMH1C1ORspqq2e2t5ghrfMMkv0O4Sv6wKWgY/e', (SELECT id_role FROM role WHERE nom_role = 'superviseur')),
    ('Tahiri', 'Soukaina', 'soukaina.tahiri@somaca.local', '$2b$12$FGHJC/bYQ6Vy2IOsMH1C1ORspqq2e2t5ghrfMMkv0O4Sv6wKWgY/e', (SELECT id_role FROM role WHERE nom_role = 'superviseur')),
    ('Alaoui', 'Nassim', 'nassim.alaoui@somaca.local', '$2b$12$FGHJC/bYQ6Vy2IOsMH1C1ORspqq2e2t5ghrfMMkv0O4Sv6wKWgY/e', (SELECT id_role FROM role WHERE nom_role = 'technicien')),
    ('Benjelloun', 'Rim', 'rim.benjelloun@somaca.local', '$2b$12$FGHJC/bYQ6Vy2IOsMH1C1ORspqq2e2t5ghrfMMkv0O4Sv6wKWgY/e', (SELECT id_role FROM role WHERE nom_role = 'technicien')),
    ('El Baroudi', 'Amine', 'amine.elbaroudi@somaca.local', '$2b$12$FGHJC/bYQ6Vy2IOsMH1C1ORspqq2e2t5ghrfMMkv0O4Sv6wKWgY/e', (SELECT id_role FROM role WHERE nom_role = 'operateur_de_production')),
    ('Bouziane', 'Lina', 'lina.bouziane@somaca.local', '$2b$12$FGHJC/bYQ6Vy2IOsMH1C1ORspqq2e2t5ghrfMMkv0O4Sv6wKWgY/e', (SELECT id_role FROM role WHERE nom_role = 'operateur_de_production')),
    ('Chraibi', 'Younes', 'younes.chraibi@somaca.local', '$2b$12$FGHJC/bYQ6Vy2IOsMH1C1ORspqq2e2t5ghrfMMkv0O4Sv6wKWgY/e', (SELECT id_role FROM role WHERE nom_role = 'operateur_de_production'));

-- DÉPARTEMENTS
INSERT INTO departement (nom_dep) VALUES ('Montage'), ('Tôlerie'), ('Peinture');

-- UET DE LA CARTOGRAPHIE MONTAGE
INSERT INTO unite (nom_unite, id_dep, represente_carte) VALUES
    ('UET 1', (SELECT id_dep FROM departement WHERE nom_dep = 'Montage'), TRUE),
    ('UET 2', (SELECT id_dep FROM departement WHERE nom_dep = 'Montage'), TRUE),
    ('UET 3', (SELECT id_dep FROM departement WHERE nom_dep = 'Montage'), TRUE),
    ('UET 4', (SELECT id_dep FROM departement WHERE nom_dep = 'Montage'), TRUE);

-- 24 POTEAUX : 6 PAR UET
INSERT INTO poteau (nom_poteau, id_unite, represente_carte) VALUES
    ('P-01', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 1'), TRUE),
    ('P-02', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 1'), TRUE),
    ('P-03', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 1'), TRUE),
    ('P-04', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 1'), TRUE),
    ('P-05', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 1'), TRUE),
    ('P-06', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 1'), TRUE),
    ('P-07', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 2'), TRUE),
    ('P-08', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 2'), TRUE),
    ('P-09', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 2'), TRUE),
    ('P-10', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 2'), TRUE),
    ('P-11', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 2'), TRUE),
    ('P-12', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 2'), TRUE),
    ('P-13', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 3'), TRUE),
    ('P-14', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 3'), TRUE),
    ('P-15', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 3'), TRUE),
    ('P-16', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 3'), TRUE),
    ('P-17', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 3'), TRUE),
    ('P-18', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 3'), TRUE),
    ('P-19', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 4'), TRUE),
    ('P-20', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 4'), TRUE),
    ('P-21', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 4'), TRUE),
    ('P-22', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 4'), TRUE),
    ('P-23', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 4'), TRUE),
    ('P-24', (SELECT id_unite FROM unite WHERE nom_unite = 'UET 4'), TRUE);

-- MACHINES : EXACTEMENT 2 PAR POTEAU DANS LES DONNÉES DE DÉMONSTRATION
INSERT INTO machine (nom_machine, type_machine, ip_address, mac_address, date_installation, id_poteau) VALUES
    ('Convoyeur P-01', 'Convoyeur', '10.42.20.11', '02:42:AC:14:01:01', '2023-04-06', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-01')),
    ('Poste de vissage P-01', 'Poste de vissage', '10.42.20.12', '02:42:AC:14:01:02', '2024-07-11', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-01')),
    ('Robot de manutention P-02', 'Robot de manutention', '10.42.20.13', '02:42:AC:14:02:01', '2025-10-16', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-02')),
    ('Scanner industriel P-02', 'Scanner industriel', '10.42.20.14', '02:42:AC:14:02:02', '2022-01-21', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-02')),
    ('Visseuse électrique P-03', 'Visseuse électrique', '10.42.20.15', '02:42:AC:14:03:01', '2023-04-26', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-03')),
    ('Terminal opérateur P-03', 'Terminal opérateur', '10.42.20.16', '02:42:AC:14:03:02', '2024-07-04', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-03')),
    ('Banc de contrôle P-04', 'Banc de contrôle', '10.42.20.17', '02:42:AC:14:04:01', '2025-10-09', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-04')),
    ('Armoire de commande P-04', 'Armoire de commande', '10.42.20.18', '02:42:AC:14:04:02', '2022-01-14', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-04')),
    ('Convoyeur P-05', 'Convoyeur', '10.42.20.19', '02:42:AC:14:05:01', '2023-04-19', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-05')),
    ('Capteur de présence P-05', 'Capteur de présence', '10.42.20.20', '02:42:AC:14:05:02', '2024-07-24', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-05')),
    ('Poste de contrôle P-06', 'Poste de contrôle', '10.42.20.21', '02:42:AC:14:06:01', '2025-10-02', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-06')),
    ('Imprimante industrielle P-06', 'Imprimante industrielle', '10.42.20.22', '02:42:AC:14:06:02', '2022-01-07', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-06')),
    ('Convoyeur P-07', 'Convoyeur', '10.42.21.23', '02:42:AC:15:07:01', '2023-04-12', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-07')),
    ('Poste de vissage P-07', 'Poste de vissage', '10.42.21.24', '02:42:AC:15:07:02', '2024-07-17', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-07')),
    ('Robot de manutention P-08', 'Robot de manutention', '10.42.21.25', '02:42:AC:15:08:01', '2025-10-22', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-08')),
    ('Scanner industriel P-08', 'Scanner industriel', '10.42.21.26', '02:42:AC:15:08:02', '2022-01-27', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-08')),
    ('Visseuse électrique P-09', 'Visseuse électrique', '10.42.21.27', '02:42:AC:15:09:01', '2023-04-05', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-09')),
    ('Terminal opérateur P-09', 'Terminal opérateur', '10.42.21.28', '02:42:AC:15:09:02', '2024-07-10', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-09')),
    ('Banc de contrôle P-10', 'Banc de contrôle', '10.42.21.29', '02:42:AC:15:0A:01', '2025-10-15', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-10')),
    ('Armoire de commande P-10', 'Armoire de commande', '10.42.21.30', '02:42:AC:15:0A:02', '2022-01-20', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-10')),
    ('Convoyeur P-11', 'Convoyeur', '10.42.21.31', '02:42:AC:15:0B:01', '2023-04-25', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-11')),
    ('Capteur de présence P-11', 'Capteur de présence', '10.42.21.32', '02:42:AC:15:0B:02', '2024-07-03', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-11')),
    ('Poste de contrôle P-12', 'Poste de contrôle', '10.42.21.33', '02:42:AC:15:0C:01', '2025-10-08', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-12')),
    ('Imprimante industrielle P-12', 'Imprimante industrielle', '10.42.21.34', '02:42:AC:15:0C:02', '2022-01-13', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-12')),
    ('Convoyeur P-13', 'Convoyeur', '10.42.22.35', '02:42:AC:16:0D:01', '2023-04-18', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-13')),
    ('Poste de vissage P-13', 'Poste de vissage', '10.42.22.36', '02:42:AC:16:0D:02', '2024-07-23', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-13')),
    ('Robot de manutention P-14', 'Robot de manutention', '10.42.22.37', '02:42:AC:16:0E:01', '2025-10-01', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-14')),
    ('Scanner industriel P-14', 'Scanner industriel', '10.42.22.38', '02:42:AC:16:0E:02', '2022-01-06', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-14')),
    ('Visseuse électrique P-15', 'Visseuse électrique', '10.42.22.39', '02:42:AC:16:0F:01', '2023-04-11', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-15')),
    ('Terminal opérateur P-15', 'Terminal opérateur', '10.42.22.40', '02:42:AC:16:0F:02', '2024-07-16', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-15')),
    ('Banc de contrôle P-16', 'Banc de contrôle', '10.42.22.41', '02:42:AC:16:10:01', '2025-10-21', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-16')),
    ('Armoire de commande P-16', 'Armoire de commande', '10.42.22.42', '02:42:AC:16:10:02', '2022-01-26', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-16')),
    ('Convoyeur P-17', 'Convoyeur', '10.42.22.43', '02:42:AC:16:11:01', '2023-04-04', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-17')),
    ('Capteur de présence P-17', 'Capteur de présence', '10.42.22.44', '02:42:AC:16:11:02', '2024-07-09', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-17')),
    ('Poste de contrôle P-18', 'Poste de contrôle', '10.42.22.45', '02:42:AC:16:12:01', '2025-10-14', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-18')),
    ('Imprimante industrielle P-18', 'Imprimante industrielle', '10.42.22.46', '02:42:AC:16:12:02', '2022-01-19', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-18')),
    ('Convoyeur P-19', 'Convoyeur', '10.42.23.47', '02:42:AC:17:13:01', '2023-04-24', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-19')),
    ('Poste de vissage P-19', 'Poste de vissage', '10.42.23.48', '02:42:AC:17:13:02', '2024-07-02', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-19')),
    ('Robot de manutention P-20', 'Robot de manutention', '10.42.23.49', '02:42:AC:17:14:01', '2025-10-07', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-20')),
    ('Scanner industriel P-20', 'Scanner industriel', '10.42.23.50', '02:42:AC:17:14:02', '2022-01-12', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-20')),
    ('Visseuse électrique P-21', 'Visseuse électrique', '10.42.23.51', '02:42:AC:17:15:01', '2023-04-17', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-21')),
    ('Terminal opérateur P-21', 'Terminal opérateur', '10.42.23.52', '02:42:AC:17:15:02', '2024-07-22', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-21')),
    ('Banc de contrôle P-22', 'Banc de contrôle', '10.42.23.53', '02:42:AC:17:16:01', '2025-10-27', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-22')),
    ('Armoire de commande P-22', 'Armoire de commande', '10.42.23.54', '02:42:AC:17:16:02', '2022-01-05', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-22')),
    ('Convoyeur P-23', 'Convoyeur', '10.42.23.55', '02:42:AC:17:17:01', '2023-04-10', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-23')),
    ('Capteur de présence P-23', 'Capteur de présence', '10.42.23.56', '02:42:AC:17:17:02', '2024-07-15', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-23')),
    ('Poste de contrôle P-24', 'Poste de contrôle', '10.42.23.57', '02:42:AC:17:18:01', '2025-10-20', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-24')),
    ('Imprimante industrielle P-24', 'Imprimante industrielle', '10.42.23.58', '02:42:AC:17:18:02', '2022-01-25', (SELECT id_poteau FROM poteau WHERE nom_poteau = 'P-24'));

-- PREMIER ÉTAT : TOUTE MACHINE COMMENCE EN ÉTAT OPÉRATIONNEL
INSERT INTO statut_historique (date_changement, id_machine, id_etat, id_util)
SELECT m.date_installation::timestamp, m.id_machine, e.id_etat, u.id_util
FROM machine m CROSS JOIN etat e CROSS JOIN utilisateur u
WHERE e.libelle_etat = 'Opérationnel'
  AND u.email = 'mehdi.elkettani@somaca.local';

-- INCIDENTS DE DÉMONSTRATION
-- Les signalements actifs ont toujours un état machine cohérent et lié par id_incident.
-- Les incidents résolus/fermés possèdent aussi un retour de la machine à l'état Opérationnel.

INSERT INTO incident (
    id_machine,
    problem,
    severity,
    status,
    confirmed_cause,
    applied_solution,
    created_at,
    created_by_user_id
) VALUES
    (
        (SELECT id_machine FROM machine WHERE nom_machine = 'Convoyeur P-05'),
        'Bruit anormal détecté au niveau du moteur du convoyeur.',
        'mineur',
        'ouvert',
        NULL,
        NULL,
        '2026-10-07 07:40:00+00',
        (SELECT id_util FROM utilisateur WHERE email = 'amine.elbaroudi@somaca.local')
    ),
    (
        (SELECT id_machine FROM machine WHERE nom_machine = 'Poste de vissage P-07'),
        'Couple de serrage irrégulier observé sur plusieurs cycles.',
        'majeur',
        'en_cours',
        'Dérive du capteur de couple.',
        NULL,
        '2026-10-07 08:20:00+00',
        (SELECT id_util FROM utilisateur WHERE email = 'lina.bouziane@somaca.local')
    ),
    (
        (SELECT id_machine FROM machine WHERE nom_machine = 'Poste de contrôle P-06'),
        'Perte intermittente du signal de sécurité provoquant l''arrêt du poste.',
        'critique',
        'en_cours',
        'Connecteur du circuit de sécurité mal fixé.',
        NULL,
        '2026-10-07 09:05:00+00',
        (SELECT id_util FROM utilisateur WHERE email = 'younes.chraibi@somaca.local')
    ),
    (
        (SELECT id_machine FROM machine WHERE nom_machine = 'Robot de manutention P-08'),
        'Le robot ne reprend pas son cycle après acquittement de l''alarme.',
        'critique',
        'en_attente',
        'Défaut intermittent du module de commande moteur.',
        NULL,
        '2026-10-07 10:15:00+00',
        (SELECT id_util FROM utilisateur WHERE email = 'amine.elbaroudi@somaca.local')
    ),
    (
        (SELECT id_machine FROM machine WHERE nom_machine = 'Terminal opérateur P-09'),
        'L''écran tactile répond de manière intermittente.',
        'mineur',
        'ouvert',
        NULL,
        NULL,
        '2026-10-07 11:30:00+00',
        (SELECT id_util FROM utilisateur WHERE email = 'lina.bouziane@somaca.local')
    ),
    (
        (SELECT id_machine FROM machine WHERE nom_machine = 'Convoyeur P-13'),
        'Valeurs de mesure instables détectées pendant le contrôle de production.',
        'critique',
        'en_cours',
        'Capteur de mesure instable.',
        NULL,
        '2026-10-07 12:10:00+00',
        (SELECT id_util FROM utilisateur WHERE email = 'younes.chraibi@somaca.local')
    ),
    (
        (SELECT id_machine FROM machine WHERE nom_machine = 'Capteur de présence P-11'),
        'Absence de réponse du capteur empêchant de confirmer son état.',
        'majeur',
        'ouvert',
        NULL,
        NULL,
        '2026-10-07 13:05:00+00',
        (SELECT id_util FROM utilisateur WHERE email = 'amine.elbaroudi@somaca.local')
    ),
    (
        (SELECT id_machine FROM machine WHERE nom_machine = 'Scanner industriel P-02'),
        'Lectures intermittentes du code de traçabilité.',
        'majeur',
        'resolu',
        'Connecteur du lecteur légèrement desserré.',
        'Reconnexion et fixation du connecteur puis validation de plusieurs lectures.',
        '2026-10-06 09:20:00+00',
        (SELECT id_util FROM utilisateur WHERE email = 'lina.bouziane@somaca.local')
    ),
    (
        (SELECT id_machine FROM machine WHERE nom_machine = 'Poste de vissage P-01'),
        'Vibration anormale constatée pendant le cycle de vissage.',
        'mineur',
        'ferme',
        'Fixation du support moteur légèrement desserrée.',
        'Resserrage du support et validation sur plusieurs cycles.',
        '2026-10-05 08:10:00+00',
        (SELECT id_util FROM utilisateur WHERE email = 'amine.elbaroudi@somaca.local')
    );


-- ÉTAT MACHINE AU MOMENT DU SIGNALEMENT
-- Cette insertion reproduit le lien créé normalement par POST /incidents/report.
INSERT INTO statut_historique (
    date_changement,
    id_machine,
    id_etat,
    id_util,
    id_incident
)
SELECT
    i.created_at,
    i.id_machine,
    e.id_etat,
    i.created_by_user_id,
    i.id_incident
FROM incident i
JOIN machine m
    ON m.id_machine = i.id_machine
JOIN etat e
    ON e.libelle_etat =
        CASE
            WHEN m.nom_machine IN (
                'Poste de contrôle P-06',
                'Robot de manutention P-08',
                'Convoyeur P-13'
            )
                THEN 'Critique'
            WHEN m.nom_machine = 'Capteur de présence P-11'
                THEN 'Inconnu'
            ELSE 'Attention requise'
        END;


-- HISTORIQUE DE STATUT DES INCIDENTS : TOUS COMMENCENT PAR OUVERT
INSERT INTO incident_status_history (
    id_incident,
    status,
    changed_at,
    changed_by_user_id,
    note
)
SELECT
    i.id_incident,
    'ouvert',
    i.created_at,
    i.created_by_user_id,
    'Incident signalé depuis le poste de production.'
FROM incident i;


-- PRISE EN CHARGE TECHNIQUE
INSERT INTO incident_status_history (
    id_incident,
    status,
    changed_at,
    changed_by_user_id,
    note
)
SELECT
    i.id_incident,
    'en_cours',
    i.created_at + INTERVAL '10 minutes',
    tech.id_util,
    'Prise en charge technique.'
FROM incident i
JOIN machine m
    ON m.id_machine = i.id_machine
JOIN utilisateur tech
    ON tech.email =
        CASE
            WHEN m.nom_machine IN (
                'Poste de vissage P-07',
                'Robot de manutention P-08',
                'Scanner industriel P-02'
            )
                THEN 'nassim.alaoui@somaca.local'
            ELSE 'rim.benjelloun@somaca.local'
        END
WHERE i.status IN ('en_cours', 'en_attente', 'resolu', 'ferme');


-- P-08 : APRÈS PRISE EN CHARGE, L'INTERVENTION PASSE EN ATTENTE
INSERT INTO incident_status_history (
    id_incident,
    status,
    changed_at,
    changed_by_user_id,
    note
)
SELECT
    i.id_incident,
    'en_attente',
    i.created_at + INTERVAL '40 minutes',
    tech.id_util,
    'Intervention suspendue en attente du contrôle du module de commande.'
FROM incident i
JOIN machine m
    ON m.id_machine = i.id_machine
JOIN utilisateur tech
    ON tech.email = 'nassim.alaoui@somaca.local'
WHERE m.nom_machine = 'Robot de manutention P-08';


-- P-01 ET P-02 : INTERVENTIONS TECHNIQUEMENT RÉSOLUES
INSERT INTO incident_status_history (
    id_incident,
    status,
    changed_at,
    changed_by_user_id,
    note
)
SELECT
    i.id_incident,
    'resolu',
    i.created_at + INTERVAL '2 hours',
    tech.id_util,
    'Intervention terminée et fonctionnement vérifié.'
FROM incident i
JOIN machine m
    ON m.id_machine = i.id_machine
JOIN utilisateur tech
    ON tech.email = 'nassim.alaoui@somaca.local'
WHERE m.nom_machine IN (
    'Scanner industriel P-02',
    'Poste de vissage P-01'
);


-- AU MOMENT DE LA RÉSOLUTION, LE TECHNICIEN CONFIRME LE RETOUR À OPÉRATIONNEL
INSERT INTO statut_historique (
    date_changement,
    id_machine,
    id_etat,
    id_util,
    id_incident
)
SELECT
    i.created_at + INTERVAL '2 hours',
    i.id_machine,
    e.id_etat,
    tech.id_util,
    i.id_incident
FROM incident i
JOIN machine m
    ON m.id_machine = i.id_machine
JOIN etat e
    ON e.libelle_etat = 'Opérationnel'
JOIN utilisateur tech
    ON tech.email = 'nassim.alaoui@somaca.local'
WHERE m.nom_machine IN (
    'Scanner industriel P-02',
    'Poste de vissage P-01'
);


-- P-01 : APRÈS RÉSOLUTION TECHNIQUE, L'ADMINISTRATEUR CLÔT L'INCIDENT
INSERT INTO incident_status_history (
    id_incident,
    status,
    changed_at,
    changed_by_user_id,
    note
)
SELECT
    i.id_incident,
    'ferme',
    i.created_at + INTERVAL '3 hours',
    admin.id_util,
    'Incident clôturé après validation de l''intervention.'
FROM incident i
JOIN machine m
    ON m.id_machine = i.id_machine
JOIN utilisateur admin
    ON admin.email = 'ines.zerouali@somaca.local'
WHERE m.nom_machine = 'Poste de vissage P-01';


-- CONTACTS : UNIQUEMENT LORSQU'UNE PRISE EN CHARGE A RÉELLEMENT EU LIEU
INSERT INTO incident_contact (
    id_incident,
    contact_type,
    id_util,
    contacted_at
)
SELECT
    i.id_incident,
    'technicien',
    tech.id_util,
    i.created_at + INTERVAL '5 minutes'
FROM incident i
JOIN machine m
    ON m.id_machine = i.id_machine
JOIN utilisateur tech
    ON tech.email =
        CASE
            WHEN m.nom_machine IN (
                'Poste de vissage P-07',
                'Robot de manutention P-08',
                'Scanner industriel P-02'
            )
                THEN 'nassim.alaoui@somaca.local'
            ELSE 'rim.benjelloun@somaca.local'
        END
WHERE i.status IN ('en_cours', 'en_attente', 'resolu', 'ferme');


-- EXEMPLE DE SUPPORT EXTERNE POUR UN INCIDENT CRITIQUE
INSERT INTO incident_contact (
    id_incident,
    contact_type,
    id_util,
    external_contact_name,
    contacted_at
)
SELECT
    i.id_incident,
    'renault',
    NULL,
    'Support technique Renault',
    i.created_at + INTERVAL '35 minutes'
FROM incident i
JOIN machine m
    ON m.id_machine = i.id_machine
WHERE m.nom_machine = 'Poste de contrôle P-06';
