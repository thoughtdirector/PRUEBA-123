import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel, select, Text
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB, BYTEA
from sqlalchemy_json import mutable_json_type
from sqlalchemy import Column, ARRAY, String
from pgvector.sqlalchemy import Vector
from pydantic import validator
#Irrelevant ITEMS

# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore




# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


class Item(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=255)

   


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=255)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)
    terms_accepted: bool = Field(default=False)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name



# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    admin_user: Optional["AdminUser"] 


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int




# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)

class ClientGroupAdminLink(SQLModel, table=True):
    client_group_id: uuid.UUID = Field(foreign_key="clientgroup.id", primary_key=True)
    admin_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    hashed_password: str
    full_name: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    terms_accepted: bool = False
    admin_user: Optional["AdminUser"] = Relationship(back_populates="user")
    

    client: Optional["Client"] = Relationship(back_populates="user")

   


class ClientBase(SQLModel):
    full_name: str = Field(max_length=255)
    email: Optional[EmailStr] = Field(index=True) #MIGHT NEED unique=True
    phone: Optional[str] = Field(max_length=20)
    is_active: bool = True
    is_child: bool = False
    qr_code: Optional[str] = None

class ClientPublic(SQLModel):
    id: uuid.UUID
    full_name: str
    email: Optional[EmailStr]
    phone: Optional[str]
    is_child: bool
    qr_code: Optional[str]



class ClientCreate(SQLModel):
    identification: str = Field(max_length=255)
    full_name: str = Field(max_length=255)
    email: Optional[EmailStr] = Field(index=True)
    phone: Optional[str] = Field(max_length=20)
    is_active: bool = True
    is_child: bool = False
    qr_code: Optional[str] = None
    
 

