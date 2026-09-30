CREATE TABLE role (
    id_role     SERIAL PRIMARY KEY,
    nom_role    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE utilisateur (
    id_util                 SERIAL PRIMARY KEY,
    nom                     VARCHAR(100) NOT NULL,
    prenom                  VARCHAR(100) NOT NULL,
    email                   VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe            VARCHAR(255) NOT NULL,
    id_role                 INTEGER NOT NULL REFERENCES role(id_role),
    notifications_read_at   TIMESTAMPTZ NULL,
    actif                   BOOLEAN NOT NULL DEFAULT TRUE,
    date_desactivation      TIMESTAMPTZ NULL
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
    nom_dep     VARCHAR(100) NOT NULL,
    actif       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE unite (
    id_unite             SERIAL PRIMARY KEY,
    nom_unite            VARCHAR(100) NOT NULL,
    id_dep               INTEGER NOT NULL REFERENCES departement(id_dep),
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    represente_carte     BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE poteau (
    id_poteau            SERIAL PRIMARY KEY,
    nom_poteau           VARCHAR(100) NOT NULL,
    id_unite             INTEGER NOT NULL REFERENCES unite(id_unite),
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    represente_carte     BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE machine (
    id_machine               SERIAL PRIMARY KEY,
    nom_machine              VARCHAR(150) NOT NULL,
    type_machine             VARCHAR(50) NOT NULL,
    ip_address               VARCHAR(45) UNIQUE,
    mac_address              VARCHAR(17),
    date_installation        DATE NOT NULL,
    id_poteau                INTEGER NOT NULL REFERENCES poteau(id_poteau),
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    date_decommissionnement  TIMESTAMPTZ NULL
);

CREATE TABLE etat (
    id_etat       SERIAL PRIMARY KEY,
    libelle_etat  VARCHAR(50) NOT NULL UNIQUE,
    couleur       VARCHAR(20) NOT NULL
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
    id_incident         SERIAL PRIMARY KEY,
    id_machine          INTEGER NOT NULL REFERENCES machine(id_machine),
    problem             TEXT NOT NULL,
    severity            incident_severity NOT NULL,
    status              incident_status NOT NULL,
    confirmed_cause     TEXT,
    applied_solution    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id  INTEGER NOT NULL REFERENCES utilisateur(id_util)
);

CREATE TABLE statut_historique (
    id_statut             SERIAL PRIMARY KEY,
    date_changement       TIMESTAMP NOT NULL DEFAULT NOW(),
    date_suppression      TIMESTAMP NULL,
    id_machine            INTEGER NOT NULL REFERENCES machine(id_machine),
    id_etat               INTEGER NOT NULL REFERENCES etat(id_etat),
    id_util               INTEGER NULL REFERENCES utilisateur(id_util),
    id_incident           INTEGER NULL REFERENCES incident(id_incident),
    id_util_suppression   INTEGER NULL REFERENCES utilisateur(id_util)
);

CREATE TABLE incident_status_history (
    id_status_change    SERIAL PRIMARY KEY,
    id_incident         INTEGER NOT NULL REFERENCES incident(id_incident),
    status              incident_status NOT NULL,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id  INTEGER NOT NULL REFERENCES utilisateur(id_util),
    note                TEXT NULL
);

CREATE TABLE incident_severity_history (
    id_severity_change  SERIAL PRIMARY KEY,
    id_incident         INTEGER NOT NULL REFERENCES incident(id_incident),
    old_severity        incident_severity NOT NULL,
    new_severity        incident_severity NOT NULL,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id  INTEGER NOT NULL REFERENCES utilisateur(id_util),
    note                TEXT NULL
);

CREATE TABLE incident_contact (
    id_contact            SERIAL PRIMARY KEY,
    id_incident           INTEGER NOT NULL REFERENCES incident(id_incident),
    contact_type          incident_contact_type NOT NULL,
    id_util               INTEGER NULL REFERENCES utilisateur(id_util),
    external_contact_name VARCHAR(150) NULL,
    contacted_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE somaca_helper_message (
    id_message       SERIAL PRIMARY KEY,
    conversation_id  UUID NOT NULL,
    id_util          INTEGER NOT NULL REFERENCES utilisateur(id_util),
    role             VARCHAR(10) NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
    content          TEXT NOT NULL,
    id_machine       INTEGER NULL REFERENCES machine(id_machine),
    intent           VARCHAR(60) NULL,
    facts            JSONB NULL,
    model_name       VARCHAR(100) NULL,
    date_creation    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incident_machine
    ON incident(id_machine);

CREATE INDEX idx_incident_creator
    ON incident(created_by_user_id);

CREATE INDEX idx_incident_status_history_incident
    ON incident_status_history(id_incident);

CREATE INDEX idx_incident_status_history_user
    ON incident_status_history(changed_by_user_id);

CREATE INDEX idx_incident_severity_history_incident
    ON incident_severity_history(id_incident);

CREATE INDEX idx_incident_severity_history_user
    ON incident_severity_history(changed_by_user_id);

CREATE INDEX idx_incident_contact_incident
    ON incident_contact(id_incident);

CREATE INDEX idx_incident_contact_user
    ON incident_contact(id_util);

CREATE INDEX idx_statut_machine_date_id
    ON statut_historique(
        id_machine,
        date_changement DESC,
        id_statut DESC
    );

CREATE INDEX idx_statut_incident
    ON statut_historique(id_incident);

CREATE INDEX idx_helper_machine
    ON somaca_helper_message(id_machine);

CREATE INDEX idx_helper_conversation_user_date
    ON somaca_helper_message(
        conversation_id,
        id_util,
        date_creation
    );

CREATE INDEX idx_helper_user_conversation_date
    ON somaca_helper_message(
        id_util,
        conversation_id,
        date_creation
    );

CREATE INDEX idx_session_id_util
    ON session(id_util);

CREATE INDEX idx_session_creation_id
    ON session(
        date_creation DESC,
        id_session DESC
    );

INSERT INTO role (nom_role) VALUES
    ('operateur_de_production'),
    ('superviseur'),
    ('technicien'),
    ('administrateur');

INSERT INTO etat (libelle_etat, couleur) VALUES
    ('Opérationnel', 'vert'),
    ('Attention requise', 'jaune'),
    ('Critique', 'rouge'),
    ('Inconnu', 'gris');