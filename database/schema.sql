CREATE TABLE role (
    id_role     SERIAL PRIMARY KEY,
    nom_role    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE utilisateur (
    id_util       SERIAL PRIMARY KEY,
    nom           VARCHAR(100) NOT NULL,
    prenom        VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe  VARCHAR(255) NOT NULL,
    id_role       INTEGER NOT NULL REFERENCES role(id_role)
);

CREATE TABLE session (
    id_session       SERIAL PRIMARY KEY,
    token            VARCHAR(64) NOT NULL UNIQUE,
    date_creation    TIMESTAMP NOT NULL DEFAULT NOW(),
    date_expiration  TIMESTAMP NOT NULL,
    id_util          INTEGER NOT NULL REFERENCES utilisateur(id_util)
);

CREATE TABLE departement (
    id_dep      SERIAL PRIMARY KEY,
    nom_dep     VARCHAR(100) NOT NULL
);

CREATE TABLE unite (
    id_unite    SERIAL PRIMARY KEY,
    nom_unite   VARCHAR(100) NOT NULL,
    id_dep      INTEGER NOT NULL REFERENCES departement(id_dep)
);

CREATE TABLE poteau (
    id_poteau   SERIAL PRIMARY KEY,
    nom_poteau  VARCHAR(100) NOT NULL,
    id_unite    INTEGER NOT NULL REFERENCES unite(id_unite)
);

CREATE TABLE machine (
    id_machine        SERIAL PRIMARY KEY,
    nom_machine       VARCHAR(150) NOT NULL,
    ip_address        VARCHAR(45) UNIQUE,  
    mac_address       VARCHAR(17),   -- format: XX:XX:XX:XX:XX:XX
    date_installation DATE NOT NULL,
    id_poteau         INTEGER NOT NULL REFERENCES poteau(id_poteau)
);


CREATE TABLE etat (
    id_etat       SERIAL PRIMARY KEY,
    libelle_etat  VARCHAR(50) NOT NULL UNIQUE,
    couleur       VARCHAR(20) NOT NULL
);

CREATE TABLE statut_historique (
    id_statut            SERIAL PRIMARY KEY,
    date_changement      TIMESTAMP NOT NULL DEFAULT NOW(), 
    description_probleme TEXT  NULL, -- Every column is nullable by default in postgres tho (setting it to NULL just for clarity)
    date_suppression TIMESTAMP NULL,
    id_machine           INTEGER NOT NULL REFERENCES machine(id_machine),
    id_etat              INTEGER NOT NULL REFERENCES etat(id_etat),
    id_util              INTEGER REFERENCES utilisateur(id_util)
);

CREATE TABLE somaca_helper (
    id_recommandation   SERIAL PRIMARY KEY,
    description         TEXT NOT NULL,
    cout_estime_min     NUMERIC(10,2),
    cout_estime_max     NUMERIC(10,2),
    niveau_complexite   VARCHAR(50),
    date_creation       TIMESTAMP NOT NULL DEFAULT NOW(),
    id_machine          INTEGER NOT NULL REFERENCES machine(id_machine)
);
 
CREATE INDEX idx_statut_machine ON statut_historique(id_machine);
CREATE INDEX idx_statut_date ON statut_historique(date_changement);
CREATE INDEX idx_helper_machine ON somaca_helper(id_machine);
CREATE INDEX idx_session_id_util ON session(id_util);

INSERT INTO role (nom_role) VALUES ('superviseur'), ('technicien'), ('administrateur');
INSERT INTO etat (libelle_etat, couleur) VALUES
    ('Opérationnel', 'vert'),
    ('Attention requise', 'jaune'),
    ('Critique', 'rouge'),
    ('Inconnu', 'gris');