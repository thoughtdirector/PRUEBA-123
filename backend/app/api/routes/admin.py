from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select, func, SQLModel, desc
from typing import Any
from datetime import timedelta
from datetime import datetime
import random
import string

from app.api.deps import CurrentUser, SessionDep, GetAdminUser
from app.models import (
    Client,  Visit, Notification, NotificationCreate,
    Plan, Subscription, Payment, ClientPublic, PlanCreate, VisitPublic, QRCode, 
    SubscriptionCreate, ClientGroup, Reservation, ReservationPublic, ClientGroupPublic,
    SubscriptionPublic, PlanToken, PlanTokenCreate, PlanTokenUse, PlanTokenUseCreate,
    PlanInstance, PlanInstanceCreate, PlanInstancePublic, PlanTokenPublic, AdminAction
)
import uuid
from typing import Optional, List, Dict, Any

router = APIRouter()
# Client Management Routes
@router.get("/clients", response_model=list[ClientPublic])
def get_all_clients(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get all clients with filtering options"""
    statement = select(Client).offset(skip).limit(limit)
    clients = session.exec(statement).all()
    return clients

# Client Management Routes
@router.get("/client-groups", response_model=list[ClientGroupPublic])
def get_all_clients(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get all clients with filtering options"""
    statement = select(ClientGroup).offset(skip).limit(limit)
    clients = session.exec(statement).all()
    return clients

@router.post("/notifications", response_model=Notification)
def create_notification(
    *, session: SessionDep, current_user: GetAdminUser, notification_in: NotificationCreate
) -> Any:
    """Create a new notification"""
    notification = Notification.model_validate(notification_in)
    notification.created_by = current_user.id
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification

# Visit Management Routes
@router.post("/visits/check-in", response_model=Visit)
def check_in_client(
    *, session: SessionDep, current_user: GetAdminUser, client_id: uuid.UUID, check_in: Optional[datetime] = None
) -> Any:
    """
    Check in a client using QR code.
    Verifies that the client belongs to a group with an active subscription
    and that the client does not already have an active visit.
    """
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    if not client.group_id:
        raise HTTPException(status_code=400, detail="Client is not assigned to a group with a subscription")
    
    # Look up the active subscription via the client group
    subscription = session.exec(
        select(Subscription)
        .where(Subscription.client_group_id == client.group_id)
        .where(Subscription.is_active == True)
    ).first()
    # if not subscription: CAN CREATE WITHOUT A SUBSCRIPTION
    #     raise HTTPException(status_code=400, detail="No active subscription found for this client's group")
  
    
    # Ensure there is no already active visit
    active_visit = session.exec(
        select(Visit)
        .where(Visit.client_id == client_id)
        .where(Visit.check_out == None)
    ).first()
    if active_visit:
        raise HTTPException(status_code=400, detail="Client already has an active visit")
    
    visit = Visit(
        client_id=client_id,
        check_in=check_in if check_in is not None else datetime.utcnow(),
        subscription_id=subscription.id if subscription else None  # Linking the visit to the subscription if needed
        
    )
    
    session.add(visit)
    session.commit()
    session.refresh(visit)
    return visit


@router.put("/visits/{visit_id}/check-out", response_model=Visit)
def check_out_client(
    *, session: SessionDep, current_user: GetAdminUser, visit_id: uuid.UUID
) -> Any:
    """Check out a client and update the group subscription accordingly"""
    visit = session.get(Visit, visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    if visit.check_out:
        raise HTTPException(status_code=400, detail="Visit has already ended")
    
    check_out = datetime.utcnow()
    visit.check_out = check_out
    # Optionally, add: visit.checked_out_by = current_user.id
    duration = (check_out - visit.check_in).total_seconds()
    visit.duration = max(duration, 3600)  # Enforcing a minimum duration if required
    
    session.add(visit)
    session.commit()
    session.refresh(visit)
    
    # Retrieve the client to access the associated group subscription
    client = session.get(Client, visit.client_id)
    if not client or not client.group_id:
        raise HTTPException(status_code=400, detail="Client is not assigned to a group with a subscription")
    
    subscription = session.exec(
        select(Subscription)
        .where(Subscription.client_group_id == client.group_id)
        .where(Subscription.is_active == True)
    ).first()
    
    if subscription:
        if subscription.remaining_time is not None and subscription.remaining_time >= duration:
            subscription.remaining_time -= duration
        else:
            subscription.remaining_time = 0
        if subscription.remaining_time is not None and subscription.remaining_time <= 0:
            subscription.is_active = False
        session.add(subscription)
        session.commit()
    
    return visit


@router.get("/check-qr", response_model=Visit)
def check_qr_code(
    *,
    session: SessionDep,
    current_user: GetAdminUser,
    client_id: uuid.UUID,
    qr_code_id: uuid.UUID
) -> Any:
    """
    Read a QR code associated with a client.
    If the client already has an active visit, then check the visit out.
    Otherwise, verify subscription validity and check the client in.
    """
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    scanned_qr = session.get(QRCode, qr_code_id)
    if not scanned_qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    # Ensure that the QR code belongs to the client.
    if scanned_qr.client_id != client.id:
        raise HTTPException(status_code=400, detail="QR code does not belong to the client")
    
    active_visit = session.exec(
        select(Visit)
        .where(Visit.client_id == client_id)
        .where(Visit.check_out == None)
    ).first()
    
    if active_visit:
        # Check out the active visit.
        check_out_time = datetime.utcnow()
        active_visit.check_out = check_out_time
        # Optionally, add: active_visit.checked_out_by = current_user.id
        duration = (check_out_time - active_visit.check_in).total_seconds()
        active_visit.duration = duration

        session.add(active_visit)
        session.commit()
        session.refresh(active_visit)
        
        if not client.group_id:
            raise HTTPException(status_code=400, detail="Client is not assigned to a group with a subscription")
        
        subscription = session.exec(
            select(Subscription)
            .where(Subscription.client_group_id == client.group_id)
            .where(Subscription.is_active == True)
        ).first()
        
        if subscription:
            if subscription.remaining_time is not None:
                if subscription.remaining_time >= duration:
                    subscription.remaining_time -= duration
                else:
                    subscription.remaining_time = 0
            # If remaining_time is now 0 or less, deactivate the subscription
            if subscription.remaining_time is not None and subscription.remaining_time <= 0:
                subscription.is_active = False
            session.add(subscription)
            session.commit()
        
        return active_visit

    else:
        # No active visit – so verify subscription validity and check in.
        if not client.group_id:
            raise HTTPException(status_code=400, detail="Client is not assigned to a group with a subscription")
        
        subscription = session.exec(
            select(Subscription)
            .where(Subscription.client_group_id == client.group_id)
            .where(Subscription.is_active == True)
        ).first()
        if not subscription:
            raise HTTPException(status_code=400, detail="No active subscription found for this client's group")
        
        new_visit = Visit(
            client_id=client_id,
            check_in=datetime.utcnow(),
            subscription_id=subscription.id
        )
        session.add(new_visit)
        session.commit()
        session.refresh(new_visit)
        return new_visit
    


@router.get("/all-visits", response_model=list[VisitPublic])
def get_all_visits(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    statement = select(Visit).offset(skip).limit(limit)
    visits = session.exec(statement).all()
    return visits


@router.get("/all-payments", response_model=list[VisitPublic])
def get_all_visits(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    statement = select(Payment).offset(skip).limit(limit)
    payments = session.exec(statement).all()
    return payments


@router.get("/all-subscriptions", response_model=list[SubscriptionPublic])
def get_all_visits(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    statement = select(Subscription).offset(skip).limit(limit)
    subscriptions = session.exec(statement).all()
    return subscriptions


@router.get("/all-active-visits", response_model=list[VisitPublic])
def get_all_active_visits(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    statement = select(Visit).where(Visit.check_out == None).offset(skip).limit(limit)
    visits = session.exec(statement).all()
    return visits
   

@router.post("/plans", response_model=Plan)
def create_plan(
    *, session: SessionDep, current_user: GetAdminUser, plan_in: PlanCreate
) -> Any:
    """Create a new service plan"""
    plan = Plan.model_validate(plan_in)

    session.add(plan)
    session.commit()
    session.refresh(plan)
    return plan

@router.put("/subscriptions/{subscription_id}/approve", response_model=Subscription)
def approve_subscription(
    *, session: SessionDep, current_user: GetAdminUser, subscription_id: uuid.UUID
) -> Any:
    """Approve a subscription"""
    subscription = session.get(Subscription, subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    subscription.approved_by = current_user.id
    subscription.is_active = True
    
    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    return subscription




@router.post("/subscriptions/force-create", response_model=Subscription)
def force_create_subscription(
    *, session: SessionDep, current_user: GetAdminUser, client_group_id: uuid.UUID, subscription_in: SubscriptionCreate
) -> Any:
    """Forces the creation of a subscription to a client group"""
    subscription = Subscription.model_validate(subscription_in)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    
    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    return subscription


@router.get("/dashboard/metrics")
def get_dashboard_metrics(
    session: SessionDep, current_user: GetAdminUser
) -> Any:
    """Get comprehensive dashboard metrics"""
    current_date = datetime.utcnow()
    start_date = current_date - timedelta(days=7)
    
    # Active clients count
    active_clients = session.exec(
        select(func.count(Client.id)).where(Client.is_active == True)
    ).one()
    
    # Current visits
    current_visits = session.exec(
        select(func.count(Visit.id))
        .where(Visit.check_out == None)
    ).one()
    
    # Today's revenue
    today_revenue = session.exec(
        select(func.sum(Payment.amount))
        .where(func.date(Payment.created_at) == func.date(current_date))
        .where(Payment.status == "completed")
    ).one() or 0
    
    # Visits by day (for chart data)
    visits_grouped = session.exec(
        select(
            func.date(Visit.check_in).label("day"),
            func.count(Visit.id).label("visit_count")
        )
        .where(Visit.check_in >= start_date)
        .group_by(func.date(Visit.check_in))
        .order_by("day")
    ).all()
    
    # Convert the result into a list of dictionaries
    visits_chart_data = [
        {"day": day.isoformat(), "visit_count": visit_count}
        for day, visit_count in visits_grouped
    ]
    
    # Revenue by day
    revenue_grouped = session.exec(
        select(
            func.date(Payment.created_at).label("day"),
            func.sum(Payment.amount).label("amount")
        )
        .where(Payment.created_at >= start_date)
        .where(Payment.status == "completed")
        .group_by(func.date(Payment.created_at))
        .order_by("day")
    ).all()
    
    # Convert the result into a list of dictionaries
    revenue_chart_data = [
        {"day": day.isoformat(), "amount": float(amount)}
        for day, amount in revenue_grouped
    ]
    
    # Subscription stats
    active_subscriptions = session.exec(
        select(func.count(Subscription.id))
        .where(Subscription.is_active == True)
    ).one()
    
    expired_subscriptions = session.exec(
        select(func.count(Subscription.id))
        .where(Subscription.is_active == False)
    ).one()
    
    expiring_soon_date = current_date + timedelta(days=7)
    expiring_soon_subscriptions = session.exec(
        select(func.count(Subscription.id))
        .where(Subscription.is_active == True)
        .where(Subscription.end_date <= expiring_soon_date)
        .where(Subscription.end_date > current_date)
    ).one()
    
    # Top plans
    top_plans = session.exec(
        select(
            Plan.id,
            Plan.name,
            func.count(Subscription.id).label("subscription_count")
        )
        .join(Subscription, Plan.id == Subscription.plan_id)
        .where(Subscription.is_active == True)
        .group_by(Plan.id, Plan.name)
        .order_by(desc("subscription_count"))
        .limit(4)
    ).all()
    
    top_plans_data = [
        {"id": str(id), "name": name, "subscriptions": count}
        for id, name, count in top_plans
    ]
    
    return {
        "active_clients": active_clients,
        "current_visits": current_visits,
        "today_revenue": today_revenue,
        "visits_by_day": visits_chart_data,
        "revenue_by_day": revenue_chart_data,
        "subscription_stats": {
            "active": active_subscriptions,
            "expired": expired_subscriptions,
            "expiring_soon": expiring_soon_subscriptions
        },
        "top_plans": top_plans_data
    }

# Define a response model for active visits with client info
class VisitWithClientInfo(SQLModel):
    id: uuid.UUID
    client_id: uuid.UUID
    check_in: datetime
    client_name: str
    subscription_id: Optional[uuid.UUID] = None

# Enhanced active visits endpoint
@router.get("/all-active-visits", response_model=list[VisitWithClientInfo])
def get_all_active_visits(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get all active visits with client information"""
    visits_query = (
        select(Visit, Client.full_name.label("client_name"))
        .join(Client, Visit.client_id == Client.id)
        .where(Visit.check_out == None)
        .offset(skip)
        .limit(limit)
        .order_by(desc(Visit.check_in))  # Most recent first
    )
    
    active_visits_with_client = session.exec(visits_query).all()
    
    # Create response objects with client info
    result = []
    for visit, client_name in active_visits_with_client:
        result.append(
            VisitWithClientInfo(
                id=visit.id,
                client_id=visit.client_id,
                check_in=visit.check_in,
                client_name=client_name,
                subscription_id=visit.subscription_id
            )
        )
    
    return result

# Get all plans endpoint
@router.get("/plans", response_model=list[Plan])
def get_all_plans(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False
) -> Any:
    query = select(Plan)
    
    if active_only:
        query = query.where(Plan.is_active == True)
    
    query = query.offset(skip).limit(limit)
    plans = session.exec(query).all()
    return plans

@router.get("/plans/{plan_id}", response_model=Plan)
def get_plan_by_id(
    *, session: SessionDep, current_user: GetAdminUser, plan_id: uuid.UUID
) -> Any:
    """
    Get a specific plan by ID
    """
    plan = session.exec(select(Plan).where(Plan.id == plan_id)).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.post("/plans/{plan_id}/tokens", response_model=PlanTokenPublic)
def create_plan_token(
    *, session: SessionDep, current_user: GetAdminUser, plan_id: uuid.UUID, token_in: PlanTokenCreate
) -> Any:
    """
    Create a new token for a plan
    """
    # Verify plan exists
    plan = session.exec(select(Plan).where(Plan.id == plan_id)).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Generate a token if not provided
    token_value = token_in.token_value
    if not token_value:
        # Generate a random 8-character alphanumeric token
        token_value = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        # Make sure it's unique
        while session.exec(select(PlanToken).where(PlanToken.token_value == token_value)).first():
            token_value = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    # Create token
    token_data = {
        "plan_id": plan_id,
        "token_value": token_value,
        "max_uses": token_in.max_uses,
        "expires_at": token_in.expires_at
    }
    
    token = PlanToken(**token_data)
    session.add(token)
    session.commit()
    session.refresh(token)
    
    return token

@router.get("/plans/{plan_id}/tokens", response_model=list[PlanTokenPublic])
def get_plan_tokens(
    *, session: SessionDep, current_user: GetAdminUser, plan_id: uuid.UUID
) -> Any:
    """
    Get all tokens for a plan
    """
    tokens = session.exec(select(PlanToken).where(PlanToken.plan_id == plan_id)).all()
    return tokens

@router.post("/tokens/validate", response_model=dict)
def validate_token(
    *, session: SessionDep, current_user: GetAdminUser, token_value: str
) -> Any:
    """
    Validate a token without using it
    """
    token = session.exec(select(PlanToken).where(
        PlanToken.token_value == token_value,
        PlanToken.is_active == True
    )).first()
    
    if not token:
        return {"valid": False, "message": "Invalid or inactive token"}
    
    # Check if token has expired
    if token.expires_at and token.expires_at < datetime.utcnow():
        return {"valid": False, "message": "Token has expired"}
    
    # Check if token has reached max uses
    if token.max_uses and token.uses_count >= token.max_uses:
        return {"valid": False, "message": "Token has reached maximum usage limit"}
    
    # Get plan details
    plan = session.exec(select(Plan).where(Plan.id == token.plan_id)).first()
    
    return {
        "valid": True,
        "plan": {
            "id": plan.id,
            "name": plan.name,
            "description": plan.description,
            "entries": plan.entries,
            "limits": plan.limits
        }
    }

@router.post("/tokens/use", response_model=PlanTokenUse)
def use_token(
    *, session: SessionDep, current_user: GetAdminUser, token_use: PlanTokenUseCreate
) -> Any:
    """
    Use a token for a client
    """
    # Get the token
    token = session.exec(select(PlanToken).where(PlanToken.id == token_use.token_id)).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    # Check if token is active
    if not token.is_active:
        raise HTTPException(status_code=400, detail="Token is not active")
    
    # Check if token has expired
    if token.expires_at and token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token has expired")
    
    # Check if token has reached max uses
    if token.max_uses and token.uses_count >= token.max_uses:
        raise HTTPException(status_code=400, detail="Token has reached maximum usage limit")
    
    # Check if client exists
    client = session.exec(select(Client).where(Client.id == token_use.client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Create token use record
    token_use_db = PlanTokenUse(
        token_id=token.id,
        client_id=client.id
    )
    session.add(token_use_db)
    
    # Update token usage count
    token.uses_count += 1
    
    # Get plan to check and update limits
    plan = session.exec(select(Plan).where(Plan.id == token.plan_id)).first()
    
    # Update limits if needed (example implementation)
    if plan.limits:
        # Example: update user count limit
        if "users" in plan.limits:
            plan.limits["users"] = max(0, plan.limits.get("users", 0) - 1)
        
        # Example: update time limit
        if "time" in plan.limits:
            plan.limits["time"] = max(0, plan.limits.get("time", 0) - 1)
    
    session.commit()
    session.refresh(token_use_db)
    
    return token_use_db

# Get all reservations endpoint
@router.get("/all-reservations", response_model=list[ReservationPublic])
def get_all_reservations(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100,
    upcoming_only: bool = False
) -> Any:
    """Get all reservations"""
    statement = select(Reservation)
    
    if upcoming_only:
        current_date = datetime.utcnow()
        statement = statement.where(Reservation.date >= current_date)
    
    statement = statement.offset(skip).limit(limit).order_by(Reservation.date)
    reservations = session.exec(statement).all()
    return reservations

@router.post("/plan-instances", response_model=PlanInstancePublic)
def create_plan_instance(
    *, session: SessionDep, current_user: GetAdminUser, instance_in: PlanInstanceCreate
) -> Any:
    """
    Create a new plan instance from a plan template
    """
    # Verify plan exists
    plan = session.exec(select(Plan).where(Plan.id == instance_in.plan_id)).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Verify client group exists
    client_group = session.exec(select(ClientGroup).where(ClientGroup.id == instance_in.client_group_id)).first()
    if not client_group:
        raise HTTPException(status_code=404, detail="Client group not found")
    
    # Calculate total cost based on plan and addons
    total_cost = plan.price
    purchased_addons = instance_in.purchased_addons or {}
    
    for addon_name, addon_quantity in purchased_addons.items():
        if addon_name in plan.addons:
            addon_price = plan.addons.get(addon_name, 0)
            total_cost += addon_price * addon_quantity
    
    # Set up remaining limits based on plan template
    remaining_limits = instance_in.remaining_limits or {}
    if plan.limits and not remaining_limits:
        remaining_limits = plan.limits.copy()
    
    # Set up remaining entries based on plan template
    remaining_entries = instance_in.remaining_entries
    if remaining_entries is None and plan.entries is not None:
        remaining_entries = plan.entries
    
    # Create the plan instance
    plan_instance = PlanInstance(
        client_group_id=instance_in.client_group_id,
        plan_id=instance_in.plan_id,
        start_date=instance_in.start_date,
        end_date=instance_in.end_date,
        total_cost=total_cost,
        purchased_addons=purchased_addons,
        remaining_entries=remaining_entries,
        remaining_limits=remaining_limits
    )
    
    session.add(plan_instance)
    session.commit()
    session.refresh(plan_instance)
    
    return plan_instance

@router.get("/plan-instances", response_model=list[PlanInstancePublic])
def get_all_plan_instances(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    client_group_id: Optional[uuid.UUID] = None,
    plan_id: Optional[uuid.UUID] = None
) -> Any:
    """
    Get all plan instances with optional filtering
    """
    query = select(PlanInstance)
    
    if active_only:
        query = query.where(PlanInstance.is_active == True)
    
    if client_group_id:
        query = query.where(PlanInstance.client_group_id == client_group_id)
    
    if plan_id:
        query = query.where(PlanInstance.plan_id == plan_id)
    
    query = query.offset(skip).limit(limit).order_by(desc(PlanInstance.created_at))
    
    plan_instances = session.exec(query).all()
    return plan_instances

@router.get("/plan-instances/{instance_id}", response_model=PlanInstancePublic)
def get_plan_instance(
    *, session: SessionDep, current_user: GetAdminUser, instance_id: uuid.UUID
) -> Any:
    """
    Get a specific plan instance by ID
    """
    plan_instance = session.exec(select(PlanInstance).where(PlanInstance.id == instance_id)).first()
    if not plan_instance:
        raise HTTPException(status_code=404, detail="Plan instance not found")
    
    return plan_instance

@router.post("/plan-instances/{instance_id}/payments", response_model=Payment)
def add_payment_to_plan_instance(
    *, session: SessionDep, current_user: GetAdminUser, instance_id: uuid.UUID, payment_in: dict
) -> Any:
    """
    Add a payment to a plan instance
    """
    plan_instance = session.exec(select(PlanInstance).where(PlanInstance.id == instance_id)).first()
    if not plan_instance:
        raise HTTPException(status_code=404, detail="Plan instance not found")
    
    # Create the payment
    payment = Payment(
        client_group_id=plan_instance.client_group_id,
        plan_id=plan_instance.plan_id,
        plan_instance_id=plan_instance.id,
        amount=payment_in.get("amount"),
        status=payment_in.get("status", "completed"),
        payment_method=payment_in.get("payment_method", "manual"),
        transaction_id=payment_in.get("transaction_id", str(uuid.uuid4())),
        purchased_addons=payment_in.get("purchased_addons", {})
    )
    
    session.add(payment)
    
    # Update the plan instance's paid amount
    if payment.status == "completed":
        plan_instance.paid_amount += payment.amount
    
    session.commit()
    session.refresh(payment)
    
    return payment

@router.post("/plan-instances/{instance_id}/tokens", response_model=PlanTokenPublic)
def create_plan_instance_token(
    *, session: SessionDep, current_user: GetAdminUser, instance_id: uuid.UUID, token_in: PlanTokenCreate
) -> Any:
    """
    Create a new token for a plan instance
    """
    # Verify plan instance exists
    plan_instance = session.exec(select(PlanInstance).where(PlanInstance.id == instance_id)).first()
    if not plan_instance:
        raise HTTPException(status_code=404, detail="Plan instance not found")
    
    # Generate a token if not provided
    token_value = token_in.token_value
    if not token_value:
        # Generate a random 8-character alphanumeric token
        token_value = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        # Make sure it's unique
        while session.exec(select(PlanToken).where(PlanToken.token_value == token_value)).first():
            token_value = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    # Create token
    token_data = {
        "plan_id": plan_instance.plan_id,
        "plan_instance_id": plan_instance.id,
        "token_value": token_value,
        "max_uses": token_in.max_uses,
        "expires_at": token_in.expires_at
    }
    
    token = PlanToken(**token_data)
    session.add(token)
    session.commit()
    session.refresh(token)
    
    return token

@router.get("/plan-instances/{instance_id}/tokens", response_model=list[PlanTokenPublic])
def get_plan_instance_tokens(
    *, session: SessionDep, current_user: GetAdminUser, instance_id: uuid.UUID
) -> Any:
    """
    Get all tokens for a plan instance
    """
    tokens = session.exec(select(PlanToken).where(PlanToken.plan_instance_id == instance_id)).all()
    return tokens

# Update the token validation and use endpoints to work with plan instances
@router.post("/tokens/validate", response_model=dict)
def validate_token(
    *, session: SessionDep, current_user: GetAdminUser, token_value: str
) -> Any:
    """
    Validate a token without using it
    """
    token = session.exec(select(PlanToken).where(
        PlanToken.token_value == token_value,
        PlanToken.is_active == True
    )).first()
    
    if not token:
        return {"valid": False, "message": "Invalid or inactive token"}
    
    # Check if token has expired
    if token.expires_at and token.expires_at < datetime.utcnow():
        return {"valid": False, "message": "Token has expired"}
    
    # Check if token has reached max uses
    if token.max_uses and token.uses_count >= token.max_uses:
        return {"valid": False, "message": "Token has reached maximum usage limit"}
    
    # Get plan instance details
    plan_instance = session.exec(select(PlanInstance).where(PlanInstance.id == token.plan_instance_id)).first()
    if not plan_instance:
        return {"valid": False, "message": "Associated plan instance not found"}
    
    # Check if plan instance is active
    if not plan_instance.is_active:
        return {"valid": False, "message": "Associated plan instance is not active"}
    
    # Check remaining entries
    if plan_instance.remaining_entries is not None and plan_instance.remaining_entries <= 0:
        return {"valid": False, "message": "No entries remaining on this plan instance"}
    
    # Get plan details
    plan = session.exec(select(Plan).where(Plan.id == plan_instance.plan_id)).first()
    
    return {
        "valid": True,
        "plan_instance": {
            "id": plan_instance.id,
            "plan_id": plan_instance.plan_id,
            "plan_name": plan.name,
            "remaining_entries": plan_instance.remaining_entries,
            "remaining_limits": plan_instance.remaining_limits,
            "is_fully_paid": plan_instance.is_fully_paid
        }
    }

@router.post("/tokens/use", response_model=PlanTokenUse)
def use_token(
    *, session: SessionDep, current_user: GetAdminUser, token_use: PlanTokenUseCreate
) -> Any:
    """
    Use a token for a client
    """
    # Get the token
    token = session.exec(select(PlanToken).where(PlanToken.id == token_use.token_id)).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    # Check if token is active
    if not token.is_active:
        raise HTTPException(status_code=400, detail="Token is not active")
    
    # Check if token has expired
    if token.expires_at and token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token has expired")
    
    # Check if token has reached max uses
    if token.max_uses and token.uses_count >= token.max_uses:
        raise HTTPException(status_code=400, detail="Token has reached maximum usage limit")
    
    # Check if client exists
    client = session.exec(select(Client).where(Client.id == token_use.client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get the plan instance and check its status
    plan_instance = session.exec(select(PlanInstance).where(PlanInstance.id == token.plan_instance_id)).first()
    if not plan_instance:
        raise HTTPException(status_code=404, detail="Plan instance not found")
    
    # Check if plan instance is active
    if not plan_instance.is_active:
        raise HTTPException(status_code=400, detail="Plan instance is not active")
    
    # Check remaining entries
    if plan_instance.remaining_entries is not None:
        if plan_instance.remaining_entries <= 0:
            raise HTTPException(status_code=400, detail="No entries remaining on this plan instance")
        plan_instance.remaining_entries -= 1
    
    # Create token use record
    token_use_db = PlanTokenUse(
        token_id=token.id,
        client_id=client.id
    )
    session.add(token_use_db)
    
    # Update token usage count
    token.uses_count += 1
    
    # Update limits if needed
    if plan_instance.remaining_limits:
        # Example: update user count limit
        if "users" in plan_instance.remaining_limits:
            plan_instance.remaining_limits["users"] = max(0, plan_instance.remaining_limits.get("users", 0) - 1)
        
        # Example: update time limit
        if "time" in plan_instance.remaining_limits:
            plan_instance.remaining_limits["time"] = max(0, plan_instance.remaining_limits.get("time", 0) - 1)
    
    session.commit()
    session.refresh(token_use_db)
    
    return token_use_db

# Get all reservations endpoint
@router.get("/all-reservations", response_model=list[ReservationPublic])
def get_all_reservations(
    session: SessionDep,
    current_user: GetAdminUser,
    skip: int = 0,
    limit: int = 100,
    upcoming_only: bool = False
) -> Any:
    """Get all reservations"""
    statement = select(Reservation)
    
    if upcoming_only:
        current_date = datetime.utcnow()
        statement = statement.where(Reservation.date >= current_date)
    
    statement = statement.offset(skip).limit(limit).order_by(Reservation.date)
    reservations = session.exec(statement).all()
    return reservations

@router.post("/qr-codes/generate", response_model=QRCode)
def generate_qr_code(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    body: dict
) -> Any:
    """
    Generate a new QR code for a client in a client group.
    """
    # Extract client_id and client_group_id from the request body
    client_id = body.get("client_id")
    client_group_id = body.get("client_group_id")
    
    if not client_id or not client_group_id:
        raise HTTPException(status_code=422, detail="Missing client_id or client_group_id in request body")
        
    try:
        client_id = uuid.UUID(client_id)
        client_group_id = uuid.UUID(client_group_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid client_id or client_group_id format")
    
    # Check if client exists and belongs to the client group
    client = session.exec(select(Client).where(Client.id == client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client_group = session.exec(select(ClientGroup).where(ClientGroup.id == client_group_id)).first()
    if not client_group:
        raise HTTPException(status_code=404, detail="Client group not found")
    
    if client.group_id != client_group_id:
        raise HTTPException(status_code=400, detail="Client does not belong to this client group")
    
    # Check if the user has permission to generate QR code for this client group
    user_client = session.exec(select(Client).where(Client.user_id == current_user.id)).first()
    
    # Allow if:
    # 1. User is an admin, or
    # 2. User is a client and is part of the client group, or
    # 3. User is a client and is an admin of the client group
    is_admin = current_user.is_superuser
    is_part_of_group = user_client and user_client.group_id == client_group_id
    is_group_admin = user_client and client_group.id in [admin_group.id for admin_group in getattr(user_client, "group_admin", [])]
    
    if not (is_admin or is_part_of_group or is_group_admin):
        raise HTTPException(status_code=403, detail="You don't have permission to generate QR codes for this client group")
    
    # Create new QR code
    qr_code = QRCode(
        client_id=client_id,
        client_group_id=client_group_id
    )
    session.add(qr_code)
    session.commit()
    session.refresh(qr_code)
    
    return qr_code

@router.post("/qr-codes/{qr_code_id}/check-in", response_model=Visit)
def check_in_with_qr(
    *,
    session: SessionDep,
    current_user: GetAdminUser,
    qr_code_id: uuid.UUID
) -> Any:
    """
    Check in a client using their QR code.
    """
    qr_code = session.exec(select(QRCode).where(QRCode.id == qr_code_id)).first()
    if not qr_code:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    if qr_code.state != "pending":
        raise HTTPException(status_code=400, detail="QR code is not in a pending state")
    
    # Create new visit
    visit = Visit(
        client_id=qr_code.client_id,
        plan_instance_id=None,  # You can add logic to find an active plan instance
        details={"qr_code_id": str(qr_code_id)}
    )
    
    # Update QR code
    qr_code.state = "in_use"
    qr_code.visit_id = visit.id
    
    session.add(visit)
    session.add(qr_code)
    session.commit()
    session.refresh(visit)
    
    return visit

@router.post("/qr-codes/{qr_code_id}/check-out", response_model=Visit)
def check_out_with_qr(
    *,
    session: SessionDep,
    current_user: GetAdminUser,
    qr_code_id: uuid.UUID
) -> Any:
    """
    Check out a client using their QR code.
    """
    qr_code = session.exec(select(QRCode).where(QRCode.id == qr_code_id)).first()
    if not qr_code:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    if qr_code.state != "in_use":
        raise HTTPException(status_code=400, detail="QR code is not in an active visit state")
    
    if not qr_code.visit_id:
        raise HTTPException(status_code=400, detail="No active visit found for this QR code")
    
    visit = session.exec(select(Visit).where(Visit.id == qr_code.visit_id)).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    if visit.check_out:
        raise HTTPException(status_code=400, detail="Client is already checked out")
    
    # Update visit with check-out time
    visit.check_out = datetime.utcnow()
    visit.checked_out_by = current_user.id
    visit.duration = (visit.check_out - visit.check_in).total_seconds() / 3600  # Convert to hours
    
    # Mark QR code as used (completed state)
    qr_code.state = "used"
    
    session.add(visit)
    session.add(qr_code)
    session.commit()
    session.refresh(visit)
    
    return visit

# Get client_groups

@router.post("/force-payment", response_model=Payment)
def force_create_payment(
    *, 
    session: SessionDep, 
    current_user: GetAdminUser, 
    payment_data: dict
) -> Any:
    """
    Force create a payment without validation.
    Useful for manual payments or fixing payment issues.
    """
    # Extract data from request
    client_id = payment_data.get("client_id")
    amount = payment_data.get("amount")
    description = payment_data.get("description", "Manual payment")
    payment_method = payment_data.get("payment_method", "cash")
    visit_id = payment_data.get("visit_id")
    
    if not client_id or amount is None:
        raise HTTPException(
            status_code=422, 
            detail="Missing required fields: client_id and amount are required"
        )
    
    # Find client and client group
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client_group_id = client.group_id
    if not client_group_id:
        raise HTTPException(status_code=400, detail="Client must be part of a group")
    
    # Create payment record
    payment = Payment(
        client_group_id=client_group_id,
        amount=float(amount),
        status="completed",
        payment_method=payment_method,
        transaction_id=f"manual-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        created_at=datetime.utcnow()
    )
    
    # Associate with visit if provided
    if visit_id:
        visit = session.get(Visit, visit_id)
        if visit:
            visit.payment_id = payment.id
           
            session.add(visit)
    session.add(payment)
    
    # Record admin action
    admin_action = AdminAction(
        admin_id=current_user.admin_user.id,
        action_type="create",
        entity_type="payment",
        entity_id=payment.id,
        description=f"Manually created payment of {amount} for client {client_id}: {description}"
    )
    
    
    session.add(admin_action)
    session.commit()
    session.refresh(payment)
    
    return payment