from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import select, func
from typing import Any, Optional, List
from datetime import datetime
import uuid
import os
from app.api.deps import (CurrentUser, SessionDep, GetAdminUser, GetClientGroupFromPath, 
                          GetClientFromPath, GetClientGroupFromQuery)
from app.models import (
    Client, Plan, PlanInstance, PlanInstanceCreate, PlanInstancePublic,
    Payment, Visit, ClientGroup, QRCode, QRCodeResponse
)
from app.services.epayco import generate_payment_url

router = APIRouter()

# Plan-related Routes
@router.get("/available-plans", response_model=List[Plan])
def get_available_plans(
    session: SessionDep,
    current_user: Optional[CurrentUser] = None,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    tag: Optional[str] = None
) -> Any:
    """
    Get all available plans for clients with optional filtering by tag
    
    Query parameters:
    - skip: number of plans to skip (for pagination)
    - limit: maximum number of plans to return
    - active_only: if true, only return active plans
    - tag: filter plans by specific tag category (e.g., 'party', 'class')
    """
    from sqlalchemy import any_
    
    statement = select(Plan)
    
    # Filter active plans
    if active_only:
        statement = statement.where(Plan.is_active == True)
    
    # Filter by tag if provided and not "all"
    if tag and tag.lower() != "all":
        statement = statement.where(tag == any_(Plan.tags))
    
    statement = statement.offset(skip).limit(limit)
    plans = session.exec(statement).all()
    return plans

@router.get("/available-plans/{plan_id}", response_model=Plan)
def get_available_plan_by_id(
    session: SessionDep,
    plan_id: uuid.UUID,
    current_user: Optional[CurrentUser] = None,
    active_only: bool = True
) -> Any:
    """
    Get a specific plan by ID for clients
    
    Query parameters:
    - active_only: if true, only return the plan if it's active
    """
    statement = select(Plan).where(Plan.id == plan_id)
    
    if active_only:
        statement = statement.where(Plan.is_active == True)
    
    plan = session.exec(statement).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return plan