class ClientUpdate(SQLModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[EmailStr] = Field(default=None, index=True)
    phone: Optional[str] = Field(default=None, max_length=20)
    is_active: Optional[bool] = None
    is_child: Optional[bool] = None
    qr_code: Optional[str] = None
    



class Client(ClientBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    identification: Optional[str] = Field(max_length=255)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="client")
    group_id: Optional[uuid.UUID] = Field(default=None, foreign_key="clientgroup.id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    is_child: bool = Field(default=False)
    visits: List["Visit"] = Relationship(back_populates="client")
    group: Optional["ClientGroup"] = Relationship(back_populates="clients")
    qr_codes: List["QRCode"] = Relationship(back_populates="client")
    group_admin: Optional["ClientGroup"] = Relationship(back_populates="admins")



class ClientGroupPublic(SQLModel):
    id: uuid.UUID 
    name:str 
    created_at: datetime 
    clients: List[ClientPublic]
    subscriptions: List["Subscription"] 
    reservations: List["Reservation"] 
    admins: List[ClientPublic] 

class ClientGroup(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name:str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
  
    clients: List[Client] = Relationship(back_populates="group")
    
    # Relationship: the subscription that applies to the whole group
    subscriptions: List["Subscription"] = Relationship(back_populates="client_group")
    plan_instances: List["PlanInstance"] = Relationship(back_populates="client_group")
    reservations: List["Reservation"] = Relationship(back_populates="client_group")
    # Relationship: the user(s) (e.g. parent accounts) that can administer the group
    admins: List[Client] = Relationship(
        back_populates="group_admin",
      
    )
    qr_codes: List["QRCode"] = Relationship(back_populates="client_group")



class PlanUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: Optional[float] = None
    duration_hours: Optional[int] = None
    duration_days: Optional[int] = None
    entries: Optional[int] = None
    is_active: Optional[bool] = None
    addons: Optional[Dict[str, Any]] = None
    limits: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class PlanCreate(SQLModel):
    name: str = Field(max_length=255)
    description: str = Field(max_length=1000)
    price: float
    duration_hours: Optional[int] = None  # For hourly plans
    duration_days: Optional[int] = None   # For subscription length
    entries: Optional[int] = None         # Number of entries/uses allowed (replaces max_classes)
    addons: Optional[Dict[str, Any]] = Field(default=None, description="JSON structure describing available add-ons with their pricing")
    limits: Optional[Dict[str, Any]] = Field(default=None, description="JSON structure defining limits (users, time, etc.)")
    tags: Optional[List[str]] = Field(default=None, description="List of category tags (e.g., 'party', 'class')")

class PlanPublic(SQLModel):
    id: uuid.UUID
    name: str
    description: str
    price: float
    duration_hours: Optional[int]

class Plan(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=255)
    description: str = Field(max_length=1000)
    price: float
    duration_hours: Optional[int] = None  # For hourly plans
    duration_days: Optional[int] = None   # For subscription length
    entries: Optional[int] = None         # Number of entries/uses allowed (replaces max_classes)
    is_active: bool = True
    addons: Dict = Field(default_factory=dict, 
                         sa_column=Column(mutable_json_type(dbtype=JSONB, nested=True)))
    limits: Dict = Field(default_factory=dict,
                         sa_column=Column(mutable_json_type(dbtype=JSONB, nested=True)),
                         description="Limits like max users, time, etc.")
    tags: List[str] = Field(default_factory=list, 
                         sa_column=Column(ARRAY(String)),
                         description="List of category tags")
    subscriptions: List["Subscription"] = Relationship(back_populates="plan")
    payments: List["Payment"] = Relationship(back_populates="plan")
    tokens: List["PlanToken"] = Relationship(back_populates="plan")
    instances: List["PlanInstance"] = Relationship(back_populates="plan")

class PlanInstanceCreate(SQLModel):
    client_group_id: uuid.UUID
    plan_id: uuid.UUID
    start_date: datetime
    end_date: Optional[datetime] = None
    purchased_addons: Optional[Dict[str, Any]] = None
    remaining_entries: Optional[int] = None
    remaining_limits: Optional[Dict[str, Any]] = None
    payment_method: Optional[str] = "credit_card"
    payment_type: Optional[str] = "full"  # "full" or "partial"
    payment_amount: Optional[float] = None
    payment_notes: Optional[str] = None
    
class PlanInstancePublic(SQLModel):
    id: uuid.UUID
    client_group_id: uuid.UUID
    plan_id: uuid.UUID
    start_date: datetime
    end_date: Optional[datetime]
    total_cost: float
    paid_amount: float
    is_active: bool
    is_fully_paid: bool
    remaining_entries: Optional[int]
    remaining_limits: Optional[Dict[str, Any]]
    purchased_addons: Optional[Dict[str, Any]]
    created_at: datetime
    plan: PlanPublic
    client_group: ClientGroupPublic
    
class PlanInstance(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_group_id: uuid.UUID = Field(foreign_key="clientgroup.id")
    plan_id: uuid.UUID = Field(foreign_key="plan.id")
    
    # Timing
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Status
    is_active: bool = Field(default=True)
    
    # Payment tracking
    total_cost: float
    paid_amount: float = Field(default=0.0)
    
    # Usage tracking
    remaining_entries: Optional[int] = None
    remaining_limits: Dict = Field(default_factory=dict, 
                                  sa_column=Column(mutable_json_type(dbtype=JSONB, nested=True)))
    
    # Addons
    purchased_addons: Dict = Field(default_factory=dict, 
                                  sa_column=Column(mutable_json_type(dbtype=JSONB, nested=True)))
    
    # Relationships
    client_group: "ClientGroup" = Relationship(back_populates="plan_instances")
    plan: "Plan" = Relationship(back_populates="instances")
    payments: List["Payment"] = Relationship(back_populates="plan_instance")
    visits: List["Visit"] = Relationship(back_populates="plan_instance")
    tokens: List["PlanToken"] = Relationship(back_populates="plan_instance")
    
    @property
    def is_fully_paid(self) -> bool:
        return self.paid_amount >= self.total_cost

class SubscriptionCreate(SQLModel):
    # Instead of a single client, a subscription is now linked to a client group.
    client_group_id: uuid.UUID
    plan_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    total_cost: float
    remaining_time: Optional[float] = None
    remaining_classes: Optional[int] = None

class SubscriptionPublic(SQLModel):
    id: uuid.UUID
    client_group_id: uuid.UUID
    plan_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    remaining_time: Optional[float] = None
    remaining_classes: Optional[int] = None
    is_active: bool
    total_cost: float

class Subscription(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # Changed: subscription now belongs to a client group.
    client_group_id: uuid.UUID = Field(foreign_key="clientgroup.id")
    plan_id: uuid.UUID = Field(foreign_key="plan.id")
    start_date: datetime
    end_date: datetime
    remaining_time: Optional[float] = None
    remaining_classes: Optional[int] = None
    is_active: bool = True
    total_cost: float
    
    # New relationships
    client_group: ClientGroup = Relationship(back_populates="subscriptions")
    plan: "Plan" = Relationship(back_populates="subscriptions")

class ReservationCreate(SQLModel):
    client_group_id: uuid.UUID
    date: datetime
    duration_hours: float
    status: str = "pending"  # Default to pending
    subscription_id: Optional[uuid.UUID] = None
    client_amount: int = 1  # Default to 1 client
    
    @validator('client_amount')
    def validate_client_amount(cls, v):
        if v < 1:
            raise ValueError('client_amount must be at least 1')
        return v

class ReservationUpdate(SQLModel):
    date: Optional[datetime] = None
    duration_hours: Optional[float] = None
    status: Optional[str] = None
    client_amount: Optional[int] = None
    
    @validator('client_amount')
    def validate_client_amount(cls, v):
        if v is not None and v < 1:
            raise ValueError('client_amount must be at least 1')
        return v

class ReservationPublic(SQLModel):
    id: uuid.UUID
    client_group_id: uuid.UUID
    date: datetime
    duration_hours: float
    status: str
    created_at: datetime
    subscription_id: Optional[uuid.UUID] = None
    client_amount: int

class Reservation(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_group_id: uuid.UUID = Field(foreign_key="clientgroup.id")
    date: datetime
    duration_hours: float
    status: str = Field(max_length=20)  # pending, confirmed, cancelled, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    subscription_id: Optional[uuid.UUID] = Field(foreign_key="subscription.id")
    client_amount: int = Field(default=1)
    client_group: "ClientGroup" = Relationship(back_populates="reservations")
    details: Dict[str, Any] = Field(
        sa_column=Column(mutable_json_type(JSONB)), 
        default_factory=dict
    )

class VisitCreate(SQLModel):
    client_id: uuid.UUID
    subscription_id: Optional[uuid.UUID] = None

    check_in: Optional[datetime] = Field(default_factory=datetime.utcnow)
 
    notes: Optional[str] = Field(default=None, max_length=500)

class VisitUpdate(SQLModel):
    check_out: Optional[datetime] = None
    duration: Optional[float] = None

class VisitPublic(SQLModel):
    id: uuid.UUID
    client_id: uuid.UUID 
    check_in: datetime
    check_out: Optional[datetime] = None
    duration: Optional[float] = None  # in hours
    subscription_id: Optional[uuid.UUID] 
    notes: Optional[str]
    payment: Optional["Payment"] = None


class Visit(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(foreign_key="client.id")
    check_in: datetime = Field(default_factory=datetime.utcnow)
    check_out: Optional[datetime] = None
    checked_out_by: Optional[uuid.UUID] = Field(foreign_key="user.id")
    duration: Optional[float] = None  # in hours
    subscription_id: Optional[uuid.UUID] = Field(foreign_key="subscription.id")
    plan_instance_id: Optional[uuid.UUID] = Field(foreign_key="planinstance.id")
    payment_id: Optional[uuid.UUID] = Field(foreign_key="payment.id", default=None)
    client: Client = Relationship(back_populates="visits")
    notes: Optional[str] = Field(default = None, max_length = 1024)
    details: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(mutable_json_type(dbtype=JSONB, nested=True))
    )
    plan_instance: Optional["PlanInstance"] = Relationship(back_populates="visits")
    qr_code: Optional["QRCode"] = Relationship(back_populates="visit")
    payment: Optional["Payment"] = Relationship(back_populates="visit")

class NotificationCreate(SQLModel):
    message: str
    target_client_id: Optional[uuid.UUID] = Field(foreign_key="client.id", default=None)
    is_broadcast: bool = False

class Notification(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: uuid.UUID = Field(foreign_key="user.id")
    target_client_id: Optional[uuid.UUID] = Field(foreign_key="client.id", default=None)
    is_broadcast: bool = False

class PaymentCreate(SQLModel):
    client_id: uuid.UUID
    amount: float
    payment_method: str = Field(max_length=50)
    transaction_id: Optional[str] = Field(max_length=255)
    plan_id: Optional[uuid.UUID] = None
    purchased_addons: Optional[Dict[str, Any]] = Field(default=None, description="JSON structure describing purchased add-ons and their quantities")

class PaymentPublic(SQLModel):
    client_group_id: uuid.UUID
    amount: float
    status: str
    purchased_addons: Optional[Dict[str, Any]] = None

class Payment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_group_id: uuid.UUID = Field(foreign_key="clientgroup.id")
    amount: float
    status: str = Field(max_length=20)  # pending, completed, failed, refunded
    payment_method: str = Field(max_length=50)
    transaction_id: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    plan_id: Optional[uuid.UUID] = Field(foreign_key="plan.id")
    plan_instance_id: Optional[uuid.UUID] = Field(foreign_key="planinstance.id")
    
    purchased_addons: Dict = Field(default_factory=list, sa_column=Column(mutable_json_type(dbtype=JSONB, nested=True)))
    plan: Optional["Plan"] = Relationship(back_populates="payments")
    plan_instance: Optional["PlanInstance"] = Relationship(back_populates="payments")
    visit: Optional["Visit"] = Relationship(back_populates="payment")

class AdminUser(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user: "User" = Relationship(back_populates="admin_user")
    actions: List["AdminAction"] = Relationship(back_populates="admin")

class AdminAction(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    admin_id: uuid.UUID = Field(foreign_key="adminuser.id")
    action_type: str = Field(max_length=50)  # create, update, delete, view
    entity_type: str = Field(max_length=50)  # client, subscription, payment, etc.
    entity_id: uuid.UUID
    description: str = Field(max_length=1000)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    admin: AdminUser = Relationship(back_populates="actions")

class QRCode(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: Optional[uuid.UUID] = Field(foreign_key="client.id")
    client_group_id: Optional[uuid.UUID] = Field(foreign_key="clientgroup.id")
    visit_id: Optional[uuid.UUID] = Field(foreign_key="visit.id", default=None)
    state: Optional[str] = Field(default="pending")  # "pending", "in_use", "used"
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    client: Optional["Client"] = Relationship(back_populates="qr_codes")
    client_group: Optional["ClientGroup"] = Relationship(back_populates="qr_codes")
    visit: Optional["Visit"] = Relationship(back_populates="qr_code")

class QRCodeResponse(SQLModel):
    id: uuid.UUID
    client_id: Optional[uuid.UUID]
    client_group_id: Optional[uuid.UUID]
    visit_id: Optional[uuid.UUID]
    state: str  # "pending", "in_use", "used"
    created_at: Optional[datetime]
    client: Optional[ClientPublic]
    visit: Optional["VisitPublic"] = None  # Include visit information when available

class PlanTokenCreate(SQLModel):
    plan_instance_id: uuid.UUID
    token_value: Optional[str] = None  # If not provided, will be auto-generated
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None
    
class PlanTokenPublic(SQLModel):
    id: uuid.UUID
    plan_id: uuid.UUID
    plan_instance_id: uuid.UUID
    token_value: str
    uses_count: int
    max_uses: Optional[int]
    is_active: bool
    expires_at: Optional[datetime]
    created_at: datetime
    
class PlanToken(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    plan_id: uuid.UUID = Field(foreign_key="plan.id")
    plan_instance_id: uuid.UUID = Field(foreign_key="planinstance.id")
    token_value: str = Field(index=True, unique=True)
    uses_count: int = Field(default=0)
    max_uses: Optional[int] = None
    is_active: bool = Field(default=True)
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    plan: Plan = Relationship(back_populates="tokens")
    plan_instance: "PlanInstance" = Relationship(back_populates="tokens")
    token_uses: List["PlanTokenUse"] = Relationship(back_populates="token")
    

class PlanTokenUseCreate(SQLModel):
    token_id: uuid.UUID
    client_id: uuid.UUID
    
class PlanTokenUse(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    token_id: uuid.UUID = Field(foreign_key="plantoken.id")
    client_id: uuid.UUID = Field(foreign_key="client.id")
    used_at: datetime = Field(default_factory=datetime.utcnow)
    token: PlanToken = Relationship(back_populates="token_uses")
    client: "Client" = Relationship()

#class MetricsLog(SQLModel, table=True):
 #   metric:str

# Database model to save forms in JSON format
class Form(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    form_type: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    form_data: str = Field(default="{}") # Stored as string
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)

class FormSubmission(SQLModel):
    form_type: str
    form_data: Dict[str, Any]

class SuccessResponse(SQLModel):
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None

