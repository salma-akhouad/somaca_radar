from pydantic import BaseModel # Pydantic is a Python library for creating data models whose job is to represent, validate, and convert data.
from datetime import date, datetime
from typing import Optional

# Pydantic schema : describes how data enters or leaves the API
class MachineBase(BaseModel):
    nom_machine: str
    ip_address: str
    mac_address: Optional[str] = None
    date_installation: date
    id_poteau: int

class MachineCreate(MachineBase):
    pass

class MachineUpdate(BaseModel):
    nom_machine: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    date_installation: Optional[date] = None
    id_poteau: Optional[int] = None

class MachineOut(MachineBase):
    id_machine: int
    class Config:
        from_attributes = True # This line tells Pydantic to read the data from the attributes of the SQLAlchemy model instance, rather than expecting a dictionary.


class RoleBase(BaseModel):
    nom_role: str

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    nom_role: Optional[str] = None

class RoleOut(RoleBase):
    id_role: int
    class Config:
        from_attributes = True


class UtilisateurBase(BaseModel):
    nom: str
    prenom: str
    email: str
    id_role: int

class UtilisateurCreate(UtilisateurBase):
    mot_de_passe: str

class UtilisateurUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    id_role: Optional[int] = None
    mot_de_passe: Optional[str] = None

class UtilisateurOut(UtilisateurBase):
    id_util: int
    class Config:
        from_attributes = True


class SessionBase(BaseModel):
    date_creation: datetime
    date_expiration: datetime
    id_util: int

class SessionCreate(SessionBase):
     token: str

class SessionUpdate(BaseModel):
    date_creation: Optional[datetime] = None
    date_expiration: Optional[datetime] = None
    id_util: Optional[int] = None
    token: Optional[str] = None

class SessionOut(SessionBase):
    id_session: int
    class Config:
        from_attributes = True


class DepartementBase(BaseModel):
    nom_dep: str    

class DepartementCreate(DepartementBase):
    pass

class DepartementUpdate(BaseModel):
    nom_dep: Optional[str] = None

class DepartementOut(DepartementBase):
    id_dep: int
    class Config:
        from_attributes = True


class UniteBase(BaseModel):
    nom_unite: str
    id_dep: int

class UniteCreate(UniteBase):
    pass

class UniteUpdate(BaseModel):
    nom_unite: Optional[str] = None
    id_dep: Optional[int] = None

class UniteOut(UniteBase):
    id_unite: int
    class Config:
        from_attributes = True


class PoteauBase(BaseModel):   
    nom_poteau: str
    id_unite: int    

class PoteauCreate(PoteauBase):
    pass

class PoteauUpdate(BaseModel):
    nom_poteau: Optional[str] = None
    id_unite: Optional[int] = None

class PoteauOut(PoteauBase):
    id_poteau: int
    class Config:
        from_attributes = True


class EtatBase(BaseModel):
    libelle_etat: str
    couleur: str

class EtatCreate(EtatBase):
    pass    

class EtatUpdate(BaseModel):
    libelle_etat: Optional[str] = None
    couleur: Optional[str] = None

class EtatOut(EtatBase):
    id_etat: int
    class Config:
        from_attributes = True


class StatutHistoriqueBase(BaseModel):
    description_probleme: Optional[str] = None
    id_machine: int
    id_etat: int
    id_util: Optional[int] = None

class StatutHistoriqueCreate(StatutHistoriqueBase):
    pass


class StatutHistoriqueUpdate(BaseModel):
    date_changement: Optional[datetime] = None
    description_probleme: Optional[str] = None
    id_machine: Optional[int] = None
    id_etat: Optional[int] = None
    id_util: Optional[int] = None

class StatutHistoriqueOut(StatutHistoriqueBase):
    id_statut: int
    date_changement: datetime
    class Config:
        from_attributes = True


class SomacaHelperBase(BaseModel):
    description: str
    cout_estime_min: float
    cout_estime_max: float
    niveau_complexite: str
    date_creation: datetime
    id_machine: int

class SomacaHelperCreate(SomacaHelperBase):
    pass

class SomacaHelperUpdate(BaseModel):
    description: Optional[str] = None
    cout_estime_min: Optional[float] = None
    cout_estime_max: Optional[float] = None
    niveau_complexite: Optional[str] = None
    date_creation: Optional[datetime] = None
    id_machine: Optional[int] = None

class SomacaHelperOut(SomacaHelperBase):
    id_recommandation: int
    class Config:
        from_attributes = True 


class LoginRequest(BaseModel):
    email: str
    mot_de_passe: str
    
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentStatusOut(BaseModel):
    id_statut: int
    date_changement: datetime
    description_probleme: Optional[str] = None
    etat: EtatOut
    class Config:
     from_attributes = True # When building this schema from an object, read object.field_name

class MachineDetailOut(MachineOut):
    current_status: Optional[CurrentStatusOut] = None