from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, Float
from .database import Base
from sqlalchemy.orm import relationship


# SQLAlchemy model : describes how data is stored in the database

class Role(Base):
    __tablename__ = "role"
    id_role = Column(Integer, primary_key=True)
    nom_role = Column(String)

class Utilisateur(Base): # Base means that this class is a SQLAlchemy model, and it will be mapped to a table in the database.
    __tablename__ = "utilisateur"
    id_util = Column(Integer, primary_key=True)
    nom = Column(String)
    prenom = Column(String)
    email = Column(String, unique=True)
    mot_de_passe = Column(String)
    id_role = Column(Integer, ForeignKey("role.id_role"))
    role = relationship("Role")

class Session(Base):
    __tablename__ = "session"
    id_session = Column(Integer, primary_key=True)
    token = Column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
    )
    date_creation = Column(DateTime)
    date_expiration = Column(DateTime)
    id_util = Column(Integer, ForeignKey("utilisateur.id_util"), index=True)

class Departement(Base):
    __tablename__ = "departement"
    id_dep = Column(Integer, primary_key=True)
    nom_dep = Column(String)

class Unite(Base):
    __tablename__ = "unite"
    id_unite = Column(Integer, primary_key=True)
    nom_unite = Column(String)
    id_dep = Column(Integer, ForeignKey("departement.id_dep"))

class Poteau(Base):
    __tablename__ = "poteau"
    id_poteau = Column(Integer, primary_key=True)
    nom_poteau = Column(String)
    id_unite = Column(Integer, ForeignKey("unite.id_unite"))

class Etat(Base):
    __tablename__ = "etat"
    id_etat = Column(Integer, primary_key=True)
    libelle_etat = Column(String)
    couleur = Column(String)

class StatutHistorique(Base):
    __tablename__ = "statut_historique"
    id_statut = Column(Integer, primary_key=True)
    date_changement = Column(DateTime)
    description_probleme = Column(Text, nullable=True)
    id_machine = Column(Integer, ForeignKey("machine.id_machine"), index=True)
    id_etat = Column(Integer, ForeignKey("etat.id_etat"))
    id_util = Column(Integer, ForeignKey("utilisateur.id_util"), nullable=True, index=True)
    date_suppression = Column(DateTime, nullable=True)  # soft delete marker

class SomacaHelper(Base):
    __tablename__ = "somaca_helper"
    id_recommandation = Column(Integer, primary_key=True)
    description = Column(Text)
    cout_estime_min = Column(Float)
    cout_estime_max = Column(Float)
    niveau_complexite = Column(String)
    date_creation = Column(DateTime)
    id_machine = Column(Integer, ForeignKey("machine.id_machine"))

class Machine(Base):
    __tablename__ = "machine"
    id_machine = Column(Integer, primary_key=True)
    nom_machine = Column(String)
    ip_address = Column(String, unique=True) 
    mac_address = Column(String)
    date_installation = Column(Date)
    id_poteau = Column(Integer, ForeignKey("poteau.id_poteau"))

