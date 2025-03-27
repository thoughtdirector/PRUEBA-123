import json
from app.api.deps import CurrentUser, SessionDep
from fastapi import APIRouter, HTTPException, status

from app.models import Form, FormSubmission, SuccessResponse

router = APIRouter()

@router.post("/", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def create_form(
    *, session: SessionDep, current_user: CurrentUser,
    form_submission: FormSubmission,
    
):
    """
    Save form data to database.
    
    Returns the ID of the created form and a success message.
    """

    try:
        serialized_form_data = json.dumps(form_submission.form_data)
    except Exception:
        raise HTTPException(status_code=422, detail="Not valid JSON")
    
    # Create form object
    new_form = Form(
        form_type=form_submission.form_type,
        form_data=serialized_form_data,
        user_id=current_user.id
    )
    
    # Add to database and commit
    session.add(new_form)
    session.commit()
    session.refresh(new_form)
    
    # Return success response with form ID
    return SuccessResponse(
        success=True,
        message="Form saved successfully",
        data={"id": str(new_form.id)}
    )