# Plan Instances Routes
@router.post("/plan-instances", response_model=PlanInstancePublic)
async def create_plan_instance(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    instance_in: PlanInstanceCreate
) -> Any:
    """Create a new plan instance for a client group"""
    # Verify client is admin of the group
    client = session.exec(
        select(Client).where(Client.user_id == current_user.id)
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found for current user")
    
    # Check if client is admin of the group
    client_group = session.exec(
        select(ClientGroup)
        .where(ClientGroup.id == instance_in.client_group_id)
        .where(ClientGroup.id.in_(
            select(ClientGroup.id).join(Client, ClientGroup.admins).where(Client.id == client.id)
        ))
    ).first()
    
    if not client_group:
        raise HTTPException(
            status_code=403, 
            detail="You don't have permission to create plan instances for this group"
        )
    
    # Verify plan exists
    plan = session.exec(select(Plan).where(Plan.id == instance_in.plan_id)).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Calculate total cost based on plan and addons
    total_cost = plan.price
    purchased_addons = instance_in.purchased_addons or {}
    
    # Add costs of selected addons
    for addon_name, quantity in purchased_addons.items():
        if addon_name in plan.addons:
            total_cost += plan.addons[addon_name] * quantity
    
    # Create plan instance
    plan_instance = PlanInstance(
        client_group_id=instance_in.client_group_id,
        plan_id=instance_in.plan_id,
        start_date=instance_in.start_date,
        end_date=instance_in.end_date,
        total_cost=total_cost,
        paid_amount=0,  # Initially no payment
        remaining_entries=instance_in.remaining_entries or plan.entries,
        remaining_limits=plan.limits.copy() if plan.limits else {},
        purchased_addons=purchased_addons
    )
    
    session.add(plan_instance)
    session.commit()
    session.refresh(plan_instance)
    
    # Extract payment-related fields from the request
    payment_method = getattr(instance_in, 'payment_method', 'credit_card')
    payment_notes = getattr(instance_in, 'payment_notes', '')
    payment_type = getattr(instance_in, 'payment_type', 'full')
    payment_amount = getattr(instance_in, 'payment_amount', total_cost)
    
    # For partial payments, validate the amount is reasonable
    if payment_type == 'partial':
        if payment_amount < total_cost * 0.1 or payment_amount > total_cost * 0.9:
            payment_amount = total_cost * 0.5  # Default to 50% if invalid
    else:
        # Full payment
        payment_amount = total_cost
    
    # Set plan to inactive until payment is processed for credit card payments
    if payment_method == 'credit_card':
        plan_instance.is_active = False
    else:
        # For cash and invoice, set active based on payment type
        plan_instance.is_active = payment_type == 'full'
    
    session.add(plan_instance)
    session.commit()
    
    payment_url = None
    
    # Create payment record
    payment = Payment(
        client_group_id=instance_in.client_group_id,
        amount=payment_amount,
        status="pending",
        payment_method=payment_method,
        transaction_id=str(uuid.uuid4()),  # Generate a transaction ID
        plan_id=plan.id,
        plan_instance_id=plan_instance.id,
        purchased_addons=purchased_addons
    )
    
    # Add payment notes if provided
    if payment_notes:
        payment.details = {"notes": payment_notes}
    
    session.add(payment)
    session.commit()
    
    # If payment method is credit card, generate payment URL
    if payment_method == "credit_card":
        # Get redirect URL from environment or use a default
        redirect_url = os.getenv("PAYMENT_REDIRECT_URL", f"/client/plan-instances/{plan_instance.id}")
        
        payment_url = generate_payment_url(
            payment_id=payment.id,
            amount=payment_amount,
            description=f"Payment for {plan.name}" + (" (Down Payment)" if payment_type == "partial" else ""),
            client_name=client.full_name,
            client_email=client.email,
            redirect_url=redirect_url
        )
    
    # Return the plan instance with payment URL if applicable
    result = plan_instance.model_dump()
    if payment_url:
        result["payment_url"] = payment_url
    
    return result

@router.get("/visits", response_model=List[Visit])
async def get_client_visits(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False
) -> Any:
    """Get all visits for the current client"""
    # Get the client associated with the current user
    client = session.exec(
        select(Client).where(Client.user_id == current_user.id)
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found for current user")
    
    # Get visits for this client
    statement = select(Visit).where(Visit.client_id == client.id)
    
    if active_only:
        statement = statement.where(Visit.check_out == None)
    
    statement = statement.offset(skip).limit(limit)
    visits = session.exec(statement).all()
    return visits

@router.get("/plan-instances", response_model=List[PlanInstancePublic])
async def get_client_plan_instances(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False
) -> Any:
    """Get all plan instances for client groups where the current user is an admin"""
    # Get the client associated with the current user
    client = session.exec(
        select(Client).where(Client.user_id == current_user.id)
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found for current user")
    
    # Get plan instances for groups where this client is an admin
    statement = select(PlanInstance).where(
        PlanInstance.client_group_id.in_(
            select(ClientGroup.id).join(Client, ClientGroup.admins).where(Client.id == client.id)
        )
    )
    
    if active_only:
        statement = statement.where(PlanInstance.is_active == True)
    
    statement = statement.offset(skip).limit(limit)
    plan_instances = session.exec(statement).all()
    return plan_instances

@router.get("/plan-instances/{instance_id}", response_model=PlanInstancePublic)
async def get_plan_instance(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    instance_id: uuid.UUID
) -> Any:
    """Get a specific plan instance"""
    # Get the client associated with the current user
    client = session.exec(
        select(Client).where(Client.user_id == current_user.id)
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found for current user")
    
    # Get the plan instance and verify access
    plan_instance = session.exec(
        select(PlanInstance)
        .where(PlanInstance.id == instance_id)
        .where(PlanInstance.client_group_id.in_(
            select(ClientGroup.id).join(Client, ClientGroup.admins).where(Client.id == client.id)
        ))
    ).first()
    
    if not plan_instance:
        raise HTTPException(
            status_code=404, 
            detail="Plan instance not found or you don't have access to it"
        )
    
    return plan_instance

@router.get("/plan-instances/{instance_id}/visits", response_model=List[Visit])
async def get_plan_instance_visits(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    instance_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get all visits for a specific plan instance"""
    # Get the client associated with the current user
    client = session.exec(
        select(Client).where(Client.user_id == current_user.id)
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found for current user")
    
    # Verify access to the plan instance
    plan_instance = session.exec(
        select(PlanInstance)
        .where(PlanInstance.id == instance_id)
        .where(PlanInstance.client_group_id.in_(
            select(ClientGroup.id).join(Client, ClientGroup.admins).where(Client.id == client.id)
        ))
    ).first()
    
    if not plan_instance:
        raise HTTPException(
            status_code=404, 
            detail="Plan instance not found or you don't have access to it"
        )
    
    # Get visits for this plan instance
    statement = select(Visit).where(Visit.plan_instance_id == instance_id).offset(skip).limit(limit)
    visits = session.exec(statement).all()
    return visits

@router.get("/plan-instances/{instance_id}/payments", response_model=List[Payment])
async def get_plan_instance_payments(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    instance_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get all payments for a specific plan instance"""
    # Get the client associated with the current user
    client = session.exec(
        select(Client).where(Client.user_id == current_user.id)
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found for current user")
    
    # Verify access to the plan instance
    plan_instance = session.exec(
        select(PlanInstance)
        .where(PlanInstance.id == instance_id)
        .where(PlanInstance.client_group_id.in_(
            select(ClientGroup.id).join(Client, ClientGroup.admins).where(Client.id == client.id)
        ))
    ).first()
    
    if not plan_instance:
        raise HTTPException(
            status_code=404, 
            detail="Plan instance not found or you don't have access to it"
        )
    
    # Get payments for this plan instance
    statement = select(Payment).where(Payment.plan_instance_id == instance_id).offset(skip).limit(limit)
    payments = session.exec(statement).all()
    return payments

# Payment Routes
@router.post("/payments", response_model=dict)
async def make_payment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payment_data: dict
) -> Any:
    """Make a payment for a plan instance"""
    plan_instance_id = payment_data.get("plan_instance_id")
    amount = payment_data.get("amount")
    payment_method = payment_data.get("payment_method", "credit_card")
    
    if not plan_instance_id or not amount:
        raise HTTPException(status_code=422, detail="Missing required fields")
    
    # Get the client associated with the current user
    client = session.exec(
        select(Client).where(Client.user_id == current_user.id)
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found for current user")
    
    # Verify access to the plan instance
    plan_instance = session.exec(
        select(PlanInstance)
        .where(PlanInstance.id == plan_instance_id)
        .where(PlanInstance.client_group_id.in_(
            select(ClientGroup.id).join(Client, ClientGroup.admins).where(Client.id == client.id)
        ))
    ).first()
    
    if not plan_instance:
        raise HTTPException(
            status_code=404, 
            detail="Plan instance not found or you don't have access to it"
        )
    
    # Create payment record
    payment = Payment(
        client_group_id=plan_instance.client_group_id,
        amount=amount,
        status="pending",
        payment_method=payment_method,
        transaction_id=str(uuid.uuid4()),  # Generate a transaction ID
        plan_id=plan_instance.plan_id,
        plan_instance_id=plan_instance_id
    )
    
    session.add(payment)
    session.commit()
    session.refresh(payment)
    
    result = {"id": payment.id}
    
    # If payment method is credit card, generate payment URL
    if payment_method == "credit_card":
        payment_url = generate_payment_url(
            payment_id=payment.id,
            amount=amount,
            description=f"Payment for plan instance",
            client_name=client.full_name,
            client_email=client.email
        )
        result["payment_url"] = payment_url
    
    return result

@router.post("/qr-codes/generate", response_model=QRCodeResponse)
async def generate_qr_code(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    body: dict
) -> Any:
    """
    Generate a new QR code for a client.
    The client's group will be determined automatically.
    """
    # Extract client_id from the request body
    client_id = body.get("client_id")
    
    if not client_id:
        raise HTTPException(status_code=422, detail="Missing client_id in request body")
        
    try:
        client_id = uuid.UUID(client_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid client_id format")
    
    # Check if client exists and get its group_id
    client = session.exec(select(Client).where(Client.id == client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get the client's group
    if not client.group_id:
        raise HTTPException(status_code=400, detail="Client doesn't belong to any group")
    
    client_group_id = client.group_id
    client_group = session.exec(select(ClientGroup).where(ClientGroup.id == client_group_id)).first()
    if not client_group:
        raise HTTPException(status_code=404, detail="Client group not found")
    
    # Check if the user has permission to generate QR code for this client group
    user_client = session.exec(select(Client).where(Client.user_id == current_user.id)).first()
    
    # Allow if:
    # 1. User is an admin, or
    # 2. User is a client and is part of the client group, or
    # 3. User is a client and is an admin of the client group
    is_admin = current_user.is_superuser
    is_part_of_group = user_client and user_client.group_id == client_group_id
    
    if not (is_admin or is_part_of_group):
        raise HTTPException(status_code=403, detail="You don't have permission to generate QR codes for this client group")
    
    # Create new QR code
    qr_code = QRCode(
        client_id=client_id,
        client_group_id=client_group_id
    )
    session.add(qr_code)
    session.commit()
    session.refresh(qr_code)
    
    # Load client relationship for the response
    qr_code.client = client
    
    return qr_code

@router.get("/qr-codes/active/{client_id}", response_model=QRCodeResponse)
async def get_active_qr_code(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    client_id: uuid.UUID
) -> Any:
    """
    Get the active QR code for a client.
    Returns 404 if no active QR code is found.
    """
    # Find the client
    client = session.exec(select(Client).where(Client.id == client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Check if user has permission to view this client's QR code
    user_client = session.exec(select(Client).where(Client.user_id == current_user.id)).first()
    
    # Allow if:
    # 1. User is an admin, or
    # 2. User is a client and is part of the client group, or
    # 3. User is a client and is an admin of the client group
    is_admin = current_user.is_superuser
    is_part_of_group = user_client and user_client.group_id == client.group_id
    
    if not (is_admin or is_part_of_group or current_user.admin_user):
        raise HTTPException(status_code=403, detail="You don't have permission to view this client's QR code")
    
    # Find active QR code for this client
    # An active QR code would be one that is in "pending" or "in_use" state
    active_qr_code = session.exec(
        select(QRCode)
        .where(QRCode.client_id == client_id)
        .where(QRCode.state.in_(["pending", "in_use"]))
        .order_by(QRCode.created_at.desc())
    ).first()
    
    if not active_qr_code:
        # No active QR code found
        raise HTTPException(status_code=404, detail="No active QR code found for this client")
    
    return active_qr_code

@router.get("/qr-codes/{qr_code_id}", response_model=QRCodeResponse)
async def get_qr_code(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    qr_code_id: uuid.UUID
) -> Any:
    """
    Get a QR code by its ID.
    """
    # Use join to load the client relationship
    qr_code = session.exec(
        select(QRCode)
        .where(QRCode.id == qr_code_id)
    ).first()
    
    if not qr_code:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    # Check if user has permission to view this QR code
    user_client = session.exec(select(Client).where(Client.user_id == current_user.id)).first()
    
    # Allow if:
    # 1. User is an admin, or
    # 2. User is a client and is part of the client group, or
    # 3. User is a client and is an admin of the client group
    is_admin = current_user.is_superuser
    is_part_of_group = user_client and user_client.group_id == qr_code.client_group_id
    #is_group_admin = user_client and qr_code.client_group_id in [group.id for group in getattr(user_client, "group_admin", [])]
    
    if not (is_admin or is_part_of_group or current_user.admin_user):
        raise HTTPException(status_code=403, detail="You don't have permission to view this QR code")
    
    return qr_code 