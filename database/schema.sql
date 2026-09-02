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
    date_revocation  TIMESTAMP NULL,
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
    date_suppression     TIMESTAMP NULL,
    id_machine           INTEGER NOT NULL REFERENCES machine(id_machine),
    id_etat              INTEGER NOT NULL REFERENCES etat(id_etat),
    id_util              INTEGER REFERENCES utilisateur(id_util)
);

CREATE TABLE somaca_helper_message (
    id_message           SERIAL PRIMARY KEY,
    conversation_id      UUID NOT NULL,
    id_util              INTEGER NOT NULL REFERENCES utilisateur(id_util),
    role                 VARCHAR(10) NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
    content              TEXT NOT NULL,
    id_machine           INTEGER NULL REFERENCES machine(id_machine),
    intent               VARCHAR(60) NULL,
    facts                JSONB NULL,
    model_name           VARCHAR(100) NULL,
    date_creation        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

CREATE TYPE incident_status AS ENUM (
    'ouvert',
    'en_cours',
    'en_attente',
    'resolu',
    'ferme',
    'annule'
);

CREATE TYPE incident_severity AS ENUM (
    'mineur',
    'majeur',
    'critique'
);

CREATE TYPE incident_contact_type AS ENUM (
    'technicien',
    'renault',
    'autre'
);

CREATE TABLE incident (
    id_incident SERIAL PRIMARY KEY,
    id_machine INTEGER NOT NULL,
    problem TEXT NOT NULL,
    severity incident_severity NOT NULL,
    status incident_status NOT NULL,
    confirmed_cause TEXT,
    applied_solution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER NOT NULL,
    CONSTRAINT fk_incident_machine
        FOREIGN KEY (id_machine)
        REFERENCES machine(id_machine),
    CONSTRAINT fk_incident_creator
        FOREIGN KEY (created_by_user_id)
        REFERENCES utilisateur(id_util)
);

CREATE TABLE incident_status_history (
    id_status_change SERIAL PRIMARY KEY,
    id_incident INTEGER NOT NULL,
    status incident_status NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id INTEGER NOT NULL,
    CONSTRAINT fk_incident_status_history_incident
        FOREIGN KEY (id_incident)
        REFERENCES incident(id_incident),

    CONSTRAINT fk_incident_status_history_user
        FOREIGN KEY (changed_by_user_id)
        REFERENCES utilisateur(id_util)
);

CREATE TABLE incident_contact (
    id_contact SERIAL PRIMARY KEY,
    id_incident INTEGER NOT NULL,
    contact_type incident_contact_type NOT NULL,
    id_util INTEGER,
    external_contact_name VARCHAR(150),
    contacted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_incident_contact_incident
        FOREIGN KEY (id_incident)
        REFERENCES incident(id_incident),

    CONSTRAINT fk_incident_contact_user
        FOREIGN KEY (id_util)
        REFERENCES utilisateur(id_util)
);


CREATE INDEX idx_incident_machine ON incident(id_machine);
CREATE INDEX idx_incident_creator ON incident(created_by_user_id);
CREATE INDEX idx_incident_status_history_incident ON incident_status_history(id_incident);
CREATE INDEX idx_incident_status_history_user ON incident_status_history(changed_by_user_id);
CREATE INDEX idx_incident_contact_incident ON incident_contact(id_incident);
CREATE INDEX idx_incident_contact_user ON incident_contact(id_util);
CREATE INDEX idx_statut_machine ON statut_historique(id_machine);
CREATE INDEX idx_statut_date ON statut_historique(date_changement);
CREATE INDEX idx_helper_machine ON somaca_helper_message(id_machine);
CREATE INDEX idx_helper_conversation_user_date ON somaca_helper_message (conversation_id, id_util, date_creation);
CREATE INDEX idx_helper_user_conversation_date ON somaca_helper_message (id_util, conversation_id, date_creation);
CREATE INDEX idx_session_id_util ON session(id_util);

INSERT INTO role (nom_role) VALUES ('superviseur'), ('technicien'), ('administrateur');
INSERT INTO etat (libelle_etat, couleur) VALUES
    ('Opérationnel', 'vert'),
    ('Attention requise', 'jaune'),
    ('Critique', 'rouge'),
    ('Inconnu', 'gris');